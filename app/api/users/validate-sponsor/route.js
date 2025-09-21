import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const memberId = (url.searchParams.get("memberId") || "").trim();

    if (!memberId) {
      return NextResponse.json(
        { valid: false, error: "memberId is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ memberId }).select(
      "memberId name isActivated package"
    );

    if (!user) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }

    return NextResponse.json(
      {
        valid: true,
        sponsor: {
          memberId: user.memberId,
          name: user.name,
          isActivated: user.isActivated,
          package: user.package || "",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Validate sponsor error:", error);
    return NextResponse.json(
      { valid: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
