"use client";

import { useState, useEffect } from "react";

interface AuthState {
  authenticated: boolean;
  role: 0 | 1 | null; // 0 admin, 1 user
}

export const useAuth = () => {
    const [auth, setAuth] = useState<AuthState>({ authenticated: false, role: null });

    useEffect(() => {
      const fetchAuth = async () => {
        try {

          const response = await fetch('http://127.0.0.1:5000/auth/verify', {
            method: 'GET',
            credentials: 'include',
          });
          if (response.ok) {
            const data = await response.json();
            setAuth({ authenticated: true, role: data.role });
          } else {
            setAuth({ authenticated: false, role: null });
          }
        } catch (err) {
          setAuth({ authenticated: false, role: null });
        }
      };

      fetchAuth();
    }, []);

    return auth;
};