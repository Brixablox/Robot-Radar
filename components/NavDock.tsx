"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Dock, { DockItem } from "./Dock";
import { Home, Crosshair as ScoutIcon, Zap as AutoIcon, Users, BarChart3 as CompareIcon, User, LogOut, LogIn, UserPlus } from "lucide-react";

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
        return JSON.parse(decoded);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export default function NavDock() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
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

  const links = [
    { href: "/", label: "Home", icon: <Home /> },
    { href: "/scout", label: "Scout", icon: <ScoutIcon /> },
    { href: "/auto", label: "Auto", icon: <AutoIcon /> },
    { href: "/teams", label: "Teams", icon: <Users /> },
    { href: "/compare", label: "Compare", icon: <CompareIcon /> },
  ];

  const navItems: DockItem[] = [];

  links.forEach((link) => {
    const isActive = pathname === link.href;
    navItems.push({
      icon: link.icon,
      label: link.label,
      onClick: () => (window.location.href = link.href),
      className: isActive ? "ring-2 ring-cyan-400 ring-opacity-50" : "",
    });
  });

  if (!loading) {
    if (user) {
      navItems.push({
        icon: <User />,
        label: user.username,
        onClick: () => (window.location.href = '/profile'),
      });
      navItems.push({
        icon: <LogOut />,
        label: "Logout",
        onClick: handleLogout,
      });
    } else {
      navItems.push({
        icon: <LogIn />,
        label: "Login",
        onClick: () => (window.location.href = '/auth/login'),
      });
      navItems.push({
        icon: <UserPlus />,
        label: "Sign Up",
        onClick: () => (window.location.href = '/auth/signup'),
      });
    }
  }

  return <Dock items={navItems} panelHeight={70} baseItemSize={65} magnification={140} dockHeight={400} distance={160} />;
}
