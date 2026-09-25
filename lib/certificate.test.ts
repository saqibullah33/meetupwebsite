import { describe, expect, it } from "vitest";
import { certificateFilename, sanitizeCertificateName } from "@/lib/certificate";

describe("sanitizeCertificateName", () => {
  it("trims and accepts a normal name", () => {
    expect(sanitizeCertificateName("  Ada Lovelace  ")).toBe("Ada Lovelace");
  });

  it("rejects blank or oversized names", () => {
    expect(sanitizeCertificateName("   ")).toBeNull();
    expect(sanitizeCertificateName("")).toBeNull();
    expect(sanitizeCertificateName("a".repeat(81))).toBeNull();
  });

  it("rejects names with unsafe characters", () => {
    expect(sanitizeCertificateName("Ada <script>")).toBeNull();
    expect(sanitizeCertificateName("http://evil.com")).toBeNull();
  });
});

describe("certificateFilename", () => {
  it("builds a safe download name", () => {
    expect(certificateFilename("Ada Lovelace")).toBe(
      "peshawar-meetup-certificate-ada-lovelace.png",
    );
  });
});
