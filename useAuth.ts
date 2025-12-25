import { useEffect, useState } from 'react';
import { auth, ensureAnonymousSignIn } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    // ensure there's an anonymous user
    ensureAnonymousSignIn().catch(console.error);
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return { user };
}