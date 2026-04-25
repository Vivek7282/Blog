import { Role } from "@/lib/types";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function summarizeTextLocally(text: string, maxWords = 200) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (words.length <= maxWords) {
    return words.join(" ");
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export function excerpt(text: string, maxLength = 180) {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trim()}...`;
}

export function roleLabel(role: Role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function buildQueryString(
  entries: Record<string, string | number | undefined | null>
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(entries)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export function escapeLikeQuery(value: string) {
  return value.replace(/[,%]/g, " ");
}

export function normalizeImageUrl(input: string) {
  const value = input.trim();

  try {
    const url = new URL(value);

    if (url.hostname === "unsplash.com") {
      const match = url.pathname.match(/^\/photos\/([^/]+)/);
      if (match) {
        return url.toString();
      }
    }

    return url.toString();
  } catch {
    return value;
  }
}

export function resolveDisplayImageUrl(input: string) {
  const value = input.trim();

  try {
    const url = new URL(value);
    if (url.hostname === "unsplash.com") {
      return `/api/image-proxy?url=${encodeURIComponent(url.toString())}`;
    }

    return url.toString();
  } catch {
    return value;
  }
}
