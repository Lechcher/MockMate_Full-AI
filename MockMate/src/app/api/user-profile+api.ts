/**
 * User profile API route
 * 
 * GET - Fetch user profile
 * POST - Create user profile (first login)
 * PATCH - Update user profile
 */

import { getServerClient } from '../../../lib/sanity/client';
import { verifyAuth0Token } from '../../../lib/auth/verifyToken';

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

    return new Response(JSON.stringify(profile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('GET /api/user-profile error:', error);
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

    // Check if profile already exists
    const existing = await client.fetch(
      `*[_type == "userProfile" && userId == $sub][0]`,
      { sub }
    );

    if (existing) {
      return new Response(JSON.stringify(existing), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create new profile with initial gamification state
    const profile = await client.create({
      _type: 'userProfile',
      userId: sub,
      email: body.email,
      name: body.name,
      picture: body.picture,
      gamification: {
        streak: 0,
        streakLastUpdated: new Date().toISOString(),
        streakFreezeActive: false,
        xp: 0,
        level: 1,
        gems: 0,
        totalGemsEarned: 0,
        doubleXpActive: false,
        completedInterviewsToday: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(profile), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/user-profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PATCH(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const updates = await request.json();
    const client = getServerClient();

    // Find profile
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

    // Update profile
    const updated = await client
      .patch(profile._id)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return new Response(JSON.stringify(updated), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('PATCH /api/user-profile error:', error);
    return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
