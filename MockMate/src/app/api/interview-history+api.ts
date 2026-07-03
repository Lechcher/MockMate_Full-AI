/**
 * Interview history API route
 * 
 * GET - Fetch user's interview history
 * POST - Create new history entry
 */

import { getServerClient } from '../../../lib/sanity/client';
import { verifyAuth0Token } from '../../../lib/auth/verifyToken';

export async function GET(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const client = getServerClient();

    const history = await client.fetch(
      `*[_type == "interviewHistory" && userId == $sub] | order(completedAt desc)`,
      { sub }
    );

    return new Response(JSON.stringify(history), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/interview-history error:', error);
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

    const historyEntry = await client.create({
      _type: 'interviewHistory',
      userId: sub,
      interviewId: body.interviewId,
      interviewTitle: body.interviewTitle,
      mode: body.mode,
      answers: body.answers,
      score: body.score,
      metrics: body.metrics,
      feedback: body.feedback,
      totalDuration: body.totalDuration,
      xpEarned: body.xpEarned,
      gemsEarned: body.gemsEarned,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(historyEntry), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/interview-history error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create history entry' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
