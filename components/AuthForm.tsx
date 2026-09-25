"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { NAME_MAX } from "@/lib/constants";
import { mapAuthError, safeNextPath, validateAuthForm } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";

type AuthFormProps = {
  mode: "login" | "signup";
  nextPath?: string;
  initialError?: string | null;
};

export function AuthForm({
  mode,
  nextPath = "/dashboard",
  initialError,
}: AuthFormProps) {
  const router = useRouter();
  const redirectTo = safeNextPath(nextPath);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    const validationError = validateAuthForm({
      mode,
      name,
      email,
      password,
      confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setPending(true);
    setError("");

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const supabase = createClient();

      if (mode === "signup") {
        const trimmedName = name.trim();
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: { name: trimmedName, full_name: trimmedName },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password,
          });
          if (signInError) {
            throw new Error(signInError.message);
          }
        }

        router.push(redirectTo);
        router.refresh();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(
        mapAuthError(err instanceof Error ? err.message : "Authentication failed."),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="card mx-auto w-full max-w-md space-y-4 p-8"
    >
      <div>
        <h1 className="heading-lg">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-body">
          {mode === "signup"
            ? "Join the showcase, submit a project, and vote once."
            : "Log in to manage your project and vote."}
        </p>
      </div>

      {mode === "signup" ? (
        <label className="block space-y-1.5 text-sm text-ink">
          <span>Name</span>
          <input
            required
            maxLength={NAME_MAX}
            autoComplete="name"
            disabled={pending}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field"
          />
        </label>
      ) : null}

      <label className="block space-y-1.5 text-sm text-ink">
        <span>Email</span>
        <input
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          disabled={pending}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field"
        />
      </label>

      <PasswordField
        label="Password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
        disabled={pending}
      />

      {mode === "signup" ? (
        <PasswordField
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          disabled={pending}
        />
      ) : null}

      {error ? (
        <p role="alert" className="text-sm text-error">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn-pill w-full">
        {pending ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
      </button>

      <p className="text-center text-sm text-mute">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-link">
              Log in
            </Link>
          </>
        ) : (
          <>
            Need an account?{" "}
            <Link href="/signup" className="text-link">
              Sign up
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
