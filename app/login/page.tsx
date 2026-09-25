import { AuthForm } from "@/components/AuthForm";
import { safeNextPath } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeNextPath(params.next);

  const initialError =
    params.error === "auth"
      ? "Could not complete sign-in. Please try again."
      : params.reason === "vote"
        ? "Please log in to vote."
        : null;

  return (
    <AuthForm mode="login" nextPath={nextPath} initialError={initialError} />
  );
}
