import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="card empty-state">
      <h1>Post not found</h1>
      <p>The resource you requested does not exist or has been removed.</p>
      <Link href="/" className="button-link">
        Return home
      </Link>
    </div>
  );
}
