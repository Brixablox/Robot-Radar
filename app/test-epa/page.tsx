"use client";

import { getTbaTeamsPage } from '@/app/lib/frc';
import RobotTrailBackground from '@/components/RobotTrailBackground';

export default function TestEpaPage() {
  return (
    <>
      <RobotTrailBackground />
      <main style={{ padding: '80px 24px', color: 'white', minHeight: '100vh' }}>
        <h1>Test EPA Page</h1>
        <p>Testing imports and layout.</p>
      </main>
    </>
  );
}
