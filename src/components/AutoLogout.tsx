"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";

const AUTO_LOGOUT_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

export default function AutoLogout() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session) return; // Only track if logged in

    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        // Idle time reached, sign out
        signOut({ callbackUrl: "/login" });
      }, AUTO_LOGOUT_TIME);
    };

    // Set initial timer
    resetTimer();

    // Listeners for user activity
    const events = ["mousemove", "keydown", "scroll", "click", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [session]);

  return null; // Invisible component
}
