import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(
        auth, 
        (user) => {
          setUser(user);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Auth state change error:', error);
          setError(error.message);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error: any) {
      console.error('Auth initialization error:', error);
      setError(error.message);
      setLoading(false);
    }
  }, []);

  return { user, loading, error };
}
