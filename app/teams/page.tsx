import TeamsClient from "./TeamsClient";
import RobotTrailBackground from "@/components/RobotTrailBackground";
import { getTbaTeamsPage } from "@/app/lib/frc";

export default async function TeamsPage() {
 const pages = await Promise.all([
  getTbaTeamsPage(0),
  getTbaTeamsPage(1),
  getTbaTeamsPage(2),
 ]);

 let initialTeams = pages.flat();



  return (
    <>
      <RobotTrailBackground />
      <main
        style={{
          minHeight: "100vh",
          background:
            "radial-gradient(circle at top, #123456 0%, #0B1020 35%, #060b16 100%)",
          color: "white",
          position: "relative",
          zIndex: 1,
          paddingTop: "80px",
        }}
      >
        <TeamsClient initialTeams={initialTeams} />
      </main>
    </>
  );
}
