/**
 * Gamification award API route
 * 
 * POST - Award XP/gems/streak with server-side validation
 */

import { getServerClient } from '../../../../lib/sanity/client';
import { verifyAuth0Token } from '../../../../lib/auth/verifyToken';

export async function POST(request: Request) {
  try {
    const { sub } = await verifyAuth0Token(request);
    const body = await request.json();
    const client = getServerClient();

    // Fetch current profile
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

    const currentGamification = profile.gamification;
    const today = new Date().toISOString().split('T')[0];

    // Calculate new values
    let newXP = currentGamification.xp + (body.xpDelta || 0);
    let newGems = currentGamification.gems + (body.gemsDelta || 0);
    let newTotalGemsEarned = currentGamification.totalGemsEarned + Math.max(0, body.gemsDelta || 0);
    let newStreak = currentGamification.streak;
    let newStreakLastUpdated = currentGamification.streakLastUpdated;
    let newStreakFreezeActive = currentGamification.streakFreezeActive;
    let newCompletedInterviewsToday = currentGamification.completedInterviewsToday;

    // Handle streak increment
    if (body.incrementStreak) {
      const lastInterviewDate = currentGamification.lastInterviewDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if this is the first interview today
      if (lastInterviewDate !== today) {
        // Check if streak should be incremented or reset
        if (lastInterviewDate === yesterdayStr) {
          // Consecutive day
          newStreak = currentGamification.streak + 1;
        } else if (currentGamification.streakFreezeActive) {
          // Streak freeze active, maintain streak
          newStreakFreezeActive = false; // Consume freeze
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }

        newStreakLastUpdated = new Date().toISOString();
      }
    }

    // Handle interview completion
    if (body.completeInterview) {
      newCompletedInterviewsToday = currentGamification.completedInterviewsToday + 1;
    }

    // Apply double XP if active
    if (currentGamification.doubleXpActive && body.xpDelta) {
      const expiresAt = currentGamification.doubleXpExpiresAt;
      if (expiresAt && new Date(expiresAt) > new Date()) {
        newXP += body.xpDelta; // Double the XP
      }
    }

    // Calculate new level
    const newLevel = Math.floor(newXP / 100) + 1;

    // Ensure gems don't go negative
    newGems = Math.max(0, newGems);

    // Update profile
    const updated = await client
      .patch(profile._id)
      .set({
        'gamification.xp': newXP,
        'gamification.level': newLevel,
        'gamification.gems': newGems,
        'gamification.totalGemsEarned': newTotalGemsEarned,
        'gamification.streak': newStreak,
        'gamification.streakLastUpdated': newStreakLastUpdated,
        'gamification.streakFreezeActive': newStreakFreezeActive,
        'gamification.completedInterviewsToday': newCompletedInterviewsToday,
        'gamification.lastInterviewDate': body.completeInterview ? today : currentGamification.lastInterviewDate,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return new Response(JSON.stringify(updated.gamification), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('POST /api/gamification/award error:', error);
    return new Response(JSON.stringify({ error: 'Failed to award gamification' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
