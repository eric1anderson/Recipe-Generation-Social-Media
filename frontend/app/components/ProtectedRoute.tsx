"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ allowedRoles, children }: { allowedRoles: boolean[], children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const validateUser = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/auth/verify", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Unauthorized");
        }

        const data = await response.json();

        if (!allowedRoles.includes(data.role)) {
          throw new Error("Forbidden");
        }

        setIsAuthorized(true);
      } catch (err) {
        setIsAuthorized(false);
        router.push("/");
      }
    };

    validateUser();
  }, [allowedRoles, router]);

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}