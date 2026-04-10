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
const DEMO_SESSION_KEY = "pf_demo_session";
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "";

export default function Login() {
  const [email, setEmail] = useState("demo@prepflo.com");
  const [password, setPassword] = useState("PrepFlo2026!");
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

      localStorage.removeItem(DEMO_SESSION_KEY);
      localStorage.setItem(TOKEN_KEY, token);
      navigate("/");
    } catch {
      setError("Could not connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
  setError("");
  setLoading(true);

  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/api/auth/demo-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data: unknown = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
          continue;
        }
        const msg =
          data && typeof data === "object" && "error" in data
            ? String((data as { error: unknown }).error)
            : "Failed to start demo. Please try again.";
        setError(msg);
        setLoading(false);
        return;
      }

      const token =
        data && typeof data === "object" && "token" in data
          ? String((data as { token: unknown }).token)
          : null;

      if (!token) {
        setError("Unexpected response from server.");
        setLoading(false);
        return;
      }

      const demoSession = {
        expiresAt:
          data && typeof data === "object" && "expiresAt" in data
            ? String((data as { expiresAt: unknown }).expiresAt)
            : new Date(Date.now() + 4 * 60 * 1000).toISOString(),
      };

      localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(demoSession));
      localStorage.setItem(TOKEN_KEY, token);
      navigate("/");
      return;

    } catch {
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      setError("Could not connect to server. Please try again.");
    }
  }

  setLoading(false);
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

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleDemoLogin}
                disabled={loading}
              >
                Try It Out (Demo Mode)
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-5 rounded-md bg-secondary border border-border px-3 py-3 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Demo Mode
              </p>
              <p className="text-xs text-foreground">
                Click "Try It Out" to explore PrepFlo with sample data. Your session will last 4 minutes and changes won't be saved.
              </p>
            </div>

            {/* Demo credentials
            <div className="mt-2 rounded-md bg-secondary border border-border px-3 py-3 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Standard Credentials
              </p>
              <div className="space-y-0.5">
                <p className="text-xs text-foreground font-mono">demo@prepflo.com</p>
                <p className="text-xs text-foreground font-mono">PrepFlo2026!</p>
              </div>
            </div> */}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
