// Test different users' genealogy trees
import dbConnect from "./lib/mongodb.js";
import User from "./models/User.js";

async function testGenealogy() {
  try {
    await dbConnect();

    // Get all activated users
    const users = await User.find({ isActivated: true })
      .select("_id memberId name sponsor")
      .lean();

    console.log("All activated users:");
    users.forEach((user) => {
      console.log(
        `${user.memberId}: ${user.name} (sponsor: ${
          user.sponsor || "ROOT"
        })`
      );
    });

    console.log("\n--- Tree structure for each user ---");

    for (const user of users) {
      const children = await User.find({
        sponsor: user._id,
        isActivated: true,
      })
        .select("memberId name")
        .lean();

      console.log(`\n${user.memberId} (${user.name}) has direct children:`);
      if (children.length === 0) {
        console.log("  No direct children");
      } else {
        children.forEach((child) => {
          console.log(
            `  Direct: ${child.memberId} (${child.name})`
          );
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

testGenealogy();
