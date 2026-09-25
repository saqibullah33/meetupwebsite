import { NAME_MAX } from "@/lib/constants";
import { MEETUP_CITY, MEETUP_DATE, MEETUP_EYEBROW, MEETUP_NAME } from "@/lib/brand";

export function sanitizeCertificateName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (trimmed.length > NAME_MAX) return null;
  if (!/^[\p{L}\p{M}\p{N} .'-]+$/u.test(trimmed)) return null;
  return trimmed;
}

export function certificateFilename(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `peshawar-meetup-certificate-${slug || "participant"}.png`;
}

export function drawCertificate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  name: string,
) {
  ctx.fillStyle = "#fafafa";
  ctx.fillRect(0, 0, width, height);

  const mesh = ctx.createRadialGradient(width * 0.82, height * 0.22, 20, width * 0.72, height * 0.3, width * 0.45);
  mesh.addColorStop(0, "rgba(0, 124, 240, 0.22)");
  mesh.addColorStop(0.35, "rgba(121, 40, 202, 0.16)");
  mesh.addColorStop(0.65, "rgba(255, 0, 128, 0.1)");
  mesh.addColorStop(1, "rgba(250, 250, 250, 0)");
  ctx.fillStyle = mesh;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 48, width - 96, height - 96);
  ctx.strokeStyle = "#c9c9c9";
  ctx.lineWidth = 1;
  ctx.strokeRect(64, 64, width - 128, height - 128);

  ctx.fillStyle = "#8f8f8f";
  ctx.font = "500 22px Geist, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(MEETUP_EYEBROW.toUpperCase(), width / 2, 160);

  ctx.fillStyle = "#171717";
  ctx.font = "600 42px Geist, Arial, sans-serif";
  ctx.fillText("Certificate of Attendance", width / 2, 230);

  ctx.fillStyle = "#4d4d4d";
  ctx.font = "400 24px Geist, Arial, sans-serif";
  ctx.fillText("This certifies that", width / 2, 320);

  ctx.fillStyle = "#171717";
  ctx.font = "600 64px Geist, Arial, sans-serif";
  ctx.fillText(name, width / 2, 410);

  ctx.strokeStyle = "#171717";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 280, 430);
  ctx.lineTo(width / 2 + 280, 430);
  ctx.stroke();

  ctx.fillStyle = "#4d4d4d";
  ctx.font = "400 24px Geist, Arial, sans-serif";
  ctx.fillText("attended", width / 2, 490);

  ctx.fillStyle = "#171717";
  ctx.font = "600 28px Geist, Arial, sans-serif";
  ctx.fillText(MEETUP_NAME, width / 2, 540);

  ctx.fillStyle = "#8f8f8f";
  ctx.font = "400 20px Geist, Arial, sans-serif";
  ctx.fillText(`${MEETUP_CITY}  ·  ${MEETUP_DATE}`, width / 2, 590);
}

export async function downloadCertificatePng(name: string) {
  const width = 1600;
  const height = 1000;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Unable to create certificate.");
  }

  drawCertificate(ctx, width, height, name);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to create certificate."));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = certificateFilename(name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}
