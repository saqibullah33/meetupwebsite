import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="space-y-4">
      <h1 className="heading-lg">Project not found</h1>
      <p className="text-body">
        This project may have been deleted or the link is incorrect.
      </p>
      <Link href="/projects" className="text-sm text-link">
        Back to projects
      </Link>
    </div>
  );
}
