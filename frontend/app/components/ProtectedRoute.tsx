"use client";

import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: (0 | 1)[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { authenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authenticated) {
      router.push("/");
    } else if (role !== null && !allowedRoles.includes(role)) {
      router.push(role === 0 ? "/admin-page" : "/user-page");
    }
  }, [authenticated, role, router, allowedRoles]);

  if (!authenticated || role === null) {
    return <p>Loading...</p>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;