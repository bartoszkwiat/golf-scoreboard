import { NextRequest, NextResponse } from "next/server";
import { EAGLE_API_BASE } from "@/lib/config";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${EAGLE_API_BASE}/_tournament/tournament/get_tournament?id=${encodeURIComponent(id)}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch tournament" }, { status: 502 });
  }
}
