import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CertificateDownload } from "@/components/CertificateDownload";

const downloadCertificatePng = vi.fn();

vi.mock("@/lib/certificate", async () => {
  const actual = await vi.importActual<typeof import("@/lib/certificate")>(
    "@/lib/certificate",
  );
  return {
    ...actual,
    downloadCertificatePng: (...args: unknown[]) =>
      downloadCertificatePng(...args),
  };
});

afterEach(() => {
  cleanup();
  downloadCertificatePng.mockReset();
});

describe("CertificateDownload", () => {
  it("asks for a name before downloading", async () => {
    const user = userEvent.setup();
    render(<CertificateDownload />);

    await user.click(screen.getByRole("button", { name: "Download certificate" }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Enter your name as you want it on the certificate.",
    );
    expect(downloadCertificatePng).not.toHaveBeenCalled();
  });

  it("downloads a certificate for a valid name", async () => {
    const user = userEvent.setup();
    downloadCertificatePng.mockResolvedValue(undefined);
    render(<CertificateDownload />);

    await user.type(screen.getByLabelText("Your name"), "  Ada Lovelace  ");
    await user.click(screen.getByRole("button", { name: "Download certificate" }));

    expect(downloadCertificatePng).toHaveBeenCalledWith("Ada Lovelace");
  });
});
