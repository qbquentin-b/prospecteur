import { NextRequest, NextResponse } from 'next/server';
import { detectCMS, fetchPageSpeed, calculateScore } from '@/lib/scanner';
import { Lead } from '@/types/lead';
import { logScanExecution, getOrCreateUser } from '@/lib/supabase';

// Helper to extract email and phone from text or basic HTML (basic fallback)
// For a real implementation, you'd use a robust scraping tool or Places details API.
function generateMockContact(name: string) {
  // Creating consistent random-ish contacts for the demo
  const domain = name.toLowerCase().replace(/[^a-z]/g, '') + '.com';
  return {
    phone: ['(555) ' + Math.floor(Math.random() * 900 + 100) + '-0199'],
    email: ['contact@' + domain],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get('sector');
  const location = searchParams.get('location');
  const radius = parseInt(searchParams.get('radius') || '5', 10);
  const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat') as string) : null;
  const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng') as string) : null;

  // Basic authentication using Authorization header
  const authHeader = req.headers.get('Authorization');
  let userEmail = 'demo_user@example.com';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    userEmail = authHeader.substring(7); // using the token directly as email for simplicity
  }

  if (!sector || !location) {
    return NextResponse.json({ error: 'Missing sector or location' }, { status: 400 });
  }

  // 1. Get/Create User and Log the execution to Supabase (Graceful Degradation)
  // We don't await this so it doesn't block the main thread if there are network issues (like ENOTFOUND).
  getOrCreateUser(userEmail).then(user => {
    const userId = user?.id || 'demo_user';
    return logScanExecution(userId, sector, location);
  }).catch(err => {
    console.error("Silent Supabase Error:", err);
  });

  // 2. Google Places API Search (Text Search - New API)
  // We use the new Places API endpoint as requested to ensure we get the websiteUri field.
  const API_KEY = process.env.GOOGLE_API_KEY;
  let places = [];

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
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.primaryTypeDisplayName,places.location'
        },
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
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
        lng: p.location?.longitude
      }));
    } catch (e) {
      console.error("Places API error, falling back to mock:", e);
    }
  }

  if (places.length === 0) {
    // Mock the Places response if no API key is set OR if fetch failed (Graceful Degradation)
    const mockCategory = sector.toLowerCase() === 'all' ? 'Business' : sector;
    places = Array.from({ length: 15 }).map((_, i) => ({
      place_id: `place_${i}`,
      name: `${mockCategory} ${location} ${i + 1}`,
      formatted_address: `123 Main St, ${location}`,
      rating: Math.random() * 2 + 3, // 3.0 to 5.0
      user_ratings_total: Math.floor(Math.random() * 200),
      // Randomly assign some a website
      website: Math.random() > 0.3 ? `https://example${i}.com` : undefined,
      category: mockCategory as string,
      // Provide some mock spread around the center
      lat: lat ? lat + (Math.random() - 0.5) * (radius / 111) : undefined,
      lng: lng ? lng + (Math.random() - 0.5) * (radius / (111 * Math.cos(lat || 0))) : undefined,
    }));
  }

  // 3. Parallel Enrichment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enrichedLeadsPromises = places.map(async (place: any, index: number): Promise<Lead> => {
    // Is GMB Claimed? Simulate scraping result or heuristic.
    // In a real app, you might look at 'business_status' or scrape the Maps URL.
    const isClaimed = Math.random() > 0.4; // 60% chance claimed

    const leadBase = {
      id: place.place_id || `id_${index}`,
      name: place.name,
      address: place.formatted_address || location as string,
      contact: generateMockContact(place.name),
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