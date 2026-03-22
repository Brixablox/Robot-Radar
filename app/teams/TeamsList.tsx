"use client";

import Link from 'next/link';
import EpaCard from './EpaCard';
import type { TbaTeamSimple } from '@/app/lib/frc';
import { CSSProperties } from 'react';

function TeamCard({ team }: { team: TbaTeamSimple }) {
  const location = [team.city, team.state_prov, team.country]
    .filter(Boolean)
    .join(', ');

  return (
    <Link
      href={`/teams/${team.team_number}`}
      style={{ textDecoration: 'none', color: 'inherit' } as CSSProperties}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(148, 163, 184, 0.14)',
          borderRadius: '18px',
          padding: '18px',
          minHeight: '160px',
          transition: 'all 0.2s ease',
        } as CSSProperties}
      >
        <div style={{ color: '#67e8f9', fontWeight: 800, fontSize: '1.1rem' }}>
          Team {team.team_number}
        </div>

        <div
          style={{
            marginTop: '8px',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f8fafc',
          } as CSSProperties}
        >
          {team.nickname || team.name || 'Unnamed Team'}
        </div>

        {team.school_name && (

          <div style={{ marginTop: '8px', color: '#cbd5e1', fontSize: '0.95rem' }}>
            {team.school_name}
          </div>
        )}

        {location && (
          <div style={{ marginTop: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
            {location}
          </div>
        )}
      </div>
    </Link>
  );
}

interface TeamsListProps {
  teams: TbaTeamSimple[];
  style?: CSSProperties;
}

export default function TeamsList({ teams, style }: TeamsListProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '18px',
        marginTop: '24px',
        maxHeight: '70vh',
        overflowY: 'auto',
        paddingRight: '12px',
        ...style,
      } as CSSProperties}
    >
      {teams.map((team) => (
        <TeamCard key={team.team_number} team={team} />
      ))}
    </div>
  );
}

