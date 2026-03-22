import { NextRequest, NextResponse } from "next/server";
import { searchEvents, getDefaultYear, TbaEvent } from "@/app/lib/frc";

export async function GET(req: NextRequest) {
  try {
    const query = req.nextUrl.searchParams.get("q") || "";
    
    if (!query.trim()) {
      return NextResponse.json({ events: [], error: "Query required" }, { status: 400 });
    }

    const events: TbaEvent[] = await searchEvents(query);
    
    return NextResponse.json({ 
      events, 
      query,
      count: events.length 
    });
  } catch (error) {
    console.error("Events search error:", error);
    return NextResponse.json({ 
      error: "Search failed",
      events: []
    }, { status: 500 });
  }
}

