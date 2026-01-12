import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out the user
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out:", error);
      return NextResponse.json({ error: { message: "Failed to sign out" } }, { status: 500 });
    }

    // Return success with redirect URL
    return NextResponse.json(
      { message: "Successfully signed out", redirect: "/" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error during logout:", error);
    return NextResponse.json(
      { error: { message: "An unexpected error occurred" } },
      { status: 500 }
    );
  }
}
