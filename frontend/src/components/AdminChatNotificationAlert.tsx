"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageSquare, X } from "lucide-react";
import { authService } from "@/backend/authService";
import { notificationService, NotificationItem } from "@/backend/notificationService";

export default function AdminChatNotificationAlert() {
  const router = useRouter();
  const [activeAlert, setActiveAlert] = useState<NotificationItem | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Track notifications we have already displayed an alert for
  const alertedIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);

  const checkNotifications = useCallback(async (userId: string) => {
    try {
      const list = await notificationService.getForUser(userId);
      const unreadList = list.filter((item) => item.unread);

      // On first load, we populate the set with existing unread notification IDs
      // so we don't spam popups for old messages when the admin refreshes the page.
      if (isFirstLoadRef.current) {
        unreadList.forEach((item) => alertedIdsRef.current.add(item.id));
        isFirstLoadRef.current = false;
        return;
      }

      // Check if there is any new unread notification that we haven't alerted for yet
      const newUnread = unreadList.find((item) => !alertedIdsRef.current.has(item.id));

      if (newUnread) {
        // Add to alerted set
        alertedIdsRef.current.add(newUnread.id);
        
        // Only trigger popup if the notification relates to chat/messages/shipping
        const lowerText = newUnread.text.toLowerCase();
        const isChat = 
          lowerText.includes("chat") || 
          lowerText.includes("pesan") || 
          lowerText.includes("balasan") ||
          newUnread.link?.includes("/admin/chat");
          
        if (isChat) {
          // Play a browser notification beep if possible (subtle context-free synth sound)
          try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5 note
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch {
            // Audio context might be blocked or unsupported, fail silently
          }

          setActiveAlert(newUnread);
        }
      }
    } catch (err) {
      console.warn("Failed to check notifications for admin:", err);
    }
  }, []);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.role === "admin") {
      setIsAdmin(true);
      
      // Perform initial check
      checkNotifications(user.id_user);

      // Poll notifications every 5 seconds
      const interval = setInterval(() => {
        checkNotifications(user.id_user);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setIsAdmin(false);
    }
  }, [checkNotifications]);

  const handleOpenChat = async () => {
    if (!activeAlert) return;
    
    // Mark as read
    try {
      await notificationService.markAsRead(activeAlert.id, true);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }

    const targetLink = activeAlert.link || "/admin/chat";
    setActiveAlert(null);
    router.push(targetLink);
  };

  const handleClose = () => {
    setActiveAlert(null);
  };

  if (!isAdmin || !activeAlert) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10000,
        width: "100%",
        maxWidth: "480px",
        padding: "0 16px",
        boxSizing: "border-box",
        pointerEvents: "none",
      }}
    >
      <div
        className="bg-white border-2 border-primary rounded-2xl shadow-2xl p-6 pointer-events-auto"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 40px rgba(255, 111, 0, 0.15)",
          animation: "admin-alert-bounce 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both",
          borderLeft: "8px solid #16A34A"
        }}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-primary flex-shrink-0">
              <Bell className="animate-wiggle" size={24} style={{ color: "#16A34A" }} />
            </div>
            <div className="space-y-1">
              <h4 className="font-headline font-extrabold text-base text-[#1F1B18] flex items-center gap-1.5">
                Pesan Chat Baru Masuk!
              </h4>
              <p className="text-xs text-[#3E3834] font-medium leading-relaxed mt-1 whitespace-pre-line bg-surface-container-low/50 p-2.5 rounded-lg border border-[#EAE5E0]">
                {activeAlert.text}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition text-[#8E8680] flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-[#D5CFC9] rounded-lg text-xs font-bold text-[#5C5550] hover:bg-[#F5F3F0] transition"
          >
            Nanti Saja
          </button>
          <button
            onClick={handleOpenChat}
            className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:opacity-90 transition flex items-center gap-1.5 shadow-sm"
          >
            <MessageSquare size={14} />
            Buka Chat Sekarang
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes admin-alert-bounce {
          0% {
            transform: translateY(-50px) scale(0.9);
            opacity: 0;
          }
          60% {
            transform: translateY(10px) scale(1.02);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        .animate-wiggle {
          animation: admin-wiggle 1s ease-in-out infinite;
        }

        @keyframes admin-wiggle {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(-15deg); }
          30% { transform: rotate(10deg); }
          45% { transform: rotate(-10deg); }
          60% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
      `}} />
    </div>
  );
}
