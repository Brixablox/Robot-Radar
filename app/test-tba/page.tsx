import { getTbaTeamsPage } from "@/app/lib/frc";

export default async function TestTbaPage() {
  const page0 = await getTbaTeamsPage(0);
  const page1 = await getTbaTeamsPage(1);

  return (
    <main
      style={{
        padding: 40,
        background: "black",
        color: "white",
        minHeight: "100vh",
      }}
    >
      <div>page0 length: {page0.length}</div>
      <div>page1 length: {page1.length}</div>

      <pre style={{ marginTop: 20, whiteSpace: "pre-wrap" }}>
        {JSON.stringify(
          {
            page0First5: page0.slice(0, 5).map((t) => ({
              key: t.key,
              team_number: t.team_number,
              nickname: t.nickname,
            })),
            page1First5: page1.slice(0, 5).map((t) => ({
              key: t.key,
              team_number: t.team_number,
              nickname: t.nickname,
            })),
          },
          null,
          2
        )}
      </pre>
    </main>
  );
}