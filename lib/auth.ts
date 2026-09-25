import { NAME_MAX } from "@/lib/constants";

export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 72;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function safeNextPath(path?: string | null): string {
  if (!path) return "/dashboard";
  if (!path.startsWith("/")) return "/dashboard";
  if (path.startsWith("//")) return "/dashboard";
  if (path.includes("\\") || path.includes("://")) return "/dashboard";
  return path;
}

export type AuthFormValues = {
  mode: "login" | "signup";
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export function validateAuthForm(values: AuthFormValues): string | null {
  if (values.mode === "signup") {
    const trimmedName = (values.name ?? "").trim();
    if (!trimmedName) {
      return "Name is required.";
    }
    if (trimmedName.length > NAME_MAX) {
      return `Name must be ${NAME_MAX} characters or fewer.`;
    }
  }

  const rawEmail = values.email ?? "";
  const trimmedEmail = rawEmail.trim().toLowerCase();
  if (!trimmedEmail) {
    return "Email is required.";
  }
  if (/\s/.test(rawEmail.trim())) {
    return "Email cannot contain spaces.";
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    return "Enter a valid email address.";
  }

  const password = values.password ?? "";
  if (!password) {
    return "Password is required.";
  }
  if (password !== password.trim()) {
    return "Password cannot start or end with spaces.";
  }
  if (password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  }

  if (values.mode === "signup") {
    if (!values.confirmPassword) {
      return "Confirm your password.";
    }
    if (values.confirmPassword !== password) {
      return "Passwords do not match.";
    }
  }

  return null;
}

export function mapAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Incorrect email or password.";
  }
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "An account with this email already exists.";
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait and try again.";
  }
  return message || "Authentication failed.";
}
