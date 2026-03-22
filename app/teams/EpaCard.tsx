 "use client";

import { useEffect, useState } from 'react';

type EpaData = {
  current?: number;
  recent?: number;
  max?: number;
} | null | undefined;

interface EpaCardProps {
  teamNumber: number;
  initialEpa?: EpaData;
}

export default function EpaCard({ teamNumber, initialEpa }: EpaCardProps) {
  const [epaData, setEpaData] = useState<EpaData>(initialEpa ?? null);
  const [loading, setLoading] = useState<boolean>(!!initialEpa === false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialEpa?.current !== undefined) return;

    async function fetchEpa() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`https://api.statbotics.io/v3/team/${teamNumber}`);
        if (!response.ok) {
          setEpaData(null);
          return;
        }
        const data = await response.json();
        setEpaData(data.norm_epa ?? null);
      } catch (err) {
        setError('Failed to load EPA');
        console.error('EPA fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchEpa();
  }, [teamNumber, initialEpa]);

  if (loading) {
    return (
      <div style={{
        padding: '6px 10px',
        fontSize: '0.8rem',
        color: '#94a3b8',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        border: '1px solid rgba(148,163,184,0.2)',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500
      }}>
        —
      </div>
    );
  }

  if (error || !epaData?.current) {
    return (
      <div style={{
        padding: '6px 10px',
        fontSize: '0.8rem',
        color: '#94a3b8',
        background: 'rgba(255,255,255,0.04)',
        borderRadius: '6px',
        border: '1px solid rgba(148,163,184,0.2)',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        fontWeight: 500
      }}>
        —
      </div>
    );
  }

  return (
    <div style={{
      padding: '6px 10px',
      fontSize: '0.8rem',
      color: '#67e8f9',
      background: 'rgba(103,232,249,0.15)',
      borderRadius: '6px',
      border: '1px solid #67e8f9',
      boxShadow: '0 0 8px rgba(103,232,249,0.3)',
      minHeight: '28px',
      display: 'flex',
      alignItems: 'center',
      fontWeight: 600,
      transition: 'all 0.2s ease',
      cursor: 'default'
    }}
    title={`Current: ${(epaData!.current || 0).toFixed(1)} | Recent: ${(epaData!.recent || 0).toFixed(1)} | Max: ${(epaData!.max || 0).toFixed(1)}`}
    >
      {(epaData!.current || 0).toFixed(1)}
    </div>
  );
} 
