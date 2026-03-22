"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Calendar, MapPin, Clock, Trophy } from "lucide-react";
import Link from "next/link";
import type { TbaEvent, TbaMatchSimple, TbaEventStatus } from "@/app/lib/frc";

interface EventDetailProps {
  params: { eventKey: string };
}

export default function EventDetail({ params }: EventDetailProps) {
  const [eventData, setEventData] = useState<{ matches: TbaMatchSimple[]; status: TbaEventStatus | null; eventKey: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/matches/${params.eventKey}`);
        if (!res.ok) throw new Error("Failed to fetch event data");
        const data = await res.json();
        setEventData(data);
      } catch (err) {
        setError("Failed to load event. Check TBA key?");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.eventKey]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #0B1020 0%, #081626 100%)" }}>
        <div style={{ color: "#67e8f9", fontSize: "1.5rem" }}>Loading event...</div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(180deg, #0B1020 0%, #081626 100%)", color: "#94a3b8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "16px", color: "#fca5a5" }}>{error}</div>
          <Link href="/matches" style={{ color: "#67e8f9", textDecoration: "none" }}>
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const { matches, status, eventKey } = eventData;
  const currentMatch = status?.next_match;

  // Group matches by phase
  const phases = ['qm', 'ef', 'qf', 'sf', 'f', 'm'];
  const groupedMatches = phases.reduce((acc, phase) => {
    acc[phase] = matches.filter(m => m.comp_level === phase);
    return acc;
  }, {} as Record<string, TbaMatchSimple[]>);

  const phaseOrder = [
    { key: 'qm', label: 'Qualifications', icon: Calendar },
    { key: 'ef', label: 'Einstein Field', icon: Trophy },
    { key: 'qf', label: 'Quarterfinals', icon: '1/8' },
    { key: 'sf', label: 'Semifinals', icon: '1/4' },
    { key: 'f', label: 'Finals', icon: '1/2' },
    { key: 'm', label: 'Tiebreakers', icon: 'TB' }
  ];

  const getCurrentPhase = () => {
    if (status?.overall_status_str?.includes('Qualification')) return 'qm';
    if (status?.overall_status_str?.includes('Playoffs')) return status.playoffs?.status || 'qf';
    return 'qm';
  };

  const currentPhase = getCurrentPhase();

  return (
    <main style={{ 
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0B1020 0%, #081626 100%)",
      color: "white",
      padding: "40px 24px 80px"
    }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <Link 
          href="/matches"
          style={{ 
            display: "inline-flex", 
            alignItems: "center", 
            color: "#67e8f9", 
            textDecoration: "none", 
            marginBottom: "32px",
            fontWeight: 600
          }}
        >
          <ChevronLeft size={24} style={{ marginRight: "8px" }} />
          All Events
        </Link>

        <div style={{ 
          background: "rgba(255,255,255,0.03)",
          backdropFilter: "blur(20px)",
          borderRadius: "24px",
          border: "1px solid rgba(148, 163, 184, 0.1)",
          padding: "32px",
          marginBottom: "40px"
        }}>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)", margin: 0, color: "#67e8f9", marginBottom: "8px" }}>
            {eventKey.split('_')[1].toUpperCase()}
          </h1>
          <div style={{ display: "flex", gap: "24px", alignItems: "center", color: "#94a3b8", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={20} />
              Event Status: <strong>{status?.overall_status_str || 'Unknown'}</strong>
            </div>
            {currentMatch && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Clock size={20} />
                Next: {currentMatch.time_string}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div style={{ marginBottom: "60px" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "32px", color: "#67e8f9", textAlign: "center" }}>
            Competition Timeline
          </h2>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            position: "relative",
            height: "100px"
          }}>
            {phaseOrder.map(({ key, label, icon }) => {
              const hasMatches = groupedMatches[key].length > 0;
              const isCurrent = currentPhase === key;
              const count = groupedMatches[key].length;
              
              return (
                <motion.div
                  key={key}
                  style={{ 
                    position: "relative",
                    textAlign: "center",
                    zIndex: 10,
                    cursor: hasMatches ? "pointer" : "default"
                  }}
                  animate={isCurrent ? { 
                    scale: [1, 1.3, 1], 
                    backgroundColor: ["#67e8f9", "#22d3ee", "#67e8f9"],
                    boxShadow: ["0 0 0 #67e8f9", "0 0 20px #67e8f9", "0 0 0 #67e8f9"]
                  } : {}}
                  transition={isCurrent ? { 
                    duration: 2, 
                    repeat: Infinity,
                    repeatType: "reverse"
                  } : {}}
                >
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: isCurrent ? "#67e8f9" : hasMatches ? "rgba(103,232,249,0.3)" : "rgba(148,163,184,0.2)",
                    border: "3px solid",
                    borderColor: isCurrent ? "#22d3ee" : hasMatches ? "#67e8f9" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    color: isCurrent ? "#0B1020" : "white",
                    marginBottom: "12px",
                    transition: "all 0.3s ease"
                  }}>
                    {typeof icon === 'string' ? icon : count}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#94a3b8", minWidth: "80px" }}>
                    {label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Current Phase Matches */}
        {currentPhase === 'qm' && groupedMatches.qm.length > 0 && (
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "24px", color: "#67e8f9" }}>
              Current Qualification Matches
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "20px" }}>
              {groupedMatches.qm.slice(-6).map((match) => (
                <div key={match.key} style={{ 
                  padding: "20px", 
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "16px",
                  borderLeft: "4px solid #67e8f9"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <span style={{ color: "#94a3b8" }}>Q{String(match.match_number).padStart(2, '0')}</span>
                    <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>{match.time_string}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <div style={{ flex: 1, textAlign: "center", color: "#ef4444" }}>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>RED</div>
                      {match.alliances.red.team_keys.slice(0,3).map(teamKey => (
                        <div key={teamKey} style={{ fontSize: "0.9rem", color: "#fca5a5" }}>
                          {teamKey.replace('frc', '')}
                        </div>
                      ))}
                      <div style={{ fontSize: "1.1rem", fontWeight: 700, mt: 4 }}>
                        {match.alliances.red.score ?? '-'}
                      </div>
                    </div>
                    <div style={{ flex: 1, textAlign: "center", color: "#60a5fa" }}>
                      <div style={{ fontWeight: 700, marginBottom: "4px" }}>BLUE</div>
                      {match.alliances.blue.team_keys.slice(0,3).map(teamKey => (
                        <div key={teamKey} style={{ fontSize: "0.9rem", color: "#93c5fd" }}>
                          {teamKey.replace('frc', '')}
                        </div>
                      ))}
                      <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                        {match.alliances.blue.score ?? '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playoff Bracket Placeholder */}
        {currentPhase !== 'qm' && (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>
            <Trophy size={64} style={{ margin: "0 auto 24px", opacity: 0.5 }} />
            <h3 style={{ fontSize: "1.8rem", marginBottom: "12px" }}>Playoff Bracket</h3>
            <p>Bracket visualization coming soon</p>
            <div style={{ 
              marginTop: "32px", 
              padding: "24px", 
              background: "rgba(255,255,255,0.02)", 
              borderRadius: "16px", 
              display: "inline-block",
              border: "1px solid rgba(103,232,249,0.2)"
            }}>
              Matches: {matches.length} total
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

