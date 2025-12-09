"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const startTimeRef = useRef<number>(Date.now());
  const sessionIdRef = useRef<string | null>(null);
  const pageViewIdRef = useRef<string | null>(null);

  // Get or create session ID
  useEffect(() => {
    if (typeof window !== "undefined") {
      let sessionId = sessionStorage.getItem("analytics_session_id");
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        sessionStorage.setItem("analytics_session_id", sessionId);
      }
      sessionIdRef.current = sessionId;
    }
  }, []);

  // Track page view
  useEffect(() => {
    // Wait a bit for session ID to be set
    if (!sessionIdRef.current) {
      const checkSession = setInterval(() => {
        if (sessionIdRef.current) {
          clearInterval(checkSession);
          // Retry tracking after session is ready
        }
      }, 100);
      return () => clearInterval(checkSession);
    }

    const startTime = Date.now();
    startTimeRef.current = startTime;
    const fullPath =
      pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");

    // Skip tracking for admin pages in analytics (they're internal)
    // But still track them for completeness - comment out if you want to exclude admin
    // if (pathname.startsWith('/admin')) {
    //   return;
    // }

    // Track page view for ALL visitors (including anonymous)
    const trackPageView = async () => {
      try {
        const response = await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            pagePath: pathname,
            fullPath: fullPath,
            pageTitle: document.title,
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.pageViewId) {
          pageViewIdRef.current = data.pageViewId;
        }
      } catch (error) {
        // Silently fail - don't break the user experience
        console.error("Analytics tracking error:", error);
      }
    };

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(() => {
      trackPageView();
    }, 100);

    // Track time spent when leaving page
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (pageViewIdRef.current && timeSpent > 0) {
        // Use sendBeacon for reliable tracking on page unload
        navigator.sendBeacon(
          "/api/analytics/update-time",
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            timeSpent: timeSpent,
          })
        );
      }
    };

    // Track time spent periodically (every 30 seconds)
    const intervalId = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (pageViewIdRef.current && timeSpent > 0) {
        fetch("/api/analytics/update-time", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageViewId: pageViewIdRef.current,
            timeSpent: timeSpent,
          }),
        }).catch(() => {
          // Silently fail
        });
      }
    }, 30000); // Update every 30 seconds

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Final time update
      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (pageViewIdRef.current && timeSpent > 0) {
        navigator.sendBeacon(
          "/api/analytics/update-time",
          JSON.stringify({
            pageViewId: pageViewIdRef.current,
            timeSpent: timeSpent,
          })
        );
      }
    };
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}
