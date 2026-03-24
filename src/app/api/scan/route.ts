import { NextRequest, NextResponse } from 'next/server';
import { detectCMS, fetchPageSpeed, calculateScore } from '@/lib/scanner';
import { Lead } from '@/types/lead';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const location = searchParams.get('location');
  const radius = parseInt(searchParams.get('radius') || '5', 10);
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat') as string) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng') as string) : null;

  if (!sector || !location) {
    return NextResponse.json({ error: 'Missing sector or location' }, { status: 400 });
  }

  // 1. Check User Tokens and Authenticate
  // We use the auth headers from the request to instantiate an authenticated supabase client
  // or use the global one but properly pass the access token to avoid RLS issues.
  let userId = null;
  const authHeader = req.headers.get('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      userId = user.id;
    }
  }

  // Token management logic
  if (userId && authHeader) {
    // Use the JWT to bypass anon restrictions for RLS policies
    // For sensitive updates like tokens, a service_role key or SECURITY DEFINER RPC is preferred.
    // Assuming the RLS permits the user to update their own row (or a subset of columns) via this token.

    // Usually in NextJS server components, you create a new client.
    // Here we're using the standard client but we'll fetch with the explicit user context
    // Though for true security against token forging, an RPC function `deduct_token` is better.
    // For now we use the global client with a simple query but note the security implications.

    // Create a new client authenticated with the user's token for this request
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@supabase/supabase-js');
    const authSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    const { data: userProfile, error: profileError } = await authSupabase
      .from('users')
      .select('tokens')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile tokens", profileError);
    } else if (!userProfile) {
      console.warn(`No user profile found for user ${userId} in public.users table. Skipping token deduction.`);
    } else {
      if (userProfile.tokens <= 0) {
        return NextResponse.json({ error: 'Plus de tokens disponibles. Veuillez recharger votre compte.' }, { status: 403 });
      }

      // Deduct 1 token and log the scan
      const { error: updateError } = await authSupabase
        .from('users')
        .update({ tokens: userProfile.tokens - 1 })
        .eq('id', userId);

      if (updateError) console.error("Error updating tokens", updateError);

      const { error: logError } = await authSupabase
        .from('scan_executions')
        .insert({
          user_id: userId,
          sector,
          location,
          radius_km: radius,
          lat,
          lng
        });

      if (logError) console.error("Error logging scan execution", logError);
    }
  } else {
    console.warn("Scan exécuté sans authentification (dev_bypass ou pas de token fourni). Aucun token déduit.");
  }

  // 2. Google Places API Search (Text Search - New API)
  // We use the new Places API endpoint as requested to ensure we get the websiteUri field.
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let places: any[] = [];

  if (API_KEY) {
    // If sector is "All", simply search for businesses in the location
    const query = sector.toLowerCase() === 'all'
      ? `businesses`
      : `${sector}`;
    const placesUrl = `https://places.googleapis.com/v1/places:searchText`;

    try {
      // Build location bias if lat/lng are provided. locationBias is better for searchText.
      const locationBias = (lat != null && lng != null) ? {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius * 1000.0 // meters
        }
      } : undefined;

      // Construct body
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyPayload: any = {
        textQuery: `${query} in ${location}` // Fallback text query for better results sometimes
      };

      if (locationBias) {
         bodyPayload.locationBias = locationBias;
         // When using location bias, textQuery alone might be enough or we just use the query
         bodyPayload.textQuery = query;
      }

      const res = await fetch(placesUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.primaryTypeDisplayName,places.location,places.internationalPhoneNumber'
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();

      if (data.error) {
         console.error("Places API error response:", data.error);
      } else {
        // Map the new API structure to our internal structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        places = (data.places || []).slice(0, 20).map((p: any) => ({
          place_id: p.id,
          name: p.displayName?.text || 'Unknown',
          formatted_address: p.formattedAddress || '',
          rating: p.rating || 0,
          user_ratings_total: p.userRatingCount || 0,
          website: p.websiteUri,
          category: p.primaryTypeDisplayName?.text || sector,
          lat: p.location?.latitude,
          lng: p.location?.longitude,
          phone: p.internationalPhoneNumber
        }));
      }
    } catch (e) {
      console.error("Places API error:", e);
    }
  }

  // 3. Parallel Enrichment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrichedLeadsPromises = places.map(async (place: any, index: number): Promise<Lead> => {
    // Is GMB Claimed? In a real app, you might look at 'business_status' or scrape the Maps URL.
    // Since Google Places API Text Search doesn't return claimed status, we default to false if no website or true if website exists.
    const isClaimed = !!place.website;

    const leadBase = {
      id: place.place_id || `id_${index}`,
      name: place.name,
      address: place.formatted_address || location as string,
      contact: {
         phone: place.phone ? [place.phone] : [],
         email: []
      },
      lat: place.lat,
      lng: place.lng,
      googleBusiness: {
        isClaimed,
        rating: place.rating || 0,
        reviewCount: place.user_ratings_total || 0,
        category: place.category as string,
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let techAudit: any = {
      hasWebsite: false,
      technologies: [] as string[],
    };

    if (place.website) {
      // Run CMS and PageSpeed in parallel
      const [cmsResult, pageSpeedResult] = await Promise.allSettled([
        detectCMS(place.website),
        fetchPageSpeed(place.website),
      ]);

      const cms = cmsResult.status === 'fulfilled' ? cmsResult.value : undefined;
      const pageSpeedScore = pageSpeedResult.status === 'fulfilled' ? pageSpeedResult.value : undefined;

      techAudit = {
        hasWebsite: true,
        website: place.website,
        cms,
        pageSpeedScore,
        isMobileOptimized: pageSpeedScore ? pageSpeedScore > 50 : undefined,
        technologies: cms ? [cms] : [],
      };
    }

    const leadWithoutScore = { ...leadBase, techAudit };

    // 4. Calculate final score
    const opportunityScore = Math.min(calculateScore(leadWithoutScore), 10);

    return {
      ...leadWithoutScore,
      opportunityScore,
    };
  });

  const leads = await Promise.all(enrichedLeadsPromises);

  // Return formatted array matching the `Lead` interface
  return NextResponse.json(leads);
}