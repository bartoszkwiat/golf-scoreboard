import { NextRequest, NextResponse } from "next/server";
import { EAGLE_API_BASE } from "@/lib/config";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  const format = request.nextUrl.searchParams.get("format") ?? "stb_netto";
  const classification = request.nextUrl.searchParams.get("classification") ?? "0";

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${EAGLE_API_BASE}/_tournament/livescore/get_livescore?id=${encodeURIComponent(
        id
      )}&format=${encodeURIComponent(format)}&classification=${encodeURIComponent(
        classification
      )}`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=15, stale-while-revalidate=30" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch livescore" }, { status: 502 });
  }
}
