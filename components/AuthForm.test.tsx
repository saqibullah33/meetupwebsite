import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/AuthForm";

const push = vi.fn();
const refresh = vi.fn();
const signUp = vi.fn();
const signInWithPassword = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp,
      signInWithPassword,
    },
  }),
}));

function getInput(label: string) {
  return screen.getByLabelText(label, { selector: "input" });
}

async function fillSignup(
  user: ReturnType<typeof userEvent.setup>,
  values?: Partial<{
    name: string;
    email: string;
    password: string;
    confirm: string;
  }>,
) {
  await user.type(getInput("Name"), values?.name ?? "Ada");
  await user.type(getInput("Email"), values?.email ?? "ada@example.com");
  await user.type(getInput("Password"), values?.password ?? "secret1");
  await user.type(getInput("Confirm password"), values?.confirm ?? "secret1");
}

describe("AuthForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    push.mockReset();
    refresh.mockReset();
    signUp.mockReset();
    signInWithPassword.mockReset();
  });

  it("shows name and confirm-password fields only on signup", () => {
    const { rerender } = render(<AuthForm mode="login" />);
    expect(screen.queryByLabelText("Name", { selector: "input" })).toBeNull();
    expect(
      screen.queryByLabelText("Confirm password", { selector: "input" }),
    ).toBeNull();

    rerender(<AuthForm mode="signup" />);
    expect(getInput("Name")).toBeInTheDocument();
    expect(getInput("Confirm password")).toBeInTheDocument();
  });

  it("toggles password visibility without changing the value or submitting", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    const password = getInput("Password");
    await user.type(password, "secret1");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(password).toHaveAttribute("type", "text");
    expect(password).toHaveValue("secret1");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(password).toHaveAttribute("type", "password");
    expect(signInWithPassword).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("blocks invalid login before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="login" />);

    await user.type(getInput("Email"), "not-an-email");
    await user.type(getInput("Password"), "123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Enter a valid email address.",
    );
    expect(signInWithPassword).not.toHaveBeenCalled();
  });

  it("rejects mismatched signup passwords", async () => {
    const user = userEvent.setup();
    render(<AuthForm mode="signup" />);
    await fillSignup(user, { confirm: "secret2" });
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Passwords do not match.",
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("signs in with a sanitized redirect and maps provider errors", async () => {
    const user = userEvent.setup();
    signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    render(<AuthForm mode="login" nextPath="//evil.example" />);
    await user.type(getInput("Email"), "ada@example.com");
    await user.type(getInput("Password"), "secret1");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret1",
    });
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password.",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("creates an account and redirects after a successful signup", async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue({
      data: { session: { access_token: "tok" } },
      error: null,
    });

    render(<AuthForm mode="signup" nextPath="/projects" />);
    await fillSignup(user, { name: "  Ada  ", email: "  Ada@Example.com " });
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(signUp).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret1",
      options: { data: { name: "Ada", full_name: "Ada" } },
    });
    expect(push).toHaveBeenCalledWith("/projects");
    expect(refresh).toHaveBeenCalled();
  });

  it("signs in after signup when no session is returned", async () => {
    const user = userEvent.setup();
    signUp.mockResolvedValue({ data: { session: null }, error: null });
    signInWithPassword.mockResolvedValue({ error: null });

    render(<AuthForm mode="signup" />);
    await fillSignup(user);
    await user.click(screen.getByRole("button", { name: "Sign up" }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "secret1",
    });
    expect(push).toHaveBeenCalledWith("/dashboard");
  });
});
