import { NextRequest, NextResponse } from "next/server";
import { getTbaEventMatches, getEventCurrentStatus, TbaMatchSimple, TbaEventStatus } from "@/app/lib/frc";

export async function GET(req: NextRequest, { params }: { params: { eventKey: string } }) {
  try {
    const { eventKey } = params;
    
    const [matches, status] = await Promise.all([
      getTbaEventMatches(eventKey),
      getEventCurrentStatus(eventKey)
    ]);

    return NextResponse.json({ 
      eventKey,
      matches,
      status,
      currentMatch: status?.next_match || null
    });
  } catch (error) {
    console.error("Matches fetch error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch matches",
      matches: [],
      status: null
    }, { status: 500 });
  }
}

