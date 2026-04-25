import Link from "next/link";
import { buildQueryString } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  search
}: {
  currentPage: number;
  totalPages: number;
  search?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <Link
        href={buildQueryString({
          page: Math.max(1, currentPage - 1),
          q: search || undefined
        })}
        aria-disabled={currentPage <= 1}
        className={currentPage <= 1 ? "disabled-link" : ""}
      >
        Previous
      </Link>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <Link
        href={buildQueryString({
          page: Math.min(totalPages, currentPage + 1),
          q: search || undefined
        })}
        aria-disabled={currentPage >= totalPages}
        className={currentPage >= totalPages ? "disabled-link" : ""}
      >
        Next
      </Link>
    </div>
  );
}
