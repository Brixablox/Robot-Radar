import { NextRequest, NextResponse } from 'next/server';
import { getTbaTeam, getStatboticsTeam, getDefaultYear } from '@/app/lib/frc';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamNumber: string }> }
) {
  try {
    const { teamNumber: rawTeamNumber } = await params;
    const teamNumber = parseInt(rawTeamNumber);
    if (isNaN(teamNumber) || teamNumber < 1 || teamNumber > 9999) {
      return NextResponse.json({ error: 'Invalid team number' }, { status: 400 });
    }

    const year = getDefaultYear();
    let tbaTeam = null;
    let sbTeam = null;

    // Statbotics always available (public API)
    sbTeam = await getStatboticsTeam(teamNumber).catch(() => null);

    // TBA optional (needs API key)
    try {
      tbaTeam = await getTbaTeam(teamNumber);
    } catch (tbaError) {
      console.warn('TBA fetch failed (add TBA_API_KEY to .env.local):', tbaError);
      tbaTeam = null;
    }

    if (!tbaTeam && !sbTeam) {
      return NextResponse.json({ 
        error: `Team ${teamNumber} not found in TBA or Statbotics`,
        apiStatus: 'no_data'
      }, { status: 404 });
    }

    const data = {
      teamNumber,
      year,
      name: tbaTeam?.nickname || sbTeam?.name || `Team ${teamNumber}`,
      location: tbaTeam ? {
        city: tbaTeam.city,
        state: tbaTeam.state_prov,
        country: tbaTeam.country,
      } : null,
      rookie_year: tbaTeam?.rookie_year || sbTeam?.rookie_year,
      epa: sbTeam?.norm_epa || null,
      record: sbTeam?.record || null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Team data API error:', error);
    return NextResponse.json({ 
      error: 'Server error - check console',
      details: error instanceof Error ? error.message : 'Unknown'
    }, { status: 500 });
  }
}

