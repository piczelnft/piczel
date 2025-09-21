import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const includeInactive = url.searchParams.get("includeInactive") === "true";

    if (!q) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    const filter = {
      $or: [
        { memberId: new RegExp(`^${q}`, "i") },
        { name: new RegExp(q, "i") },
        { email: new RegExp(`^${q}`, "i") },
      ],
    };

    if (!includeInactive) {
      filter.isActivated = true;
    }

    const users = await User.find(filter)
      .select("memberId name email isActivated package activatedAt")
      .limit(10)
      .lean();

    return NextResponse.json({ results: users }, { status: 200 });
  } catch (error) {
    console.error("Genealogy search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
