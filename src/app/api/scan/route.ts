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
  // En production, il est recommandé de passer un JWT valide dans l'en-tête Authorization.
  // Pour le démonstrateur "dev_bypass", on utilise une identification simplifiée,
  // mais une vraie appli devrait utiliser un auth middleware robuste.
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
  if (userId) {
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('tokens')
      .eq('id', userId)
      .single();

    if (profileError || !userProfile) {
      console.error("Error fetching profile tokens", profileError);
    } else {
      if (userProfile.tokens <= 0) {
        return NextResponse.json({ error: 'Plus de tokens disponibles. Veuillez recharger votre compte.' }, { status: 403 });
      }

      // Deduct 1 token and log the scan
      const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: userProfile.tokens - 1 })
        .eq('id', userId);

      if (updateError) console.error("Error updating tokens", updateError);

      const { error: logError } = await supabase
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
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let places: any[] = [];

  if (API_KEY) {
    // If sector is "All", simply search for businesses in the location
    const query = sector.toLowerCase() === 'all'
      ? `businesses`
      : `${sector}`;
    const placesUrl = `https://places.googleapis.com/v1/places:searchText`;

    try {
      // Build location restriction if lat/lng are provided
      const locationRestriction = (lat != null && lng != null) ? {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: radius * 1000.0 // meters
        }
      } : undefined;

      // Construct body with or without location restriction
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bodyPayload: any = {
        textQuery: `${query} in ${location}` // Fallback text query for better results sometimes
      };

      if (locationRestriction) {
         bodyPayload.locationRestriction = locationRestriction;
         // When using location restriction, textQuery alone might be enough or we just use the query
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