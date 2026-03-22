"use client";

import Link from "next/link";
import { useMemo, useState, useCallback, useTransition } from "react";
import TeamsList from "./TeamsList";
import type { TbaTeamSimple } from "@/app/lib/frc";

function dedupeTeams(teams: TbaTeamSimple[]) {
  const seen = new Set<string>();
  return teams.filter((team) => {
    if (seen.has(team.key)) return false;
    seen.add(team.key);
    return true;
  });
}

interface SearchResult {
  teams: TbaTeamSimple[];
  count: number;
  loading: boolean;
  error?: string;
}

export default function TeamsClient({
  initialTeams,
}: {
  initialTeams: TbaTeamSimple[];
}) {
  const [allTeams, setAllTeams] = useState<TbaTeamSimple[]>(dedupeTeams(initialTeams));
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchResult, setSearchResult] = useState<SearchResult>({ teams: [], count: 0, loading: false });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function loadMore() {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/teams?page=${nextPage}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load page ${nextPage}`);
      }

      const data = await res.json();
      const newTeams: TbaTeamSimple[] = Array.isArray(data.teams) ? data.teams : [];

      setAllTeams((prev) => dedupeTeams([...prev, ...newTeams]));
      setPage(nextPage);
      setHasMore(newTeams.length > 0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load more teams";
      console.error("Load more error:", err);
      setError(msg);
    } finally {
      setLoadingMore(false);
    }
  }

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      setSearchResult({ teams: [], count: 0, loading: false });
      return;
    }

    setSearchResult(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/teams/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!res.ok) {
        throw new Error("Search failed");
      }

      const data = await res.json();
      setSearchResult({
        teams: Array.isArray(data.teams) ? data.teams : [],
        count: data.count || 0,
        loading: false
      });
    } catch (err) {
      setSearchResult({
        teams: [],
        count: 0,
        loading: false,
        error: "Search failed"
      });
    }
  }

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setError(null);
    
    startTransition(() => {
      performSearch(newQuery);
    });
  }, []);

  const isSearching = query.trim() && !isPending;
  const showLoadMore = !query.trim() && hasMore;

  const statusText = (isSearching && searchResult.loading)
    ? "Searching teams..."
    : isSearching 
      ? `${searchResult.count} search results found`
      : `${allTeams.length} teams loaded`;

  const displayTeams = isSearching ? searchResult.teams : allTeams;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 70px" }}>
      <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", margin: 0 }}>Teams</h1>
      <p style={{ color: "#94a3b8" }}>
        Search by team number, name, school, or location
      </p>

      <input
        value={query}
        onChange={handleQueryChange}
        placeholder="Search all teams..."
        style={{
          width: "100%",
          marginTop: "18px",
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          outline: "none",
          fontSize: "1rem",
        }}
      />

      {error && (
        <div style={{ marginTop: "18px", color: "#fca5a5", padding: "12px", background: "rgba(252, 165, 165, 0.1)", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
          Error: {error}
          <button 
            onClick={() => setError(null)} 
            style={{ marginLeft: "12px", background: "none", border: "none", color: "#fca5a5", cursor: "pointer", textDecoration: "underline" }}
          >
            Dismiss
          </button>
        </div>
      )}
      <div style={{ marginTop: "18px", color: "#cbd5e1", fontWeight: 700 }}>
        {statusText}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {searchResult.error ? (
        <div style={{ marginTop: "14px", color: "#fca5a5" }}>
          {searchResult.error}
        </div>
      ) : null}

{isSearching && searchResult.loading ? (
  <div style={{ 
    height: "70vh", 
    marginTop: "24px",
    minHeight: "400px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    background: "rgba(255,255,255,0.02)"
  }}>
    <div style={{
      width: "48px",
      height: "48px",
      border: "4px solid rgba(148, 163, 184, 0.2)",
      borderTop: "4px solid #94a3b8",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    }} />
    <div style={{ marginTop: "16px", color: "#94a3b8", fontSize: "1rem" }}>
      Searching teams...
    </div>
  </div>
) : (
  <div style={{ 
    height: "70vh", 
    marginTop: "24px",
    minHeight: "400px",
    borderRadius: "12px",
    overflow: "auto",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    background: "rgba(255,255,255,0.02)",
    paddingRight: "12px"
  }}>
    <TeamsList teams={displayTeams} />
  </div>
)}

      {!showLoadMore && !isSearching && query.trim() && displayTeams.length === 0 ? (
        <div style={{ marginTop: "20px", color: "#94a3b8" }}>
          No teams match your search. Try different terms.
        </div>
      ) : null}

      {showLoadMore && (
        <div style={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            style={{
              padding: "12px 18px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: loadingMore ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.07)",
              color: "white",
              cursor: loadingMore ? "default" : "pointer",
            }}
          >
            {loadingMore ? "Loading..." : "Load More Teams"}
          </button>
        </div>
      )}
    </div>
  );
}

