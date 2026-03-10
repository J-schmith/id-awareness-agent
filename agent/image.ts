import { config } from '@/lib/config';

const UNSPLASH_API = 'https://api.unsplash.com';

interface UnsplashPhoto {
  urls: { regular: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  links: { download_location: string };
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
}

/**
 * Fetch a relevant hero image from Unsplash for an awareness day email.
 *
 * Uses the Unsplash REST API directly (no SDK dependency issues).
 * Returns null if UNSPLASH_ACCESS_KEY is not configured or no results are found.
 */
export async function fetchAwarenessDayImage(params: {
  dayName: string;
  themeLabel: string;
  keywords?: string[];
}): Promise<{ imageUrl: string; imageAlt: string; imageCredit: string } | null> {
  const accessKey = config.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.log('[agent/image] No UNSPLASH_ACCESS_KEY configured, skipping image fetch');
    return null;
  }

  const queries = buildSearchQueries(params);

  for (const query of queries) {
    try {
      const url = new URL(`${UNSPLASH_API}/search/photos`);
      url.searchParams.set('query', query);
      url.searchParams.set('per_page', '1');
      url.searchParams.set('orientation', 'landscape');

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        console.error(`[agent/image] Unsplash API error: ${response.status} ${response.statusText}`, body);
        return null;
      }

      const data: UnsplashSearchResponse = await response.json();
      const photo = data.results[0];

      if (photo) {
        const imageUrl = `${photo.urls.regular}&w=600&fit=crop&h=250`;
        const imageAlt = photo.alt_description ?? photo.description ?? params.dayName;
        const imageCredit = `Photo by ${photo.user.name} on Unsplash`;

        // Trigger download tracking per Unsplash API guidelines (non-blocking)
        fetch(photo.links.download_location, {
          headers: { 'Authorization': `Client-ID ${accessKey}` },
        }).catch(() => {});

        console.log(`[agent/image] Found image for "${query}"`);
        return { imageUrl, imageAlt, imageCredit };
      }

      console.log(`[agent/image] No results for query: "${query}"`);
    } catch (err) {
      console.error(`[agent/image] Fetch failed for query "${query}":`, err);
      return null;
    }
  }

  return null;
}

function buildSearchQueries(params: {
  dayName: string;
  themeLabel: string;
  keywords?: string[];
}): string[] {
  const queries: string[] = [];

  if (params.keywords && params.keywords.length > 0) {
    queries.push(params.keywords.join(' '));
  }

  queries.push(params.dayName);
  queries.push(params.themeLabel);

  return queries;
}
