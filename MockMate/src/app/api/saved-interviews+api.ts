/**
 * Saved interviews API route
 * 
 * GET - Fetch user's saved interviews
 * POST - Save an interview
 * DELETE - Remove saved interview
 */

import { getServerClient } from '../../../lib/sanity/client';
import { verifyAuth0Token } from '../../../lib/auth/verifyToken';

export async function GET(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const client = getServerClient();

    const saved = await client.fetch(
      `*[_type == "savedInterview" && userId == $sub] | order(savedAt desc)`,
      { sub }
    );

    return new Response(JSON.stringify(saved), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/saved-interviews error:', error);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const body = await request.json();
    const client = getServerClient();

    // Check if already saved
    const existing = await client.fetch(
      `*[_type == "savedInterview" && userId == $sub && interviewId == $interviewId][0]`,
      { sub, interviewId: body.interviewId }
    );

    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const saved = await client.create({
      _type: 'savedInterview',
      userId: sub,
      interviewId: body.interviewId,
      savedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(saved), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/saved-interviews error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save interview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const url = new URL(request.url);
    const interviewId = url.searchParams.get('interviewId');

    if (!interviewId) {
      return new Response(JSON.stringify({ error: 'interviewId required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const client = getServerClient();

    // Find the saved interview
    const saved = await client.fetch(
      `*[_type == "savedInterview" && userId == $sub && interviewId == $interviewId][0]`,
      { sub, interviewId }
    );

    if (!saved) {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await client.delete(saved._id);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('DELETE /api/saved-interviews error:', error);
    return new Response(JSON.stringify({ error: 'Failed to remove saved interview' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
