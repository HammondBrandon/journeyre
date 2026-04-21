import { NextRequest, NextResponse } from "next/server";
import { getListingPhotos } from "@/lib/rets-client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { searchParams } = request.nextUrl;

  if (!id) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }

  const numParam = searchParams.get("num") ?? "0";
  const num = parseInt(numParam, 10);
  const useThumbnail = searchParams.get("type") === "ThNail";

  try {
    const photos = await getListingPhotos(id);

    if (photos.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    const photo = photos[Math.min(num, photos.length - 1)];
    const cdnUrl = useThumbnail ? photo.thumbnailUrl : photo.url;

    // Redirect to the public CDN URL — browser/CDN caches the image directly
    return NextResponse.redirect(cdnUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (err) {
    console.error("[Photo Route Error]", err);
    return new NextResponse(null, { status: 502 });
  }
}
