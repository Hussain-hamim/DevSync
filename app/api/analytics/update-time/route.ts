import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageViewId, timeSpent } = body;

    if (!pageViewId || !timeSpent) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Update time spent for this page view
    const { error } = await supabaseAdmin
      .from("page_views")
      .update({ time_spent: timeSpent })
      .eq("id", pageViewId);

    if (error) {
      console.error("Analytics update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics update error:", error);
    return NextResponse.json(
      { error: "Failed to update time spent" },
      { status: 500 }
    );
  }
}
