import "server-only";

const TBA_BASE = "https://www.thebluealliance.com/api/v3";
const SB_BASE = "https://api.statbotics.io/v3";

export type TbaTeamSimple = {
  key: string;
  team_number: number;
  nickname?: string | null;
  name?: string | null;
  school_name?: string | null;
  city?: string | null;
  state_prov?: string | null;
  country?: string | null;
  epa?: {
    current?: number;
    recent?: number;
    max?: number;
  } | null;
};

export type TbaTeam = TbaTeamSimple & {
  rookie_year?: number | null;
  website?: string | null;
};

export type TbaEventSimple = {
  key: string;
  name: string;
  city?: string | null;
  state_prov?: string | null;
  country?: string | null;
};

export type TbaEvent = TbaEventSimple & {
  year: string;
  event_code: string;
  event_type_string: string;
  short_name: string;
  start_date: string;
  end_date: string;
  official: boolean;
};

export type TbaMatchSimple = {
  key: string;
  comp_level: string;
  match_number: number;
  set_number: number;
  alliances: {
    red: {
      team_keys: string[];
      score: number;
    };
    blue: {
      team_keys: string[];
      score: number;
    };
  };
  winning_alliance: string;
  time_string: string;
  predicted_time: number;
};

export type TbaEventStatus = {
  qual?: {
    ranking?: {
      rank?: number | null;
    } | null;
  } | null;
  playoffs?: {
    status: string;
  } | null;
  overall_status_str?: string | null;
  next_match?: {
    key: string;
    time_string: string;
  } | null;
};

export type TbaAward = {
  name: string;
  event_key?: string | null;
};

export type TbaMedia = {
  type: string;
  foreign_key: string;
  direct_url?: string | null;
  view_url?: string | null;
};

export type StatboticsTeam = {
  team: number;
  name?: string | null;
  rookie_year?: number | null;
  record?: {
    wins?: number;
    losses?: number;
    ties?: number;
    winrate?: number;
  };
  norm_epa?: {
    current?: number;
    recent?: number;
    max?: number;
  };
};

export type StatboticsTeamYear = {
  team: number;
  year: number;
  record?: {
    wins?: number;
    losses?: number;
    ties?: number;
  };
  norm_epa?: {
    current?: number;
    recent?: number;
    max?: number;
  };
};

export function getDefaultYear(): number {
  return Number(process.env.NEXT_PUBLIC_DEFAULT_FRC_YEAR || "2026");
}

function getTbaHeaders() {
  const apiKey = process.env.TBA_API_KEY;

  if (!apiKey) {
    throw new Error("Missing TBA_API_KEY in .env.local");
  }

  return {
    "X-TBA-Auth-Key": apiKey,
    Accept: "application/json",
  };
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${response.statusText}. Response: ${errorText.slice(0, 200)} for ${url.slice(-50)}`);
  }

  return response.json() as Promise<T>;
}

export async function getTbaTeamsPage(pageNum: number): Promise<TbaTeamSimple[]> {
  const url = `https://www.thebluealliance.com/api/v3/teams/${pageNum}/simple`;

  return fetchJson<TbaTeamSimple[]>(url, {
    headers: getTbaHeaders(),
    cache: "no-store",
  });
}

export async function getTbaTeam(teamNumber: number): Promise<TbaTeam> {
  return fetchJson<TbaTeam>(`${TBA_BASE}/team/frc${teamNumber}`, {
    headers: getTbaHeaders(),
    next: { revalidate: 3600 },
  });
}

export async function getTbaTeamEventsSimple(
  teamNumber: number,
  year: number = getDefaultYear()
): Promise<TbaEventSimple[]> {
  return fetchJson<TbaEventSimple[]>(
    `${TBA_BASE}/team/frc${teamNumber}/events/${year}/simple`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 300 },
    }
  );
}

export async function getTbaTeamEventStatuses(
  teamNumber: number,
  year: number = getDefaultYear()
): Promise<Record<string, TbaEventStatus>> {
  return fetchJson<Record<string, TbaEventStatus>>(
    `${TBA_BASE}/team/frc${teamNumber}/events/${year}/statuses`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 300 },
    }
  );
}

export async function getTbaTeamAwards(
  teamNumber: number,
  year: number = getDefaultYear()
): Promise<TbaAward[]> {
  return fetchJson<TbaAward[]>(
    `${TBA_BASE}/team/frc${teamNumber}/awards/${year}`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 3600 },
    }
  );
}

export async function getTbaTeamMedia(
  teamNumber: number,
  year: number = getDefaultYear()
): Promise<TbaMedia[]> {
  return fetchJson<TbaMedia[]>(
    `${TBA_BASE}/team/frc${teamNumber}/media/${year}`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 3600 },
    }
  );
}

export async function getStatboticsTeam(
  teamNumber: number
): Promise<StatboticsTeam | null> {
  const response = await fetch(`${SB_BASE}/team/${teamNumber}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<StatboticsTeam>;
}

export async function getStatboticsTeamYear(
  teamNumber: number,
  year: number = getDefaultYear()
): Promise<StatboticsTeamYear | null> {
  const response = await fetch(`${SB_BASE}/team_year/${teamNumber}/${year}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<StatboticsTeamYear>;
}

export async function searchTeams(query: string): Promise<TbaTeamSimple[]> {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  if (/^\d+$/.test(trimmed)) {
    try {
      const team = await getTbaTeam(Number(trimmed));
      return [team];
    } catch {
      return [];
    }
  }

  const pages = await Promise.all(
    Array.from({ length: 30 }, (_, i) => getTbaTeamsPage(i))
  );

  const allTeams = pages.flat();

  return allTeams
    .filter((team) => {
      const haystack = [
        String(team.team_number),
        team.nickname ?? "",
        team.name ?? "",
        team.school_name ?? "",
        team.city ?? "",
        team.state_prov ?? "",
        team.country ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(trimmed);
    })
    .slice(0, 100);
}

export async function getTbaEvents(
  year: number = getDefaultYear()
): Promise<TbaEvent[]> {
  return fetchJson<TbaEvent[]>(
    `${TBA_BASE}/events/${year}`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 3600 },
    }
  );
}

export async function searchEvents(
  query: string,
  year: number = getDefaultYear()
): Promise<TbaEvent[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const events = await getTbaEvents(year);
  return events.filter(event => 
    [event.name, event.short_name, event.key, event.event_code]
      .join(' ')
      .toLowerCase()
      .includes(trimmed)
  ).slice(0, 50);
}

export async function getTbaEventMatches(
  eventKey: string
): Promise<TbaMatchSimple[]> {
  return fetchJson<TbaMatchSimple[]>(
    `${TBA_BASE}/event/${eventKey}/matches/simple`,
    {
      headers: getTbaHeaders(),
      next: { revalidate: 60 },
    }
  );
}

export async function getEventCurrentStatus(
  eventKey: string
): Promise<TbaEventStatus | null> {
  try {
    const response = await fetch(`${TBA_BASE}/event/${eventKey}/status`, {
      headers: getTbaHeaders(),
      next: { revalidate: 30 },
    });
    if (!response.ok) return null;
    return response.json() as Promise<TbaEventStatus>;
  } catch {
    return null;
  }
}

export function mediaToImageUrl(media: TbaMedia): string | null {
  return media.direct_url || media.view_url || null;
}

