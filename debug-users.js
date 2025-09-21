// Debug script to check users' activatedAt field
import dbConnect from "./lib/mongodb.js";
import User from "./models/User.js";

async function checkUsers() {
  try {
    await dbConnect();

    const users = await User.find({ isActivated: true })
      .select(
        "memberId name isActivated activatedAt placementParent placementSide"
      )
      .lean();

    console.log("Activated users:");
    users.forEach((user) => {
      console.log({
        memberId: user.memberId,
        name: user.name,
        isActivated: user.isActivated,
        activatedAt: user.activatedAt,
        placementParent: user.placementParent,
        placementSide: user.placementSide,
      });
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();
