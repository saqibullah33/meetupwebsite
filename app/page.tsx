import Link from "next/link";
import { MEETUP_EYEBROW, MEETUP_NAME } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden">
        <div className="hero-mesh" aria-hidden />
        <div className="relative max-w-3xl pt-8">
          <p className="eyebrow">{MEETUP_EYEBROW}</p>
          <h1 className="heading-xl mt-4">
            Show your project.
            <br />
            Vote for the best.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-6 text-body">
            {MEETUP_NAME} is a participant showcase. Submit one project, browse
            everyone else&apos;s work, and cast a single vote. The ranking is
            live, public, and decided only by the room.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/projects" className="btn-pill">
              Browse projects
            </Link>
            <Link href="/signup" className="btn-pill-secondary">
              Join the meetup
            </Link>
            <Link href="/leaderboard" className="px-3 py-3 text-sm text-body">
              View leaderboard
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Create an account",
            body: "Sign up with your name, email, and password.",
          },
          {
            step: "02",
            title: "Submit one project",
            body: "Add a title, description, live URL, and category.",
          },
          {
            step: "03",
            title: "Vote once",
            body: "Pick another participant’s project. Votes are permanent.",
          },
        ].map((item) => (
          <div key={item.step} className="card p-6">
            <p className="eyebrow">{item.step}</p>
            <h2 className="heading-md mt-3">{item.title}</h2>
            <p className="mt-2 text-sm leading-5 text-body">{item.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
