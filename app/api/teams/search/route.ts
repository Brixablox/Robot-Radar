import { NextRequest, NextResponse } from "next/server";
import { searchTeams, getStatboticsTeam } from "@/app/lib/frc";
import type { TbaTeamSimple } from "@/app/lib/frc";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "";
    
    if (!query.trim()) {
      return NextResponse.json({ teams: [], error: "Query required" }, { status: 400 });
    }

    let teams: TbaTeamSimple[] = await searchTeams(query);

    // Fetch EPA data in parallel (limit to first 100 for perf)
    const limitedTeams = teams.slice(0, 100);
    await Promise.all(
      limitedTeams.map(async (team) => {
        const epaData = await getStatboticsTeam(team.team_number);
        team.epa = epaData?.norm_epa ?? null;
      })
    );

    return NextResponse.json({ 
      teams, 
      query,
      count: teams.length 
    });
  } catch (error) {
    console.error("Teams search error:", error);
    return NextResponse.json({ 
      error: "Search failed",
      teams: []
    }, { status: 500 });
  }
}

