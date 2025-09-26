// Debug script to check users' activatedAt field
import dbConnect from "./lib/mongodb.js";
import User from "./models/User.js";

async function checkUsers() {
  try {
    await dbConnect();

    const users = await User.find({ isActivated: true })
      .select("memberId name isActivated activatedAt sponsor")
      .lean();

    console.log("Activated users:");
    users.forEach((user) => {
      console.log({
        memberId: user.memberId,
        name: user.name,
        isActivated: user.isActivated,
        activatedAt: user.activatedAt,
        sponsor: user.sponsor,
      });
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

checkUsers();
