import { NextResponse } from "next/server";
import { getTbaEvents, getDefaultYear, TbaEvent } from "@/app/lib/frc";

export async function GET() {
  try {
    const year = getDefaultYear();
    const events: TbaEvent[] = await getTbaEvents(year);
    
    // Filter to official events only for cleaner list
    const officialEvents = events.filter(event => event.official);
    
    return NextResponse.json({ 
      events: officialEvents,
      year,
      count: officialEvents.length
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch events (check TBA_API_KEY?)",
      events: []
    }, { status: 500 });
  }
}

