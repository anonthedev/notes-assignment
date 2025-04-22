import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notes - Get all notes for a user
// GET /api/notes?uuid={uuid} - Get a specific note
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get("uuid");

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let query = supabase.from("library").select("*").eq("email", user.email);

    // If UUID is provided, get specific note
    if (uuid) {
      query = query.eq("uuid", uuid);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notes:", error);
      return NextResponse.json(
        { error: "Failed to fetch notes" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/notes?uuid={uuid} - Update a specific note
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notes, title, email } = body;

    if (!notes) {
      return NextResponse.json(
        { error: "Notes content is required" },
        { status: 400 }
      );
    }

    // Update the note
    const { data, error } = await supabase
      .from("library")
      .update({
        notes,
        title,
        email: email || user.email,
        updated_at: new Date().toISOString(),
      })
      .eq("uuid", uuid)
      .eq("email", user.email)
      .select();

    if (error) {
      console.error("Error updating note:", error);
      return NextResponse.json(
        { error: "Failed to update note" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in PUT /api/notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notes, title } = body;

    if (!notes) {
      return NextResponse.json(
        { error: "Notes content is required" },
        { status: 400 }
      );
    }
    console.log(user);
    // Create a new note
    const { data, error } = await supabase
      .from("library")
      .insert({
        notes,
        title,
        email: user.email,
        // created_at: new Date().toISOString(),
        // updated_at: new Date().toISOString(),
      })
      .select();
    console.log(data);
    if (error) {
      console.error("Error creating note:", error);
      return NextResponse.json(
        { error: "Failed to create note" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in POST /api/notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/notes?uuid={uuid} - Delete a specific note
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const uuid = searchParams.get("uuid");

    if (!uuid) {
      return NextResponse.json({ error: "UUID is required" }, { status: 400 });
    }

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the note
    const { error } = await supabase
      .from("library")
      .delete()
      .eq("uuid", uuid)
      .eq("email", user.email);

    if (error) {
      console.error("Error deleting note:", error);
      return NextResponse.json(
        { error: "Failed to delete note" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/notes:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
