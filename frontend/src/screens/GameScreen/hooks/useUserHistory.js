import { useState, useEffect } from 'react';
	
export function useUserHistory(username) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchUserHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/${username}/history/`);
        if (response.ok) {
          const data = await response.json();
          
          // Calculate current streak from recent matches
          let currentStreak = 0;
          for (const match of data.recent_matches) {
            if (match.result === 'win') {
              currentStreak++;
            } else {
              break; // Streak ends on first non-win
            }
          }

          setUserStats({
            ...data.statistics,
            current_streak: currentStreak,
            recent_matches: data.recent_matches
          });
        }
      } catch (error) {
        console.error('Error fetching user history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [username]);

  return { userStats, loading };
}