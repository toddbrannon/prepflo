import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const TOKEN_KEY = "pf_token";
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export default function Login() {
  const [email, setEmail] = useState("demo@prepflo.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Login failed. Please try again.";
        setError(msg);
        return;
      }

      const token =
        data && typeof data === "object" && "token" in data
          ? String((data as { token: unknown }).token)
          : null;

      if (!token) {
        setError("Unexpected response from server.");
        return;
      }

      localStorage.setItem(TOKEN_KEY, token);
      navigate("/");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Branding */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="hsl(222 18% 9%)" strokeWidth={2.5}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-heading text-2xl font-semibold tracking-wide text-foreground">
            PrepFlo
          </span>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Sign in</CardTitle>
            <CardDescription>Access your event prep dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 rounded-md bg-secondary border border-border px-3 py-3 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Demo Credentials
              </p>
              <div className="space-y-0.5">
                <p className="text-xs text-foreground font-mono">demo@prepflo.com</p>
                <p className="text-xs text-foreground font-mono">PrepFlo2026!</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
