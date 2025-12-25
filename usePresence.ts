import { useEffect, useState } from 'react';
import { rtdb, auth } from '../firebase';
import { ref, set, onDisconnect, onValue } from 'firebase/database';

export function usePresence(userId?: string) {
  const [online, setOnline] = useState<boolean>(false);
  const [lastSeen, setLastSeen] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    const myRef = ref(rtdb, `presence/${userId}`);
    // set online immediately and configure onDisconnect
    set(myRef, { state: 'online', lastUpdated: Date.now() });
    onDisconnect(myRef).set({ state: 'offline', lastUpdated: Date.now() });

    // listen to own presence for reliability (optional)
    const unsubscribe = onValue(myRef, (snap) => {
      const v = snap.val();
      if (!v) {
        setOnline(false);
        setLastSeen(null);
      } else {
        setOnline(v.state === 'online');
        if (v.lastUpdated) setLastSeen(v.lastUpdated);
      }
    });

    // cleanup
    return () => {
      // set offline on unload (backup for browsers that close unexpectedly)
      set(myRef, { state: 'offline', lastUpdated: Date.now() }).catch(() => {});
      unsubscribe();
    };
  }, [userId]);

  return { online, lastSeen };
}