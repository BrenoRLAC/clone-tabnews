import useSWR from "swr";

const theme = {
  bgPage: "#1f1f1f",
  bgCard: "#292929",
  bgSurface: "#1b1b1b",
  border: "#3b4151",
  textPrimary: "#ffffff",
  textSecondary: "#b4b4b4",
  textMuted: "#898989",
  accentBlue: "#61affe",
  healthy: {
    text: "#49cc90",
    bg: "rgba(73, 204, 144, 0.1)",
    border: "#49cc90",
  },
  warning: {
    text: "#fca130",
    bg: "rgba(252, 161, 48, 0.1)",
    border: "#fca130",
  },
  critical: {
    text: "#f93e3e",
    bg: "rgba(249, 62, 62, 0.1)",
    border: "#f93e3e",
  },
  unknown: {
    text: "#b4b4b4",
    bg: "rgba(180, 180, 180, 0.1)",
    border: "#555555",
  },
};

const pageStyle = {
  position: "fixed",
  inset: 0,
  overflowY: "auto",
  backgroundColor: theme.bgPage,
  color: theme.textPrimary,
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "32px 24px",
  boxSizing: "border-box",
};

const containerStyle = {
  maxWidth: "860px",
  margin: "0 auto",
};

async function fetcher(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  return response.json();
}

export default function StatusPage() {
  const { data, isLoading, error } = useSWR("/api/v1/status", fetcher, {
    refreshInterval: 2000,
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return <StatusContent data={data} />;
}

function LoadingState() {
  return (
    <div style={pageStyle}>
      <div
        style={{
          ...containerStyle,
          backgroundColor: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: "4px",
          padding: "48px 24px",
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            margin: "0 auto 16px",
            border: `3px solid ${theme.border}`,
            borderTopColor: theme.accentBlue,
            borderRadius: "50%",
          }}
        />
        <p
          style={{
            margin: 0,
            color: theme.textSecondary,
            fontSize: "14px",
            fontFamily: "monospace",
          }}
        >
          Loading system status...
        </p>
      </div>
    </div>
  );
}

function ErrorState({ error }) {
  return (
    <div style={pageStyle}>
      <div
        style={{
          ...containerStyle,
          backgroundColor: theme.critical.bg,
          border: `1px solid ${theme.critical.border}`,
          borderRadius: "4px",
          padding: "24px",
          marginTop: "40px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "18px",
            fontWeight: 700,
            color: theme.critical.text,
          }}
        >
          ⚠️ Status Unavailable
        </h1>
        <p
          style={{
            margin: "0 0 16px",
            fontSize: "14px",
            fontFamily: "monospace",
            color: theme.textPrimary,
            backgroundColor: theme.bgSurface,
            padding: "10px 12px",
            borderRadius: "4px",
            border: `1px solid ${theme.border}`,
          }}
        >
          {error.message}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: "transparent",
            color: theme.critical.text,
            border: `1px solid ${theme.critical.border}`,
            borderRadius: "4px",
            padding: "6px 16px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function StatusContent({ data }) {
  const { updated_at, dependencies } = data;
  const percentage =
    (dependencies.openedConnections / dependencies.maxConnections) * 100;

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: "12px",
            paddingBottom: "16px",
            marginBottom: "24px",
            borderBottom: `1px solid ${theme.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "26px",
                fontWeight: 700,
                color: theme.textPrimary,
              }}
            >
              System Status
            </h1>
            <span
              style={{
                backgroundColor: "#49cc90",
                color: "#1f1f1f",
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "10px",
                fontFamily: "monospace",
              }}
            >
              v1
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: theme.textSecondary,
              fontFamily: "monospace",
            }}
          >
            Last updated: {new Date(updated_at).toLocaleString()}
          </p>
        </header>

        <div style={{ display: "grid", gap: "16px" }}>
          <StatusCard
            title="Database"
            icon="🗄️"
            status={getHealthStatus(
              dependencies.openedConnections,
              dependencies.maxConnections,
            )}
          >
            <InfoRow
              label="PostgreSQL Version"
              value={dependencies.version}
              icon="🐘"
            />
            <InfoRow
              label="Max Connections"
              value={dependencies.maxConnections}
              icon="🔗"
            />
            <ConnectionBar
              percentage={percentage}
              opened={dependencies.openedConnections}
              max={dependencies.maxConnections}
            />
          </StatusCard>
        </div>

        <footer
          style={{
            marginTop: "24px",
            paddingTop: "12px",
            borderTop: `1px solid ${theme.border}`,
            textAlign: "right",
            fontSize: "12px",
            color: theme.textMuted,
            fontFamily: "monospace",
          }}
        >
          <p style={{ margin: 0 }}>Auto-refreshing every 2 seconds</p>
        </footer>
      </div>
    </div>
  );
}

function StatusCard({ title, icon, status, children }) {
  const statusPalette = theme[status] || theme.unknown;

  return (
    <div
      style={{
        backgroundColor: statusPalette.bg,
        border: `1px solid ${statusPalette.border}`,
        borderRadius: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: theme.bgCard,
          borderBottom: `1px solid ${statusPalette.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>{icon}</span>
          <h2
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              fontFamily: "monospace",
              color: theme.textPrimary,
            }}
          >
            {title}
          </h2>
        </div>

        <span
          style={{
            backgroundColor: statusPalette.border,
            color: "#1f1f1f",
            fontSize: "12px",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "3px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            minWidth: "84px",
            textAlign: "center",
          }}
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div
        style={{
          padding: "16px",
          backgroundColor: theme.bgSurface,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: "4px",
        fontSize: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: theme.textSecondary,
        }}
      >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <span
        style={{
          fontFamily: "monospace",
          fontWeight: 600,
          color: theme.accentBlue,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ConnectionBar({ percentage, opened, max }) {
  const barStatus = getHealthStatus(percentage);
  const statusPalette = theme[barStatus] || theme.unknown;

  return (
    <div
      style={{
        padding: "12px",
        backgroundColor: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
          fontSize: "13px",
          fontFamily: "monospace",
        }}
      >
        <span style={{ color: theme.textSecondary }}>
          {opened} / {max} active
        </span>
        <span style={{ fontWeight: 700, color: statusPalette.text }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "8px",
          backgroundColor: theme.bgSurface,
          border: `1px solid ${theme.border}`,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(percentage, 100)}%`,
            backgroundColor: statusPalette.border,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function getHealthStatus(value, max) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "unknown";
  }
  const percentage = max !== undefined ? (value / max) * 100 : value;
  if (percentage < 50) return "healthy";
  if (percentage < 80) return "warning";
  return "critical";
}

function getStatusLabel(status) {
  switch (status) {
    case "healthy":
      return "Healthy";
    case "warning":
      return "Warning";
    case "critical":
      return "Critical";
    default:
      return "Unknown";
  }
}
