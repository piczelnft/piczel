// Test different users' genealogy trees
import dbConnect from "./lib/mongodb.js";
import User from "./models/User.js";

async function testGenealogy() {
  try {
    await dbConnect();

    // Get all activated users
    const users = await User.find({ isActivated: true })
      .select("_id memberId name placementParent placementSide")
      .lean();

    console.log("All activated users:");
    users.forEach((user) => {
      console.log(
        `${user.memberId}: ${user.name} (parent: ${
          user.placementParent || "ROOT"
        }, side: ${user.placementSide || "N/A"})`
      );
    });

    console.log("\n--- Tree structure for each user ---");

    for (const user of users) {
      const children = await User.find({
        placementParent: user._id,
        isActivated: true,
      })
        .select("memberId name placementSide")
        .lean();

      console.log(`\n${user.memberId} (${user.name}) has children:`);
      if (children.length === 0) {
        console.log("  No children");
      } else {
        children.forEach((child) => {
          console.log(
            `  ${child.placementSide}: ${child.memberId} (${child.name})`
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
