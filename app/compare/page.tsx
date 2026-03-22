"use client";

import { useState, useCallback, useRef, useEffect } from "react";


import EpaCard from "../teams/EpaCard";

interface TeamData {
  teamNumber: number;
  name: string;
  location?: {
    city: string;
    state: string;
    country: string;
  } | null;
  rookie_year?: number;
  epa: {
    current?: number;
    recent?: number;
    max?: number;
  } | null;
  record?: {
    wins?: number;
    losses?: number;
    ties?: number;
    winrate?: number;
  };
}

interface SlotTeam {
  teamNumber: number;
  data: TeamData | null;
  loading: boolean;
  error: string | null;
  side: 'red' | 'blue';
}

type SlotTeams = (SlotTeam | null)[];

export default function ComparePage() {
  const timeoutsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [teamInputs, setTeamInputs] = useState<string[]>(["", "", "", "", "", ""]); 
  const [slotTeams, setSlotTeams] = useState<SlotTeams>(Array(6).fill(null));

const fetchTeamData = useCallback(async (teamNumber: number): Promise<TeamData | null> => {
    try {
      const res = await fetch(`/api/team-data/${teamNumber}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.warn(`API ${res.status} for team ${teamNumber}:`, errorData.error || res.statusText);
        return null;
      }
      return await res.json() as TeamData;
    } catch (err) {
      console.error(`Fetch error team ${teamNumber}:`, err);
      return null;
    }
  }, []);

  const getSideForIndex = (index: number): 'red' | 'blue' => index < 3 ? 'red' : 'blue';

const loadTeamForSlot = useCallback(async (index: number, teamNumber: number) => {
    const side = getSideForIndex(index);
    
    // Optimistic loading update
    setSlotTeams(prev => {
      const updated = [...prev];
      updated[index] = {
        teamNumber,
        data: null,
        loading: true,
        error: null,
        side,
      };
      return updated;
    });

    try {
      const data = await fetchTeamData(teamNumber);
      
      // Timeout fallback - if still loading this slot, update
      const timeoutId = setTimeout(() => {
        setSlotTeams(prev => {
          const updated = [...prev];
          if (updated[index]?.loading && updated[index]?.teamNumber === teamNumber) {
            updated[index] = {
              ...updated[index]!,
              data,
              loading: false,
              error: data ? null : `Team ${teamNumber} not found`,
            };
          }
          return updated;
        });
      }, 1000); // 1s race window

      clearTimeout(timeoutId);
      
      // Final update
      setSlotTeams(prev => {
        const updated = [...prev];
        if (updated[index]?.loading) {
          updated[index] = {
            teamNumber,
            side: getSideForIndex(index),
            data,
            loading: false,
            error: data ? null : null, // Remove TBA hint here - generic only on catch
          };
        }
        return updated;
      });
    } catch (err) {
      setSlotTeams(prev => {
        const updated = [...prev];
        updated[index] = {
          teamNumber,
          side: getSideForIndex(index),
          data: null,
          loading: false,
          error: `Fetch failed: ${err instanceof Error ? err.message : 'Unknown'}`,
        };
        return updated;
      });
    }
  }, [fetchTeamData]);

  const clearSlot = useCallback((index: number) => {
    setSlotTeams(prev => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
  }, []);

const handleInputChange = (index: number, value: string) => {
    // Just update input, no auto load
    const newInputs = [...teamInputs];
    newInputs[index] = value;
    setTeamInputs(newInputs);
  };

const loadAllValidTeams = () => {
    const currentInputs = [...teamInputs];
    currentInputs.forEach((input, index) => {
      const teamNumber = parseInt(input);
      if (input && !isNaN(teamNumber) && teamNumber >= 1 && teamNumber <= 9999) {
        loadTeamForSlot(index, teamNumber);
      }
    });
  };

  const removeTeam = (index: number) => {
    setTeamInputs(prev => {
      const updated = [...prev];
      updated[index] = "";
      return updated;
    });
    clearSlot(index);
  };

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  const redTeams = slotTeams.slice(0,3);
  const blueTeams = slotTeams.slice(3,6);

  const hasAnyTeams = slotTeams.some(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto text-white min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-gray-900">
      <h1 className="text-4xl md:text-5xl font-bold mb-12 bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg text-center">
        Matchup Simulator
      </h1>

      {/* Compact Inputs + Load Button */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Red */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent text-center">
            🚀 Red Alliance
          </h2>
          <div className="space-y-3">
            {teamInputs.slice(0,3).map((input, index) => (
              <div key={index} className="relative w-40 mx-auto">
                <input
                  type="number"
                  value={input}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  className="w-full p-6 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-2 border-red-400/50 hover:border-red-400 focus:border-red-400 focus:ring-4 focus:ring-red-400/30 rounded-2xl text-xl font-bold text-white placeholder-red-300 transition-all duration-300 text-center shadow-xl hover:shadow-red-500/25"
                  placeholder={`#${index + 1}`}
                  min="1" max="9999"
                />
                {slotTeams[index]?.loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-red-400/50 border-t-red-400 rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blue */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
            🔵 Blue Alliance
          </h2>
          <div className="space-y-3">
            {teamInputs.slice(3,6).map((input, index) => (
              <div key={index + 3} className="relative w-40 mx-auto">
                <input
                  type="number"
                  value={input}
                  onChange={(e) => handleInputChange(index + 3, e.target.value)}
                  className="w-full p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-2 border-blue-400/50 hover:border-blue-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/30 rounded-2xl text-xl font-bold text-white placeholder-blue-300 transition-all duration-300 text-center shadow-xl hover:shadow-blue-500/25"
                  placeholder={`#${index + 1}`}
                  min="1" max="9999"
                />
                {slotTeams[index + 3]?.loading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 border-2 border-blue-400/50 border-t-blue-400 rounded-full animate-spin" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Load Button - spans both */}
        <div className="col-span-1 lg:col-span-2 flex justify-center pt-4">
          <button
            onClick={loadAllValidTeams}
            disabled={teamInputs.every(input => !input.trim())}
            className="px-12 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-xl font-bold text-white rounded-3xl shadow-2xl hover:shadow-teal-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            🚀 Load Selected Teams
            <span className="text-sm font-normal opacity-90">({teamInputs.filter(input => input.trim()).length}/6)</span>
          </button>
        </div>
      </div>

      {!hasAnyTeams ? (
        <div className="text-center py-32">
          <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-teal-400/10 to-cyan-400/10 border-4 border-teal-400/20 rounded-3xl flex items-center justify-center backdrop-blur-sm shadow-2xl animate-pulse" />
          <p className="text-2xl lg:text-3xl font-semibold mb-6 text-gray-300">Enter alliance teams above to compare</p>
          <p className="text-lg text-gray-500 max-w-lg mx-auto">Real-time EPA & stats powered by TBA + Statbotics</p>
        </div>
      ) : (
        <>
          {/* Red Alliance Layered Row */}
          <div className="mb-20">
            <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent text-center">
              Red Alliance Matchup
            </h3>
            <div className="flex flex-row gap-4 justify-center items-stretch relative">
{redTeams.map((team, index) => (
                <TeamCard 
                  key={index}
                  team={team} 
                  index={index}
                  onRemove={() => removeTeam(index)}
                  loadTeamForSlot={loadTeamForSlot}
                  zBase={10 + index * 10}
                />
              ))}
            </div>
          </div>

          {/* Blue Alliance Layered Row */}
          <div>
            <h3 className="text-3xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent text-center">
              Blue Alliance Matchup
            </h3>
            <div className="flex flex-row gap-4 justify-center items-stretch relative">
{blueTeams.map((team, index) => (
                <TeamCard 
                  key={index}
                  team={team} 
                  index={3 + index}
                  onRemove={() => removeTeam(3 + index)}
                  loadTeamForSlot={loadTeamForSlot}
                  zBase={10 + index * 10}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface TeamCardProps {
  team: SlotTeam | null;
  index: number;
  onRemove: () => void;
  zBase: number;
}

function TeamCard({ team, index, onRemove, zBase }: TeamCardProps & { loadTeamForSlot?: (index: number, teamNumber: number) => void }) {
  if (!team) return null;

  const { side } = team;
  const colorPrefix = side === 'red' ? 'red' : 'blue';

  if (team.loading) {
    return (
      <div className={`relative p-4 h-[350px] rounded-2xl backdrop-blur-xl shadow-2xl shadow-${colorPrefix}-500/20 z-[${zBase}] bg-gradient-to-br from-${colorPrefix}-900/60 via-${colorPrefix}-800/40 to-${colorPrefix}-900/50 border border-${colorPrefix}-500/40 min-w-[280px] animate-pulse`}>
        <div className="space-y-3">
          <div className="h-8 bg-gray-700/50 rounded-xl w-3/4" />
          <div className="h-5 bg-gray-700/50 rounded-lg w-1/2" />
          <div className="h-[120px] bg-gray-700/40 rounded-xl" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-8 bg-gray-700/50 rounded-lg" />
            <div className="h-8 bg-gray-700/50 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (team.error) {
    return (
      <div className={`relative p-6 h-[350px] rounded-2xl flex flex-col items-center justify-center text-center backdrop-blur-xl shadow-2xl shadow-${colorPrefix}-500/20 z-[${zBase}] bg-gradient-to-br from-${colorPrefix}-900/60 border-4 border-${colorPrefix}-400/70 min-w-[280px] gap-4`}>
        <div className={`w-20 h-20 border-4 border-${colorPrefix}-400/50 rounded-2xl flex items-center justify-center bg-${colorPrefix}-500/20 shadow-lg`}>
          <span className={`text-3xl font-black text-${colorPrefix}-300`}>⚠️</span>
        </div>
        <div className="space-y-2">
          <p className={`text-lg font-bold text-${colorPrefix}-200 max-w-[200px] leading-tight`}>
            {team.error}
          </p>
          <p className={`text-sm font-mono bg-black/40 px-3 py-1 rounded-lg text-${colorPrefix}-300`}>
            frc{team.teamNumber}
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <button 
            onClick={() => loadTeamForSlot?.(index, team.teamNumber)}
            className={`px-4 py-2 bg-teal-500/80 hover:bg-teal-400/90 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-teal-500/25 text-sm flex items-center gap-1`}
          >
            🔄 Retry
          </button>
          <button 
            onClick={onRemove}
            className={`px-4 py-2 bg-${colorPrefix}-500/30 hover:bg-${colorPrefix}-400/50 border border-${colorPrefix}-400/50 rounded-xl text-white font-bold transition-all text-sm`}
          >
            ❌ Clear
          </button>
        </div>
      </div>
    );
  }

  if (!team.data) {
    return null; // Race guard
  }

  const data = team.data;
  const record = data.record ?? null;

  return (
    <div className={`group relative overflow-hidden rounded-2xl p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_35px_60px_-12px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-500 backdrop-blur-xl z-[${zBase}] bg-gradient-to-br from-${colorPrefix === 'red' ? 'red-900/70 via-red-800/50 to-orange-900/60' : 'blue-900/70 via-blue-800/50 to-cyan-900/60'} border border-${colorPrefix}-500/40 min-w-[280px] h-[350px] flex flex-col`}>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <button
        onClick={onRemove}
        className={`absolute top-3 right-3 p-2 rounded-xl text-white/80 hover:text-white hover:bg-${colorPrefix}-500/30 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10`}
        title="Remove team"
      >
        ✕
      </button>

      <h3 className="text-xl font-black mb-3 flex items-center gap-2 text-white drop-shadow-lg">
        frc<span className="text-2xl">{team.teamNumber}</span>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium text-white/90 bg-${colorPrefix}-500/20 border-${colorPrefix}-400/50`}>
          {data.rookie_year ?? '?'} {data.rookie_year && `(${new Date().getFullYear() - data.rookie_year}yr)`}
        </span>
      </h3>
      
      <p className="text-base mb-4 text-gray-100 font-semibold leading-tight line-clamp-2 flex-1">{data.name}</p>
      
      <div className="mb-4">
        <EpaCard teamNumber={team.teamNumber} />
      </div>

      {record && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-black/40 rounded-xl border border-white/20 backdrop-blur-sm mb-4">
          <div className="text-center">
            <div className={`text-xl font-black bg-gradient-to-br from-${colorPrefix === 'red' ? 'red-400 to-orange-400' : 'blue-400 to-cyan-400'} bg-clip-text text-transparent`}>
              {record.winrate!.toFixed(0)}%
            </div>
            <div className="text-xs uppercase tracking-wide text-gray-400 font-bold mt-1">Win Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {record.wins}-{record.losses}-{record.ties ?? 0}
            </div>
            <div className="text-xs uppercase tracking-wide text-gray-400 font-bold mt-1">Record</div>
          </div>
        </div>
      )}

      <div className="text-center pt-2 border-t border-white/20 text-xs text-gray-500">
        {data.location ? `${data.location.city ?? ''}, ${data.location.state ?? ''}` : 'Location unknown'}
      </div>
    </div>
  );
}

