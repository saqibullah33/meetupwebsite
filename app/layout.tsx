import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/Navbar";
import { SetupBanner } from "@/components/SetupBanner";
import { MEETUP_NAME } from "@/lib/brand";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${MEETUP_NAME} — Project Voting`,
  description:
    "Showcase and vote on participant projects at the Supabase × Clerk × Devin Peshawar Meetup.",
};

export const viewport = {
  colorScheme: "light" as const,
  themeColor: "#fafafa",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="flex min-h-full flex-col bg-canvas text-body">
        <SetupBanner />
        <Navbar />
        <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-16">
          {children}
        </main>
        <footer className="border-t border-hairline bg-canvas px-6 py-16 text-sm text-body">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-ink">{MEETUP_NAME}</p>
            <p className="text-mute">
              Participant votes decide the ranking. No judges.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
