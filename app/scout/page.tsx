export default function ScoutPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0B1020 0%, #081626 100%)",
        color: "white",
        padding: "40px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "12px", color: "#67e8f9" }}>
          Scout
        </h1>
        <p style={{ color: "#cbd5e1" }}>
          Enter team and match details here.
        </p>
      </div>
    </main>
  );
}