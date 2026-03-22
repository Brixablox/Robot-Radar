import Link from "next/link";
import {
  getDefaultYear,
  getStatboticsTeam,
  getStatboticsTeamYear,
  getTbaTeam,
  getTbaTeamAwards,
  getTbaTeamEventStatuses,
  getTbaTeamEventsSimple,
  getTbaTeamMedia,
  mediaToImageUrl,
} from "@/app/lib/frc";

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  const displayValue = value != null ? String(value) : "—";
  
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: "16px",
        padding: "18px",
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{label}</div>
      <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: "1.2rem", marginTop: "8px" }}>
        {displayValue}
      </div>
    </div>
  );
}

interface TeamDetailPageProps {
  params: { teamNumber: string };
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { teamNumber } = await params;
  const parsedNumber = Number(teamNumber);
  if (isNaN(parsedNumber) || parsedNumber <= 0) {
    return <div>Invalid team number: {teamNumber}</div>;
  }
  const teamNumberNum = parsedNumber;
  const year = getDefaultYear();

  let tbaTeam, sbTeam, sbTeamYear, events, statuses, awards, media;
  try {
    [tbaTeam, sbTeam, sbTeamYear, events, statuses, awards, media] =
      await Promise.all([
        getTbaTeam(teamNumberNum),
        getStatboticsTeam(teamNumberNum),
        getStatboticsTeamYear(teamNumberNum, year),
        getTbaTeamEventsSimple(teamNumberNum, year),
        getTbaTeamEventStatuses(teamNumberNum, year),
        getTbaTeamAwards(teamNumberNum, year),
        getTbaTeamMedia(teamNumberNum, year),
      ]);
  } catch (error) {
    console.error("Team data fetch error:", error);
    return <div>Failed to load team {teamNumberNum}</div>;
  }

  const location = [tbaTeam.city, tbaTeam.state_prov, tbaTeam.country]
    .filter(Boolean)
    .join(", ");

  const imageMedia = media
    .map(mediaToImageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 6);

  const careerEpa = sbTeam?.norm_epa?.current?.toFixed(1) ?? "—";

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #123456 0%, #0B1020 35%, #060b16 100%)",
        color: "white",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "42px 24px 80px" }}>
        <Link href="/teams" style={{ color: "#67e8f9", textDecoration: "none", fontWeight: 700 }}>
          ← Back to Teams
        </Link>

        <section
          style={{
            marginTop: "22px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(148, 163, 184, 0.14)",
            borderRadius: "24px",
            padding: "28px",
          }}
        >
          <div style={{ color: "#67e8f9", fontWeight: 800 }}>Team {tbaTeam.team_number}</div>
          <h1 style={{ margin: "10px 0 0", fontSize: "clamp(2.3rem, 6vw, 4rem)", lineHeight: 1 }}>
            {tbaTeam.nickname || tbaTeam.name || `FRC ${tbaTeam.team_number}`}
          </h1>

          {tbaTeam.school_name ? (
            <div style={{ marginTop: "12px", color: "#cbd5e1" }}>{tbaTeam.school_name}</div>
          ) : null}

          {location ? <div style={{ marginTop: "8px", color: "#94a3b8" }}>{location}</div> : null}
        </section>

        <section
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          <StatBox label="Rookie Year" value={tbaTeam.rookie_year ?? sbTeam?.rookie_year ?? "—"} />
          <StatBox label="Normal EPA (Career)" value={careerEpa} />
          <StatBox label={`${year} Record`} value={
            sbTeamYear?.record
              ? `${sbTeamYear.record.wins ?? 0}-${sbTeamYear.record.losses ?? 0}-${sbTeamYear.record.ties ?? 0}`
              : "—"
          } />
          <StatBox label="Career Win %" value={
            sbTeam?.record?.winrate != null
              ? `${(sbTeam.record.winrate * 100).toFixed(1)}%`
              : "—"
          } />
          <StatBox label="Career Record" value={
            sbTeam?.record
              ? `${sbTeam.record.wins ?? 0}-${sbTeam.record.losses ?? 0}-${sbTeam.record.ties ?? 0}`
              : "—"
          } />
        </section>

        <section
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(148, 163, 184, 0.14)",
              borderRadius: "20px",
              padding: "22px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>{year} Events</h2>

            <div style={{ display: "grid", gap: "14px" }}>
              {events.map((event) => {
                const status = statuses[event.key];
                const rank = status?.qual?.ranking?.rank;
                const overall = status?.overall_status_str;

                return (
                  <div
                    key={event.key}
                    style={{
                      border: "1px solid rgba(148, 163, 184, 0.12)",
                      borderRadius: "16px",
                      padding: "16px",
                      background: "rgba(255,255,255,0.025)",
                    }}
                  >
                    <div style={{ color: "#f8fafc", fontWeight: 700 }}>{event.name}</div>
                    <div style={{ marginTop: "6px", color: "#94a3b8" }}>
                      {[event.city, event.state_prov, event.country].filter(Boolean).join(", ")}
                    </div>
                    <div style={{ marginTop: "10px", color: "#cbd5e8" }}>
                      {rank ? `Rank #${rank}` : "No ranking yet"}
                      {overall ? <span dangerouslySetInnerHTML={{ __html: ` • ${overall}` }} /> : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gap: "20px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                borderRadius: "20px",
                padding: "22px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>{year} Awards</h2>
              <div style={{ display: "grid", gap: "12px" }}>
                {awards.length === 0 ? (
                  <div style={{ color: "#94a3b8" }}>No awards found.</div>
                ) : (
                  awards.slice(0, 12).map((award, idx) => (
                    <div
                      key={`${award.name}-${idx}`}
                      style={{
                        border: "1px solid rgba(148, 163, 184, 0.12)",
                        borderRadius: "14px",
                        padding: "14px",
                        background: "rgba(255,255,255,0.025)",
                      }}
                    >
                      <div style={{ color: "#f8fafc", fontWeight: 700 }}>{award.name}</div>
                      {award.event_key ? (
                        <div style={{ color: "#94a3b8", marginTop: "6px" }}>{award.event_key}</div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(148, 163, 184, 0.14)",
                borderRadius: "20px",
                padding: "22px",
              }}
            >
              <h2 style={{ marginTop: 0 }}>Media</h2>

              {imageMedia.length === 0 ? (
                <div style={{ color: "#94a3b8" }}>No images found.</div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "12px",
                  }}
                >
                  {imageMedia.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`Team ${teamNumberNum} media ${i + 1}`}
                      style={{
                        width: "100%",
                        aspectRatio: "1 / 1",
                        objectFit: "cover",
                        borderRadius: "14px",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

