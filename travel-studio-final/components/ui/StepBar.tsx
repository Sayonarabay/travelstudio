interface Step { label: string; }

interface StepBarProps {
  steps: Step[];
  current: number; // 0-indexed
}

export function StepBar({ steps, current }: StepBarProps) {
  return (
    <div style={{ background: "var(--white)", borderBottom: "1px solid var(--brd)", padding: "0 32px", height: 50, display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span
                style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0,
                  background: i < current ? "var(--teal)" : i === current ? "var(--teal)" : "var(--brd)",
                  color: i <= current ? "#fff" : "var(--t3)",
                }}
              >
                {i < current ? "✓" : i + 1}
              </span>
              <span
                style={{
                  fontSize: 12, whiteSpace: "nowrap",
                  color: i === current ? "var(--teal)" : "var(--t2)",
                  fontWeight: i === current ? 500 : 400,
                }}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width: 60, height: 1, background: i < current ? "var(--teal)" : "var(--brd)", margin: "0 12px" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
