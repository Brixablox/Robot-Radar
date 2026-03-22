"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/scout", label: "Scout" },
  { href: "/auto", label: "Auto" },
  { href: "/teams", label: "Teams" },
  { href: "/compare", label: "Compare" },
];

function parseSessionToken(): any {
  if (typeof document === 'undefined') return null;
  const name = 'sessionToken=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) {
      try {
        const token = c.substring(name.length, c.length);
        const decoded = Buffer.from(token, 'base64').toString();
        return JSON.parse(decoded) as { username: string; id: string; teamNumber?: number; role: string };
      } catch {
        return null;
      }
    }
  }
  return null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ username: string; id: string; teamNumber?: number; role: string } | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const session = parseSessionToken();
    setUser(session);
    setLoading(false);
  }, []); 

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(8, 22, 38, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(34, 211, 238, 0.15)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* LOGO */}
        <Link href="/">
          <img
            src="/logo.png"
            alt="RobotRadar"
            style={{
              height: "45px",
              width: "auto",
              objectFit: "contain",
              cursor: "pointer",
              filter: "drop-shadow(0 0 10px rgba(34,211,238,0.35))",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.06)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          />
        </Link>

        {/* NAV BUTTONS */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link key={link.href} href={link.href}>
                <button
                  type="button"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: active
                      ? "1px solid #22d3ee"
                      : "1px solid rgba(148,163,184,0.2)",
                    background: active
                      ? "linear-gradient(135deg, #22d3ee, #0891b2)"
                      : "rgba(255,255,255,0.04)",
                    color: active ? "#04111f" : "#e2e8f0",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: active
                      ? "0 8px 20px rgba(34,211,238,0.3)"
                      : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        "rgba(34,211,238,0.15)";
                      e.currentTarget.style.border =
                        "1px solid rgba(34,211,238,0.4)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.04)";
                      e.currentTarget.style.border =
                        "1px solid rgba(148,163,184,0.2)";
                    }
                  }}
                >
                  {link.label}
                </button>
              </Link>
            );
          })}

          {loading ? null : user ? (
            <>
              <Link href="/profile">
                <button
                  type="button"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(34,211,238,0.3)",
                    color: "#67e8f9",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  {user.username}
                </button>
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  background: "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <button
                  type="button"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(34,211,238,0.4)",
                    background: "rgba(34,211,238,0.1)",
                    color: "#67e8f9",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>
              </Link>
              <Link href="/auth/signup">
                <button
                  type="button"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #22d3ee, #0891b2)",
                    border: "none",
                    color: "#04111f",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 15px rgba(34,211,238,0.3)",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
