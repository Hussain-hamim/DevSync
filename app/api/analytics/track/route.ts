import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/authOptions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      pagePath,
      fullPath,
      pageTitle,
      referrer,
      userAgent,
      timestamp,
    } = body;

    // Get user session if available
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email
      ? await getUserIdByEmail(session.user.email)
      : null;

    // Parse user agent
    const deviceInfo = parseUserAgent(userAgent);

    // Get IP address from request headers
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Insert page view
    const { data, error } = await supabaseAdmin
      .from("page_views")
      .insert({
        user_id: userId,
        session_id: sessionId,
        page_path: pagePath,
        page_title: pageTitle || null,
        referrer: referrer || null,
        user_agent: userAgent,
        ip_address: ipAddress,
        device_type: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        time_spent: 0,
        created_at: timestamp || new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("Analytics tracking error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ pageViewId: data.id, success: true });
  } catch (error) {
    console.error("Analytics tracking error:", error);
    return NextResponse.json(
      { error: "Failed to track page view" },
      { status: 500 }
    );
  }
}

async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    return data?.id || null;
  } catch {
    return null;
  }
}

function parseUserAgent(userAgent: string) {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let deviceType = "desktop";
  if (
    /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)
  ) {
    deviceType = "mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  }

  // Detect browser
  let browser = "unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  }

  // Detect OS
  let os = "unknown";
  if (ua.includes("windows")) {
    os = "Windows";
  } else if (ua.includes("mac os") || ua.includes("macos")) {
    os = "macOS";
  } else if (ua.includes("linux")) {
    os = "Linux";
  } else if (ua.includes("android")) {
    os = "Android";
  } else if (
    ua.includes("ios") ||
    ua.includes("iphone") ||
    ua.includes("ipad")
  ) {
    os = "iOS";
  }

  return { deviceType, browser, os };
}
