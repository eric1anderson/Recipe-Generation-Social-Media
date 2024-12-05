"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://127.0.0.1:5000";

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>(""); // For signup
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState<boolean>(false); // Toggle state
  const router = useRouter();

  // Redirect if token is still in local storage
  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (data.role === true) {
            router.push("/user-page");
          } else if (data.role === false) {
            router.push("/admin");
          }
        }
      } catch (err) {
        console.log("Token invalid or verification failed:", err);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email, password }).toString(),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("username", data.name);
        localStorage.setItem("role", data.role);
        localStorage.setItem("access_token", data.access_token);

        if (data.role) {
          router.push("/user-page");
        } else {
          router.push("/admin");
        }
      } else {
        const data = await response.json();
        setError(data.detail || "Invalid email or password");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ email, password, name }).toString(),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("username", data.username)
        localStorage.setItem("access_token", data.access_token);

        if (data.role) {
          router.push("/user-page");
        } else {
          router.push("/admin");
        }
      } else {
        const data = await response.json();
        setError(data.detail || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md dark:bg-zinc-800">
        <div className="px-6 py-4">
          <h3 className="mt-3 text-xl font-medium text-center text-gray-600 dark:text-gray-200">
            Recipe App
          </h3>
          <p className="mt-1 text-center text-gray-500 dark:text-gray-400">
            {isSignup ? "Create your account" : "Login to your account"}
          </p>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="my-8">
            {error && (
              <div className="text-red-500 text-sm mb-4 text-center">{error}</div>
            )}
            {isSignup && (
              <div className="w-full mt-4">
                <input
                  className="block w-full px-4 py-2 mt-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="w-full mt-4">
              <input
                className="block w-full px-4 py-2 mt-2 text-gray-200 placeholder-gray-500 bg-white border rounded-lg dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-blue-300"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 mt-4 w-full text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-lime-600 rounded-lg hover:bg-lime-700 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50"
            >
              {isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
        </div>
        <div className="flex items-center justify-center py-4 text-center bg-gray-50 dark:bg-zinc-700">
          <span className="text-sm text-gray-600 dark:text-gray-200">
            {isSignup
              ? "Already have an account?"
              : "Don't have an account?"}{" "}
          </span>
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="mx-2 text-sm font-bold text-blue-500 dark:text-blue-400 hover:underline"
          >
            {isSignup ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
}
