import { describe, expect, it } from "vitest";
import { NAME_MAX } from "@/lib/constants";
import {
  PASSWORD_MAX,
  PASSWORD_MIN,
  mapAuthError,
  safeNextPath,
  validateAuthForm,
} from "@/lib/auth";

describe("safeNextPath", () => {
  it("defaults empty values to the dashboard", () => {
    expect(safeNextPath()).toBe("/dashboard");
    expect(safeNextPath(null)).toBe("/dashboard");
    expect(safeNextPath("")).toBe("/dashboard");
  });

  it("allows same-origin relative paths", () => {
    expect(safeNextPath("/projects")).toBe("/projects");
    expect(safeNextPath("/dashboard/my-project")).toBe("/dashboard/my-project");
  });

  it("blocks open redirects", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/\\evil.example")).toBe("/dashboard");
    expect(safeNextPath("projects")).toBe("/dashboard");
  });
});

describe("validateAuthForm login", () => {
  it("accepts a valid login", () => {
    expect(
      validateAuthForm({
        mode: "login",
        email: "  user@example.com ",
        password: "secret1",
      }),
    ).toBeNull();
  });

  it("requires email and password", () => {
    expect(
      validateAuthForm({ mode: "login", email: "   ", password: "secret1" }),
    ).toBe("Email is required.");
    expect(
      validateAuthForm({ mode: "login", email: "user@example.com", password: "" }),
    ).toBe("Password is required.");
  });

  it("rejects malformed emails", () => {
    expect(
      validateAuthForm({ mode: "login", email: "not-an-email", password: "secret1" }),
    ).toBe("Enter a valid email address.");
    expect(
      validateAuthForm({ mode: "login", email: "user@domain", password: "secret1" }),
    ).toBe("Enter a valid email address.");
    expect(
      validateAuthForm({
        mode: "login",
        email: "user name@example.com",
        password: "secret1",
      }),
    ).toBe("Email cannot contain spaces.");
  });

  it("rejects short, long, and padded passwords", () => {
    expect(
      validateAuthForm({
        mode: "login",
        email: "user@example.com",
        password: "12345",
      }),
    ).toBe(`Password must be at least ${PASSWORD_MIN} characters.`);
    expect(
      validateAuthForm({
        mode: "login",
        email: "user@example.com",
        password: "x".repeat(PASSWORD_MAX + 1),
      }),
    ).toBe(`Password must be ${PASSWORD_MAX} characters or fewer.`);
    expect(
      validateAuthForm({
        mode: "login",
        email: "user@example.com",
        password: " secret1",
      }),
    ).toBe("Password cannot start or end with spaces.");
  });
});

describe("validateAuthForm signup", () => {
  const valid = {
    mode: "signup" as const,
    name: "Ada Lovelace",
    email: "ada@example.com",
    password: "secret1",
    confirmPassword: "secret1",
  };

  it("accepts a valid signup", () => {
    expect(validateAuthForm(valid)).toBeNull();
  });

  it("rejects blank or oversized names", () => {
    expect(validateAuthForm({ ...valid, name: "   " })).toBe("Name is required.");
    expect(validateAuthForm({ ...valid, name: "" })).toBe("Name is required.");
    expect(validateAuthForm({ ...valid, name: "a".repeat(NAME_MAX + 1) })).toBe(
      `Name must be ${NAME_MAX} characters or fewer.`,
    );
  });

  it("requires a matching confirmation password", () => {
    expect(validateAuthForm({ ...valid, confirmPassword: "" })).toBe(
      "Confirm your password.",
    );
    expect(validateAuthForm({ ...valid, confirmPassword: "other12" })).toBe(
      "Passwords do not match.",
    );
  });
});

describe("mapAuthError", () => {
  it("maps common provider errors to friendly copy", () => {
    expect(mapAuthError("Invalid login credentials")).toBe(
      "Incorrect email or password.",
    );
    expect(mapAuthError("User already registered")).toBe(
      "An account with this email already exists.",
    );
    expect(mapAuthError("email rate limit exceeded")).toBe(
      "Too many attempts. Please wait and try again.",
    );
  });

  it("keeps unknown messages", () => {
    expect(mapAuthError("Something else")).toBe("Something else");
    expect(mapAuthError("")).toBe("Authentication failed.");
  });
});
