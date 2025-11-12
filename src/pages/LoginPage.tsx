import React, { useState } from "react";
import { login as loginService } from "../services/api";
import { useNavigate } from "react-router-dom";

interface LoginPageProps {
  onLogin: (token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    const result = await loginService(username, password);
    if (result.token) {
      onLogin(result.token);
      navigate("/home");
    } else {
      setErrorMessage(result.message ?? "Login failed. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-sky-500 px-6 py-10 text-slate-800">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <svg
              viewBox="0 0 200 200"
              className="h-11 w-11 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 15 C60 70 55 100 100 165 C145 100 140 70 100 15 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M100 60 C90 90 90 115 100 135"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <circle cx="100" cy="60" r="12" fill="currentColor" />
              <circle cx="85" cy="95" r="12" fill="currentColor" />
              <circle cx="115" cy="115" r="12" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Smart Oil Meter Pro
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Unified Portal &mdash; Secure Sign in
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-600"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-600"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 rounded-xl border border-slate-200 px-4 text-sm transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
              placeholder="Enter your password"
            />
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600"
            >
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-600 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {isLoading ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in…
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Smart Oil Meter Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
