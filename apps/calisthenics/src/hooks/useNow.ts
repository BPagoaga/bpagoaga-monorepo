import { useEffect, useState } from 'react';

/** The current time, refreshed every `intervalMs` (running clocks). Syncs with a timer, hence the effect. */
export const useNow = (intervalMs = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);
  return now;
};
