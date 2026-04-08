import { NextRequest, NextResponse } from 'next/server';
import { detectCMS, fetchPageSpeed, calculateScore } from '@/lib/scanner';
import { Lead } from '@/types/lead';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const location = searchParams.get('location');
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat') as string) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng') as string) : null;

  // Quadrillage Dynamique : On cherche désormais dans une "bounding box" (un carré)
  // définie par low_lat, low_lng (sud-ouest) et high_lat, high_lng (nord-est)
  const low_lat = searchParams.get('low_lat') ? parseFloat(searchParams.get('low_lat') as string) : null;
  const low_lng = searchParams.get('low_lng') ? parseFloat(searchParams.get('low_lng') as string) : null;
  const high_lat = searchParams.get('high_lat') ? parseFloat(searchParams.get('high_lat') as string) : null;
  const high_lng = searchParams.get('high_lng') ? parseFloat(searchParams.get('high_lng') as string) : null;

  // Fallback to radius if no bounding box is provided
  const radius = parseInt(searchParams.get('radius') || '5', 10);

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

  // 2. Google Places API Search (Text Search - New API)
  // We use the new Places API endpoint as requested to ensure we get the websiteUri field.
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let places: any[] = [];

  // We will need auth client for token checking and deduction
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createClient } = require('@supabase/supabase-js');
  const authSupabase = userId && authHeader ? createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    }
  ) : null;

  let availableTokens = Infinity; // Default if bypass

  // Check user tokens BEFORE starting the scan
  if (authSupabase && userId) {
    const { data: userProfile, error: profileError } = await authSupabase
      .from('users')
      .select('tokens')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile tokens", profileError);
    } else if (!userProfile) {
      console.warn(`No user profile found for user ${userId} in public.users table.`);
    } else {
      availableTokens = userProfile.tokens;
      if (availableTokens <= 0) {
        return NextResponse.json({ error: 'Plus de tokens disponibles. Veuillez recharger votre compte.' }, { status: 403 });
      }
    }
  }

  if (API_KEY) {
    // If sector is "All", simply search for businesses in the location
    const query = sector.toLowerCase() === 'all'
      ? `businesses`
      : `${sector}`;
    const placesUrl = `https://places.googleapis.com/v1/places:searchText`;

    try {
      // Build location restriction if bounding box is provided (rectangle search).
      // If not, fallback to locationBias with circle for older behaviors.
      // Note: locationRestriction with rectangle is strictly supported in Places API v1
      const locationRestriction = (low_lat != null && low_lng != null && high_lat != null && high_lng != null) ? {
        rectangle: {
          low: { latitude: low_lat, longitude: low_lng },
          high: { latitude: high_lat, longitude: high_lng }
        }
      } : undefined;

      const locationBias = (!locationRestriction && lat != null && lng != null) ? {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius * 1000.0 // meters
        }
      } : undefined;

      // We will loop to fetch multiple pages if we have enough tokens, up to a max of 60 results (3 pages)
      const targetMaxResults = Math.min(60, availableTokens === Infinity ? 60 : availableTokens);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fetchedPlaces: any[] = [];
      let pageToken = undefined;

      do {
        // Construct body
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bodyPayload: any = {
          textQuery: query // Just the sector/query when using a strict locationRestriction
        };

        if (locationRestriction) {
           bodyPayload.locationRestriction = locationRestriction;
           // The query should just be the sector without the location string when restricting to a rectangle
           bodyPayload.textQuery = query;
        } else if (locationBias) {
           bodyPayload.locationBias = locationBias;
           bodyPayload.textQuery = `${query} in ${location}`;
        } else {
           bodyPayload.textQuery = `${query} in ${location}`;
        }

        if (pageToken) {
          bodyPayload.pageToken = pageToken;
          // Google Places API requires a short delay before a nextPageToken becomes valid
          await new Promise(r => setTimeout(r, 2000));
        }

        const res = await fetch(placesUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.primaryTypeDisplayName,places.location,places.internationalPhoneNumber,places.googleMapsUri,nextPageToken'
          },
          body: JSON.stringify(bodyPayload)
        });

        const data = await res.json();

        if (data.error) {
           console.error("Places API error response:", data.error);
           break;
        } else {
          const currentPlaces = data.places || [];
          fetchedPlaces = [...fetchedPlaces, ...currentPlaces];
          pageToken = data.nextPageToken;
        }

        // Break early if we've reached our target or there's no more pages
      } while (pageToken && fetchedPlaces.length < targetMaxResults);

      // Enforce absolute limits based on tokens
      const limit = Math.min(fetchedPlaces.length, targetMaxResults);

      // Map the new API structure to our internal structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      places = fetchedPlaces.slice(0, limit).map((p: any) => ({
        place_id: p.id,
        name: p.displayName?.text || 'Unknown',
        formatted_address: p.formattedAddress || '',
        rating: p.rating || 0,
        user_ratings_total: p.userRatingCount || 0,
        website: p.websiteUri,
        category: p.primaryTypeDisplayName?.text || sector,
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        phone: p.internationalPhoneNumber,
        googleMapsUri: p.googleMapsUri
      }));

    } catch (e) {
      console.error("Places API error:", e);
    }
  }

  // Deduct tokens based on the number of results found
  if (authSupabase && userId && places.length > 0 && availableTokens !== Infinity) {
    const tokensCost = places.length;

    // Deduct tokens using secure RPC since UPDATE on tokens column is revoked
    const { error: updateError } = await authSupabase
      .rpc('deduct_tokens', { p_user_id: userId, p_amount: tokensCost });

    if (updateError) console.error("Error updating tokens via RPC", updateError);

    // Log execution
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
  } else if (!userId) {
    console.warn("Scan exécuté sans authentification (dev_bypass ou pas de token fourni). Aucun token déduit.");
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
        googleMapsUri: place.googleMapsUri,
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