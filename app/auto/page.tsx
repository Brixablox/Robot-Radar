export default function AutoPage() {
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
          Auto
        </h1>
        <p style={{ color: "#cbd5e1", marginBottom: "40px" }}>
          Field visualization for autonomous phase scouting
        </p>
        
        <div style={{ textAlign: "center" }}>
          <img
            src="/2026field.png"
            alt="2026 FRC Field"
            style={{
              maxWidth: "100%",
              height: "auto",
              borderRadius: "8px",
              boxShadow: "0 0 20px rgba(34, 211, 238, 0.25)",
            }}
          />
        </div>
      </div>
    </main>
  );
}
