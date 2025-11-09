"use client";

import { useEffect } from "react";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  const getColor = () => {
    switch (type) {
      case "success":
        return "#16a34a";
      case "error":
        return "#dc2626";
      case "warning":
        return "#f59e0b";
      default:
        return "#3b82f6";
    }
  };

  return (
    <div
      className="toast"
      style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        backgroundColor: "white",
        color: "#111827",
        padding: "16px 20px",
        borderRadius: "8px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 10000,
        minWidth: "300px",
        maxWidth: "500px",
        animation: "slideIn 0.3s ease-out",
        borderLeft: `4px solid ${getColor()}`,
      }}
    >
      <span
        style={{
          fontSize: "20px",
          color: getColor(),
          fontWeight: "bold",
        }}
      >
        {getIcon()}
      </span>
      <span style={{ flex: 1, fontSize: "14px" }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#6b7280",
          cursor: "pointer",
          fontSize: "18px",
          padding: "0",
          lineHeight: 1,
        }}
      >
        ×
      </button>
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
