"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const toastId = toast.loading("Signing you in...");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user?.role) {
        throw new Error("Invalid login response from server.");
      }

      if (!["ADMIN", "CONTRIBUTOR"].includes(user.role)) {
        throw new Error("Your account role is not supported.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      toast.success("Login successful! Welcome back.");

      router.replace(user.role === "ADMIN" ? "/admin" : "/contributor");
    } catch (err: unknown) {
      const errorMessage =
        typeof err === "object" && err !== null && "response" in err
          ? (
              err as {
                response?: { data?: { message?: string } };
              }
            ).response?.data?.message ||
            "Login failed. Please check your credentials."
          : "Unable to connect to the server. Please try again.";

      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#0B1F3A] p-10 text-white md:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-3">
              <ShieldAlert size={30} />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-wide">
                DISASTER RESPONSE
              </h1>
              <p className="text-xs tracking-[0.2em] text-blue-200">
                COORDINATION PLATFORM
              </p>
            </div>
          </div>

          <div className="relative space-y-5">
            <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-400/10 px-3 py-1 text-xs text-blue-200">
              RESPONSE • COORDINATE • RECOVER
            </span>
            <h2 className="font-[family-name:var(--font-heading)] text-5xl font-bold leading-tight">
              Every second matters.
            </h2>
            <p className="max-w-sm leading-7 text-slate-300">
              Coordinate disaster incidents, locate emergency resources, and
              keep response teams informed in real time.
            </p>
          </div>

          <p className="relative text-xs text-slate-400">
            Disaster Response Coordination Platform
          </p>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10 md:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-8 md:hidden">
              <ShieldAlert className="mb-3 text-[#0B1F3A]" size={36} />
              <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-[#0B1F3A]">
                DISASTER RESPONSE
              </h1>
            </div>

            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-700">
                Welcome back
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-slate-900">
                Sign in
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  autoComplete="username"
                  required
                  minLength={3}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0B1F3A] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle className="animate-spin" size={18} />}
                {loading ? "Signing in..." : "Sign in to dashboard"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">NEW CONTRIBUTOR?</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-600">
              Need an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-700 hover:text-blue-900"
              >
                Register here
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
