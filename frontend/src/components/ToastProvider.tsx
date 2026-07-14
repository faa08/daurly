"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type?: "success" | "error" | "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    
    // Automatically detect type from message keywords if not provided
    let detectedType: "success" | "error" | "info" = type || "info";
    if (!type) {
      const msg = message.toLowerCase();
      if (
        msg.includes("berhasil") || 
        msg.includes("sukses") || 
        msg.includes("disalin") || 
        msg.includes("disetujui") || 
        msg.includes("ditambahkan") || 
        msg.includes("selamat") ||
        msg.includes("terkirim") ||
        msg.includes("disimpan")
      ) {
        detectedType = "success";
      } else if (
        msg.includes("gagal") || 
        msg.includes("salah") || 
        msg.includes("tidak ditemukan") || 
        msg.includes("tidak valid") || 
        msg.includes("error") || 
        msg.includes("ditolak") ||
        msg.includes("batal") ||
        msg.includes("maksimal")
      ) {
        detectedType = "error";
      }
    }

    setToasts((prev) => [...prev, { id, message, type: detectedType }]);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Store original alert
      const originalAlert = window.alert;

      // Override with custom toast
      window.alert = (message: any) => {
        const msgStr = typeof message === "object" ? JSON.stringify(message) : String(message);
        addToast(msgStr);
      };

      return () => {
        window.alert = originalAlert;
      };
    }
  }, [addToast]);

  return (
    <>
      {children}
      
      {/* Toast Portal Container */}
      <div 
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          maxWidth: "380px",
          width: "calc(100% - 48px)",
          pointerEvents: "none"
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          
          let bgColor = "rgba(255, 255, 255, 0.9)";
          let borderColor = "#EAE5E0";
          let iconColor = "#16A34A";
          let title = "Informasi";
          let IconComponent = Info;

          if (isSuccess) {
            bgColor = "rgba(240, 253, 244, 0.95)";
            borderColor = "#BBF7D0";
            iconColor = "#16A34A";
            title = "Berhasil";
            IconComponent = CheckCircle2;
          } else if (isError) {
            bgColor = "rgba(254, 242, 242, 0.95)";
            borderColor = "#FECACA";
            iconColor = "#DC2626";
            title = "Peringatan";
            IconComponent = AlertCircle;
          }

          return (
            <div
              key={toast.id}
              style={{
                display: "flex",
                gap: "12px",
                padding: "16px 16px 16px 20px",
                background: bgColor,
                border: `1.5px solid ${borderColor}`,
                borderRadius: "14px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
                pointerEvents: "auto",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                animation: "toast-slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                backdropFilter: "blur(8px)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              {/* Colored side indicator bar */}
              <div 
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: "5px",
                  background: iconColor
                }}
              />

              <div style={{ color: iconColor, marginTop: "2px", flexShrink: 0 }}>
                <IconComponent size={20} />
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#1F1B18" }}>
                  {title}
                </span>
                <p style={{ fontSize: "0.78rem", color: "#5C5550", margin: 0, lineHeight: 1.45, whiteSpace: "pre-line" }}>
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  color: "#8E8680",
                  background: "transparent",
                  border: "none",
                  padding: "4px",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.15s",
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toast-slide-in {
          from {
            transform: translateX(120%) scale(0.95);
            opacity: 0;
          }
          to {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }
      `}} />
    </>
  );
}
