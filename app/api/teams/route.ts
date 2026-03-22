import { NextRequest, NextResponse } from "next/server";
import { getTbaTeamsPage } from "@/app/lib/frc";

export async function GET(req: NextRequest) {
  try {
    const pageParam = req.nextUrl.searchParams.get("page") ?? "0";
    const page = Number(pageParam);

    if (!Number.isFinite(page) || page < 0) {
      return NextResponse.json({ error: "Invalid page" }, { status: 400 });
    }

    const teams = await getTbaTeamsPage(page);

    return NextResponse.json({
      teams,
      page,
      hasMore: teams.length > 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown teams fetch error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
