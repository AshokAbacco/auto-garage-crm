import { useEffect, useRef, useState } from "react";
import { useBookingPopup } from "../providers/BookingPopupProvider";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function BookingPopup() {
  const { booking, clearBooking } = useBookingPopup();

  const [timeLeft, setTimeLeft] = useState(30);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState(null); // 'accepted' | 'rejected' | null

  const startXRef = useRef(0);
  const maxDrag = 140;

  useEffect(() => {
    if (!booking) return;
    setStatus(null);
    setDragX(0);
    setTimeLeft(30);
  }, [booking]);

  useEffect(() => {
    if (!booking || status) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleReject();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [booking, status]);

  if (!booking) return null;

  const progress = (timeLeft / 30) * 100;

  const handleAccept = async () => {
    setStatus("accepted");
    try {
      await fetch(`${API_BASE}/api/marketplace/booking/${booking.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => clearBooking(), 1500);
  };

  const handleReject = async () => {
    setStatus("rejected");
    try {
      await fetch(`${API_BASE}/api/marketplace/booking/${booking.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => clearBooking(), 1500);
  };

  const handleStart = (e) => {
    if (status) return;
    setIsDragging(true);
    startXRef.current = e.clientX || e.touches[0].clientX;
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches[0].clientX;
    const delta = clientX - startXRef.current;

    // Physical resistance formula
    const resistance =
      delta > 0
        ? Math.min(delta, maxDrag + 20)
        : Math.max(delta, -maxDrag - 20);
    setDragX(resistance);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragX > maxDrag * 0.75) {
      handleAccept();
    } else if (dragX < -maxDrag * 0.75) {
      handleReject();
    } else {
      setDragX(0);
    }
  };

  return (
    <div style={styles.overlay}>
      <style>
        {`
          @keyframes popIn {
            0% { transform: scale(0.9); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        `}
      </style>

      <div
        style={{
          ...styles.card,
          transform:
            status === "rejected"
              ? "translateY(50px) scale(0.95)"
              : "translateY(0) scale(1)",
          opacity: status === "rejected" ? 0.8 : 1,
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="animate-pop"
      >
        {/* ACTION OVERLAYS (Accept/Reject) */}
        {status && (
          <div
            style={{
              ...styles.statusOverlay,
              background:
                status === "accepted"
                  ? "rgba(255,255,255,0.95)"
                  : "rgba(255,245,245,0.95)",
            }}
          >
            <div
              style={{
                ...styles.statusIcon,
                background: status === "accepted" ? "#10b981" : "#ef4444",
                boxShadow:
                  status === "accepted"
                    ? "0 10px 25px rgba(16,185,129,0.4)"
                    : "0 10px 25px rgba(239,68,68,0.4)",
              }}
              className={status === "rejected" ? "animate-shake" : ""}
            >
              {status === "accepted" ? "✓" : "✕"}
            </div>
            <p
              style={{
                ...styles.statusText,
                color: status === "accepted" ? "#065f46" : "#991b1b",
              }}
            >
              {status === "accepted" ? "Booking Confirmed" : "Request Declined"}
            </p>
          </div>
        )}

        <div style={{ opacity: status ? 0 : 1, transition: "opacity 0.3s" }}>
          {/* TOP INFO */}
          <div style={styles.header}>
            <div style={styles.brandBadge}>Booking Request</div>
            <div
              style={{
                ...styles.timerText,
                color: timeLeft < 10 ? "#ef4444" : "#6b7280",
              }}
            >
              {timeLeft}s remaining
            </div>
          </div>

          <h2 style={styles.mainTitle}>New Request Incoming</h2>

          {/* INFO GRID */}
          <div style={styles.grid}>
            <div style={styles.gridItem}>
              <span style={styles.gridLabel}>VEHICLE</span>
              <span style={styles.gridValue}>{booking.carType}</span>
            </div>
            <div style={styles.gridItem}>
              <span style={styles.gridLabel}>ESTIMATED FARE</span>
              <span style={styles.gridPrice}>
                ₹{booking.finalPrice || booking.price}
              </span>
            </div>
          </div>

          {/* DYNAMIC TRACKER */}
          <div style={styles.trackContainer}>
            <div
              style={{
                ...styles.trackFill,
                width: `${progress}%`,
                background:
                  timeLeft < 10
                    ? "linear-gradient(90deg, #ef4444, #f87171)"
                    : "linear-gradient(90deg, #6366f1, #818cf8)",
              }}
            />
          </div>

          {/* MODERN SLIDER */}
          <div
            style={styles.sliderPath}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          >
            <div
              style={{
                ...styles.sideLabel,
                left: 20,
                opacity: dragX < -20 ? 1 : 0.3,
              }}
            >
              Decline
            </div>
            <div
              style={{
                ...styles.sideLabel,
                right: 20,
                opacity: dragX > 20 ? 1 : 0.3,
              }}
            >
              Accept
            </div>

            <div
              style={{
                ...styles.handle,
                transform: `translateX(${dragX}px)`,
                background:
                  dragX > 50 ? "#10b981" : dragX < -50 ? "#ef4444" : "#1f2937",
                transition: isDragging
                  ? "none"
                  : "all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
              }}
              onMouseDown={handleStart}
              onTouchStart={handleStart}
            >
              <div style={styles.handleIcon}>
                {dragX > 50 ? "✓" : dragX < -50 ? "✕" : "↔"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.3)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  card: {
    width: "90%",
    maxWidth: "400px",
    background: "rgba(255, 255, 255, 0.95)",
    borderRadius: "32px",
    padding: "32px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  brandBadge: {
    fontSize: "10px",
    fontWeight: "800",
    letterSpacing: "1px",
    padding: "4px 10px",
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: "20px",
  },
  timerText: {
    fontSize: "13px",
    fontWeight: "600",
  },
  mainTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 24px 0",
    letterSpacing: "-0.5px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "28px",
  },
  gridItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  gridLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    letterSpacing: "0.5px",
  },
  gridValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  gridPrice: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#10b981",
  },
  trackContainer: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "10px",
    marginBottom: "32px",
    overflow: "hidden",
  },
  trackFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 1s linear",
  },
  sliderPath: {
    position: "relative",
    height: "72px",
    background: "#f8fafc",
    borderRadius: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e2e8f0",
  },
  sideLabel: {
    position: "absolute",
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    transition: "opacity 0.2s",
    pointerEvents: "none",
  },
  handle: {
    position: "absolute",
    width: "60px",
    height: "60px",
    borderRadius: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "grab",
    zIndex: 10,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
  },
  handleIcon: {
    color: "#fff",
    fontSize: "20px",
    fontWeight: "bold",
  },
  statusOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  statusIcon: {
    width: "80px",
    height: "80px",
    borderRadius: "40px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
    fontSize: "40px",
    marginBottom: "16px",
  },
  statusText: {
    fontSize: "20px",
    fontWeight: "800",
  },
};
