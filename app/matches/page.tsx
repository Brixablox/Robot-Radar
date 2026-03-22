"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useTransition } from "react";
import MatchesList from "@/components/MatchesList";
import type { TbaEvent } from "@/app/lib/frc";

interface SearchResult {
  events: TbaEvent[];
  count: number;
  loading: boolean;
  error?: string;
}

export default function MatchesClient() {
  const [allEvents, setAllEvents] = useState<TbaEvent[]>([]);
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult>({ events: [], count: 0, loading: false });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load initial events
  useEffect(() => {
    async function loadEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        setAllEvents(data.events || []);
      } catch {
        setError("Failed to load events - check console");
      }
    }
    loadEvents();
  }, []);

  async function performSearch(searchQuery: string) {
    if (!searchQuery.trim()) {
      setSearchResult({ events: [], count: 0, loading: false });
      return;
    }

    setSearchResult(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setSearchResult({
        events: data.events || [],
        count: data.count || 0,
        loading: false
      });
    } catch (err) {
      setSearchResult({
        events: [],
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
  const statusText = (isSearching && searchResult.loading)
    ? "Searching events..."
    : isSearching
      ? `${searchResult.count} events found`
      : `${allEvents.length} events loaded`;

  const displayEvents = isSearching ? searchResult.events : allEvents;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 70px" }}>
      <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", margin: 0, color: "#67e8f9" }}>Matches</h1>
      <p style={{ color: "#94a3b8", marginTop: "8px" }}>
        Live event schedules and current match timelines (TBA-powered)
      </p>

      <input
        value={query}
        onChange={handleQueryChange}
        placeholder="Search events by name, code, or location..."
        style={{
          width: "100%",
          marginTop: "24px",
          padding: "16px 20px",
          borderRadius: "16px",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          fontSize: "1rem",
          outline: "none",
          backdropFilter: "blur(10px)",
        }}
      />

      {error && (
        <div style={{ marginTop: "18px", color: "#fca5a5", padding: "12px", background: "rgba(252, 165, 165, 0.1)", borderRadius: "8px", borderLeft: "4px solid #ef4444" }}>
          {error}
          <br />
          <small>Add TBA_API_KEY to .env.local or check dev console</small>
        </div>
      )}

      <div style={{ marginTop: "18px", color: "#cbd5e1", fontWeight: 700 }}>
        {statusText}
      </div>

      <div style={{ 
        height: "70vh", 
        marginTop: "24px",
        minHeight: "400px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(148, 163, 184, 0.1)",
        background: "rgba(255,255,255,0.02)",
      }}>
        <MatchesList events={displayEvents} />
      </div>

      {isSearching && searchResult.loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
          Searching events...
        </div>
      )}
    </div>
  );
}

