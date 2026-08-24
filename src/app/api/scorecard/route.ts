import { NextRequest, NextResponse } from "next/server";
import { EAGLE_API_BASE } from "@/lib/config";

export async function GET(request: NextRequest) {
  const playerId = request.nextUrl.searchParams.get("player_id");

  if (!playerId) {
    return NextResponse.json({ error: "Missing player_id" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${EAGLE_API_BASE}/_tournament/scorecard/get_scorecard?player_id=${encodeURIComponent(
        playerId
      )}`,
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
    return NextResponse.json({ error: "Failed to fetch scorecard" }, { status: 502 });
  }
}
