/**
 * Gamification state API route
 * 
 * GET - Fetch current gamification state for hydration
 */

import { getServerClient } from '../../../../lib/sanity/client';
import { verifyAuth0Token } from '../../../../lib/auth/verifyToken';

export async function GET(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const client = getServerClient();

    const profile = await client.fetch(
      `*[_type == "userProfile" && userId == $sub][0]`,
      { sub }
    );

    if (!profile) {
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(profile.gamification), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/gamification/state error:', error);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
