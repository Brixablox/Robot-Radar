"use client";

import { useState, useCallback, useRef, useEffect } from "react";


import EpaCard from "../teams/EpaCard";
import AllianceSummaryCard from "./AllianceSummaryCard";
import { useMemo } from "react";

interface RecordType {
  wins?: number;
  losses?: number;
  ties?: number;
  winrate?: number;
}

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
  record?: RecordType;
  recentRecord?: RecordType;
}

interface AllianceStatsForPage {
  avgEPA: number;
  totalEPA: number;
  avgWinrate: number;
  totalYears: number;
  recentWins: number;
  numTeams: number;
}

interface SlotTeam {
  teamNumber: number;
  data: TeamData | null;
  loading: boolean;
  error: string | null;
  side: 'red' | 'blue';
}

type SlotTeams = (SlotTeam | null)[];

interface AllianceSummary {
  red: AllianceStatsForPage;
  blue: AllianceStatsForPage;
}

export default function ComparePage() {
  const timeoutsRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const [teamInputs, setTeamInputs] = useState<string[]>(["", "", "", "", "", ""]); 
  const [slotTeams, setSlotTeams] = useState<SlotTeams>(Array(6).fill(null));
  const [allianceSummary, setAllianceSummary] = useState<AllianceSummary | null>(null);
const [prediction, setPrediction] = useState<{redWinChance: number, blueWinChance: number, redLoseChance: number, blueLoseChance: number} | null>(null);


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

  const computeAllianceStats = useCallback((teams: SlotTeams): AllianceSummary | null => {
    const getTeamsForSide = (start: number, end: number) => 
      teams.slice(start, end).filter((t): t is SlotTeam => Boolean(t && t.data && !t.loading && !t.error));

    const redTeams = getTeamsForSide(0, 3);
    const blueTeams = getTeamsForSide(3, 6);

    if (redTeams.length === 0 && blueTeams.length === 0) return null;

    const computeStats = (sideTeams: SlotTeam[]) => {
      const currentYear = 2026; // Default FRC year or use data.year
      let totalEPA = 0, totalWinrateWeight = 0, totalGames = 0, totalYears = 0, totalRecentWins = 0;
      let epaCount = 0;

      sideTeams.forEach(({data}) => {
        if (data!.epa?.current) {
          totalEPA += data!.epa.current;
          epaCount++;
        }
        const rec = data!.record;
        if (rec && typeof rec.winrate === 'number') {
          const games = (rec.wins || 0) + (rec.losses || 0) + (rec.ties || 0);
          totalWinrateWeight += rec.winrate * games;
          totalGames += games;
        }
        if (data!.rookie_year) {
          totalYears += currentYear - data!.rookie_year;
        }
        const recentRec = data!.recentRecord;
        if (recentRec?.wins) {
          totalRecentWins += recentRec.wins;
        }
      });

      return {
        avgEPA: epaCount > 0 ? totalEPA / epaCount : 0,
        totalEPA,
        avgWinrate: totalGames > 0 ? totalWinrateWeight / totalGames : 0,
        totalYears: Math.round(totalYears),
        recentWins: totalRecentWins,
        numTeams: sideTeams.length,
      };
    };

    return {
      red: computeStats(redTeams),
      blue: computeStats(blueTeams),
    };
  }, []);

  useEffect(() => {
    const summary = computeAllianceStats(slotTeams);
    setAllianceSummary(summary);
    if (summary) {
      setPrediction(null); // Reset prediction on teams change
    }
  }, [slotTeams, computeAllianceStats]);

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);


  const redTeams = slotTeams.slice(0,3);
  const blueTeams = slotTeams.slice(3,6);

  const hasAnyTeams = slotTeams.some(Boolean);

  const handleCalculateWinRate = useCallback(() => {
    if (!allianceSummary) return;

    const { red, blue } = allianceSummary;
    const epaDiff = red.avgEPA - blue.avgEPA;
    const formDiff = (red.avgWinrate - blue.avgWinrate) * 10; // Normalized
    const rawScore = epaDiff * 1.5 + formDiff;
    const logit = rawScore / 20; // Scale
    const redWinChanceRaw = 100 / (1 + Math.exp(-logit));
    const redWinChance = Math.max(5, Math.min(95, Math.round(redWinChanceRaw)));
    const blueWinChance = 100 - redWinChance;
    const redLoseChance = blueWinChance;
    const blueLoseChance = redWinChance;
    setPrediction({ redWinChance, blueWinChance, redLoseChance, blueLoseChance });
  }, [allianceSummary]);

  const handleReset = useCallback(() => {
    setTeamInputs(["", "", "", "", "", ""]);
    setSlotTeams(Array(6).fill(null));
    setAllianceSummary(null);
    setPrediction(null);
  }, []);

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
        <div className="col-span-1 lg:col-span-2 flex justify-center pt-4 gap-4">
          <button
            onClick={loadAllValidTeams}
            disabled={teamInputs.every(input => !input.trim())}
            className="px-12 py-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 text-xl font-bold text-white rounded-3xl shadow-2xl hover:shadow-teal-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            🚀 Load Selected Teams
            <span className="text-sm font-normal opacity-90">({teamInputs.filter(input => input.trim()).length}/6)</span>
          </button>
          <button
            onClick={handleReset}
            disabled={!hasAnyTeams}
            className="px-12 py-4 bg-gradient-to-r from-gray-600 to-slate-700 hover:from-gray-500 hover:to-slate-600 text-xl font-bold text-white rounded-3xl shadow-xl hover:shadow-gray-500/50 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          >
            🗑️ Reset All
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
{allianceSummary && (
              <div className="flex justify-center mt-8">
                <AllianceSummaryCard stats={{...allianceSummary.red, side: 'red' as const}} side="red" />
              </div>
            )}
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mb-20">
            <button
              onClick={handleCalculateWinRate}
              disabled={!allianceSummary || redTeams.filter(Boolean).length < 1 || blueTeams.filter(Boolean).length < 1}
              className="px-16 py-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-2xl font-black text-white rounded-3xl shadow-2xl hover:shadow-emerald-500/50 hover:-translate-y-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-green-500/25 disabled:shadow-none flex items-center gap-3 text-shadow-lg"
            >
              🎯 Calculate Win Rate
            </button>
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
{allianceSummary && (
              <div className="flex justify-center mt-8">
                <AllianceSummaryCard stats={{...allianceSummary.blue, side: 'blue' as const}} side="blue" />
              </div>
            )}
          </div>

{prediction && (
            <div className="text-center mb-12 p-8 bg-gradient-to-r from-emerald-900/80 via-slate-900/80 to-purple-900/80 border-2 border-emerald-400/50 rounded-3xl backdrop-blur-xl shadow-2xl max-w-3xl mx-auto">
              <h3 className="text-3xl font-black mb-8 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">🎯 Match Prediction</h3>
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div className="text-center">
                  <div className="text-6xl font-black bg-gradient-to-br from-red-400 to-orange-400 bg-clip-text text-transparent drop-shadow-2xl mb-2">Red Alliance</div>
                  <div className="text-5xl font-black text-emerald-400 mb-2">{prediction.redWinChance}%</div>
                  <div className="text-3xl font-bold text-red-400/80 -mb-1">Win Chance</div>
                  <div className="text-xl font-bold text-red-300/70">{prediction.redLoseChance}% Lose Chance</div>
                </div>
                <div className="text-center">
                  <div className="text-6xl font-black bg-gradient-to-br from-blue-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl mb-2">Blue Alliance</div>
                  <div className="text-5xl font-black text-emerald-400 mb-2">{prediction.blueWinChance}%</div>
                  <div className="text-3xl font-bold text-blue-400/80 -mb-1">Win Chance</div>
                  <div className="text-xl font-bold text-red-300/70">{prediction.blueLoseChance}% Lose Chance</div>
                </div>
              </div>
              <div className="text-2xl font-bold text-emerald-300/80 flex items-center justify-center gap-2">
                Win Chances Sum: {prediction.redWinChance + prediction.blueWinChance}% 
                <span className="text-emerald-400 font-black text-3xl">✓</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

interface TeamCardProps {
  team: SlotTeam | null;
  index: number;
  onRemove: () => void;
  loadTeamForSlot: (index: number, teamNumber: number) => void;
  zBase: number;
}

function TeamCard({ team, index, onRemove, loadTeamForSlot, zBase }: TeamCardProps) {
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

{/* Individual stats removed - alliance only */}


      <div className="text-center pt-2 border-t border-white/20 text-xs text-gray-500">
        {data.location ? `${data.location.city ?? ''}, ${data.location.state ?? ''}` : 'Location unknown'}
      </div>
    </div>
  );
}

