"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sprout, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const { signInWithPassword, signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      let response;
      if (isSignUp) {
        response = await signUp({ email, password });
      } else {
        response = await signInWithPassword({ email, password });
      }
      if (response.error) {
        setError(response.error.message);
      } else if (response.data.session) {
        router.push("/");
      } else if (isSignUp) {
        setError(
          "Sign up successful! Please check your email to confirm your account."
        );
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    useEffect(() => {
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
    });
  };

  const handleFacebookLogin = async () => {
    useEffect(() => {
      supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: window.location.origin,
        },
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 w-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Sprout className="h-8 w-8 text-green-600 mr-2" />
            <h1 className="text-2xl font-bold text-foreground">AgriBudget</h1>
          </div>
          <CardTitle className="text-xl">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? "Create your account to start managing your farm budget"
              : "Sign in to your account to continue"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" variant="outline">
              {isSignUp ? "Create Account" : "Sign In"}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Sign up"}
            </Button>
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Or continue with
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full"
              >
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleFacebookLogin}
                className="w-full"
              >
                Facebook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
