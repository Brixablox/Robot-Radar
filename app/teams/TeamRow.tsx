"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { TbaTeamSimple } from "@/app/lib/frc";

function TeamCard({ team }: { team: TbaTeamSimple }) {
  const location = [team.city, team.state_prov, team.country]
    .filter(Boolean)
    .join(", ");

  return (
      <Link
        href={`/teams/${String(team.team_number)}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(148, 163, 184, 0.14)",
          borderRadius: "18px",
          padding: "18px",
          minHeight: "140px",
          margin: "0 9px",
        }}
      >
        <div style={{ color: "#67e8f9", fontWeight: 800 }}>
          Team {team.team_number}
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#f8fafc",
          }}
        >
          {team.nickname || team.name || "Unnamed Team"}
        </div>

        {team.school_name ? (
          <div style={{ marginTop: "8px", color: "#cbd5e1" }}>
            {team.school_name}
          </div>
        ) : null}

        {location ? (
          <div style={{ marginTop: "6px", color: "#94a3b8", fontSize: "0.9rem" }}>
            {location}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

interface VirtualizedTeamsListProps {
  filteredTeams: TbaTeamSimple[];
  height: number;
}

export default function VirtualizedTeamsList({ filteredTeams, height }: VirtualizedTeamsListProps) {
  const rowCount = Math.ceil(filteredTeams.length / 3);

  const Row = useMemo(() => {
    return ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const startIndex = index * 3;
      const team1 = filteredTeams[startIndex];
      const team2 = filteredTeams[startIndex + 1];
      const team3 = filteredTeams[startIndex + 2];

      return (
        <div style={style}>
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "18px",
            height: "100%",
            alignItems: "stretch",
            padding: "12px"
          }}>
            {team1 && <TeamCard team={team1} />}
            {team2 && <TeamCard team={team2} />}
            {team3 && <TeamCard team={team3} />}
          </div>
        </div>
      );
    };
  }, [filteredTeams]);

  if (rowCount === 0) {
    return (
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
        No teams to display
      </div>
    );
  }

  const containerStyle = {
    height,
    width: "100%",
    borderRadius: "12px",
    overflow: "hidden"
  };

  // Simple manual virtualization - only render visible rows
  const visibleRows = 4; // Approx 4 rows visible in 70vh
  const overscan = 1;
  const itemHeight = 200;
  const scrollHeight = rowCount * itemHeight;
  
  const VisibleList = () => {
    const [scrollTop, setScrollTop] = useState(0);

    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(rowCount, startIndex + visibleRows + overscan * 2);
    const visibleTeams = filteredTeams.slice(startIndex * 3, endIndex * 3);

    return (
      <div 
        style={containerStyle}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <div style={{ height: scrollHeight + "px", position: "relative" }}>
          <div 
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: (endIndex - startIndex) * itemHeight + "px",
              transform: `translateY(${startIndex * itemHeight}px)`
            }}
          >
            {Array.from({ length: endIndex - startIndex }, (_, i) => (
              <Row key={startIndex + i} index={startIndex + i} style={{ height: itemHeight, width: "100%" }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return <VisibleList />;
}
