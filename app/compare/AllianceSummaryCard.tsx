"use client";

interface AllianceStats {
  avgEPA: number;
  totalEPA: number;
  avgWinrate: number;
  totalYears: number;
  recentWins: number;
  numTeams: number;
  side: 'red' | 'blue';
}

export default function AllianceSummaryCard({ stats, side }: { stats: AllianceStats; side: 'red' | 'blue'; }) {
  const isRed = side === 'red';
  const colorClass = isRed ? 'from-red-500 to-orange-500' : 'from-blue-500 to-cyan-500';

  return (
    <div className={`p-6 rounded-3xl backdrop-blur-xl shadow-2xl border-2 border-opacity-50 shadow-${isRed ? 'red' : 'blue'}-500/30 bg-gradient-to-br from-${isRed ? 'red' : 'blue'}-900/60 via-neutral-900/80 to-${isRed ? 'orange' : 'cyan'}-900/60 min-w-[300px] mx-auto`}>
      <h3 className={`text-2xl font-black mb-6 bg-gradient-to-r ${colorClass} bg-clip-text text-transparent text-center drop-shadow-lg`}>
        {isRed ? '🚀 Red' : '🔵 Blue'} Alliance Totals
      </h3>
      <div className="grid grid-cols-1 gap-4 text-sm">
        <div>
          <div className="text-3xl font-black text-white mb-1">{stats.avgEPA.toFixed(1)}</div>
          <div className="text-gray-400 uppercase tracking-wider text-xs">Avg EPA</div>
        </div>
        <div>
          <div className="text-3xl font-black text-white mb-1">{stats.totalEPA.toFixed(1)}</div>
          <div className="text-gray-400 uppercase tracking-wider text-xs">Total EPA</div>
        </div>

        <div>
          <div className="text-2xl font-bold text-white mb-1">{stats.totalYears} yrs</div>
          <div className="text-gray-400 uppercase tracking-wider text-xs">Experience</div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="text-lg font-bold text-white flex items-center justify-between">
          Recent Form
          <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${isRed ? 'green' : 'blue'}-500/20 text-${isRed ? 'green' : 'blue'}-300 border border-${isRed ? 'green' : 'blue'}-400/50`}>
            {stats.recentWins}/{stats.numTeams * 10 || 0}
          </span>
        </div>
      </div>
    </div>
  );
}
