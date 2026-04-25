import { NextRequest, NextResponse } from "next/server";

function extractUnsplashImageUrl(html: string) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /https:\/\/images\.unsplash\.com\/photo-[^"'&<)\s]+[^"'<)\s]*/i
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
    if (match?.[0]?.startsWith("https://images.unsplash.com/")) {
      return match[0];
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  const target = request.nextUrl.searchParams.get("url");
  if (!target) {
    return new NextResponse("Missing url", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (parsed.hostname !== "unsplash.com") {
    return NextResponse.redirect(parsed.toString(), 302);
  }

  const photoMatch = parsed.pathname.match(/^\/photos\/([^/]+)/);
  if (photoMatch) {
    const downloadUrl = new URL(
      `https://unsplash.com/photos/${photoMatch[1]}/download`
    );
    downloadUrl.searchParams.set("force", "true");
    downloadUrl.searchParams.set("w", "1200");
    downloadUrl.searchParams.set("q", "80");
    return NextResponse.redirect(downloadUrl.toString(), 302);
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      cache: "force-cache"
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch remote page", { status: 502 });
    }

    const html = await response.text();
    const imageUrl = extractUnsplashImageUrl(html);

    if (!imageUrl) {
      return new NextResponse("Could not resolve image", { status: 404 });
    }

    const resolved = new URL(imageUrl);
    resolved.searchParams.set("auto", "format");
    resolved.searchParams.set("fit", "crop");
    resolved.searchParams.set("w", "1200");
    resolved.searchParams.set("q", "80");

    return NextResponse.redirect(resolved.toString(), 302);
  } catch {
    return new NextResponse("Unexpected proxy error", { status: 500 });
  }
}
