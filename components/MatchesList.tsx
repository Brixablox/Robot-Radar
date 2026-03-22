"use client";

import Link from "next/link";
import { TbaEvent } from "@/app/lib/frc";

interface MatchesListProps {
  events: TbaEvent[];
}

export default function MatchesList({ events }: MatchesListProps) {
  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '18px',
      maxHeight: '70vh',
      overflowY: 'auto',
      paddingRight: '12px'
    }}>
      {events.map((event) => {
        const location = [event.city, event.state_prov, event.country].filter(Boolean).join(", ");
        const dateStr = new Date(event.start_date).toLocaleDateString('en-US', { 
          year: 'numeric', month: 'short', day: 'numeric' 
        });

        return (
          <Link 
            key={event.key}
            href={`/matches/${event.key}`}
            style={{
              display: 'block',
              padding: '20px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: '16px',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateY(-4px)';
              target.style.boxShadow = '0 20px 40px rgba(34,211,238,0.2)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'translateY(0)';
              target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: '#67e8f9' }}>
              {event.name}
            </div>
            <div style={{ color: '#94a3b8', marginBottom: '4px', fontSize: '0.95rem' }}>
              {event.event_code} • {event.event_type_string}
            </div>
            <div style={{ color: '#cbd5e1', marginBottom: '8px', fontSize: '0.95rem' }}>
              {location}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {dateStr} - {new Date(event.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

