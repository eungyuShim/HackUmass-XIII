// Test the updated strategies with attendance handling
const {
  proportionalStrategy,
  equalStrategy,
} = require("./GradePlanner/app/types/strategy.ts");

// Mock test data from Python example
const testData = {
  ungradedItems: [
    // Regular items
    { itemName: "exam2", categoryId: 1, itemWeight: 15, isAttendance: false },
    { itemName: "exam3", categoryId: 1, itemWeight: 20, isAttendance: false },
    {
      itemName: "homework",
      categoryId: 2,
      itemWeight: 30,
      isAttendance: false,
    },
    { itemName: "quiz1", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz2", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz3", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz4", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz5", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz6", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz7", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz8", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz9", categoryId: 3, itemWeight: 1, isAttendance: false },
    { itemName: "quiz10", categoryId: 3, itemWeight: 1, isAttendance: false },
    // Attendance items
    {
      itemName: "attendance1",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance2",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance3",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance4",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance5",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance6",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance7",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance8",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance9",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
    {
      itemName: "attendance10",
      categoryId: 4,
      itemWeight: 1,
      isAttendance: true,
    },
  ],
  // exam1 = 80/100 → 12% earned
  // Max possible = 97%
  // Target = 93%
  // Deductible = 4%
  totalDeductiblePoints: 4.0,
};

console.log("=".repeat(70));
console.log("TESTING PROPORTIONAL DISTRIBUTION STRATEGY");
console.log("=".repeat(70));
console.log("\nTest Case: exam1=80/100, Target=93% (A grade)");
console.log("Total deductible points: 4%\n");

try {
  const proportionalResult = proportionalStrategy.calculate(
    testData.ungradedItems,
    testData.totalDeductiblePoints
  );

  console.log("Results:");
  console.log("-".repeat(70));

  // Group results
  const regular = proportionalResult.filter((item) => !item.isAttendance);
  const attendance = proportionalResult.filter((item) => item.isAttendance);

  console.log("\nRegular Items:");
  regular.slice(0, 5).forEach((item) => {
    console.log(
      `  ${item.itemName.padEnd(15)} Weight: ${item.itemWeight.toFixed(
        2
      )}%  Score: ${item.assumedScore.toFixed(2)}/100`
    );
  });

  console.log("\nAttendance Items:");
  const attendCount = attendance.filter((a) => a.assumedScore === 1).length;
  console.log(`  Required: ${attendCount}/${attendance.length} sessions`);
  attendance.forEach((item) => {
    const status = item.assumedScore === 1 ? "Attend ✓" : "Absent ✗";
    console.log(`  ${item.itemName.padEnd(15)} ${status}`);
  });

  // Verify total
  const totalRequired = proportionalResult.reduce((sum, item) => {
    const score = item.isAttendance
      ? item.assumedScore === 1
        ? 100
        : 0
      : item.assumedScore;
    return sum + (item.itemWeight * score) / 100;
  }, 0);

  console.log("\n" + "=".repeat(70));
  console.log(`Total required points: ${totalRequired.toFixed(2)}%`);
  console.log(`With completed (12%): ${(12 + totalRequired).toFixed(2)}%`);
  console.log(`Target: 93%`);
  console.log(
    `Match: ${Math.abs(12 + totalRequired - 93) < 0.1 ? "✅ YES" : "❌ NO"}`
  );
} catch (error) {
  console.error("Error:", error.message);
  console.error(error.stack);
}

console.log("\n\n");
console.log("=".repeat(70));
console.log("TESTING EQUAL DISTRIBUTION STRATEGY");
console.log("=".repeat(70));

try {
  const equalResult = equalStrategy.calculate(
    testData.ungradedItems,
    testData.totalDeductiblePoints
  );

  console.log("\nResults:");
  console.log("-".repeat(70));

  // Group results
  const regular = equalResult.filter((item) => !item.isAttendance);
  const attendance = equalResult.filter((item) => item.isAttendance);

  console.log("\nRegular Items (showing first 5):");
  regular.slice(0, 5).forEach((item) => {
    console.log(
      `  ${item.itemName.padEnd(15)} Weight: ${item.itemWeight.toFixed(
        2
      )}%  Score: ${item.assumedScore.toFixed(2)}/100`
    );
  });

  console.log("\nAttendance Items:");
  const attendCount = attendance.filter((a) => a.assumedScore === 1).length;
  console.log(`  Required: ${attendCount}/${attendance.length} sessions`);
  attendance.forEach((item) => {
    const status = item.assumedScore === 1 ? "Attend ✓" : "Absent ✗";
    console.log(`  ${item.itemName.padEnd(15)} ${status}`);
  });

  // Verify total
  const totalRequired = equalResult.reduce((sum, item) => {
    const score = item.isAttendance
      ? item.assumedScore === 1
        ? 100
        : 0
      : item.assumedScore;
    return sum + (item.itemWeight * score) / 100;
  }, 0);

  console.log("\n" + "=".repeat(70));
  console.log(`Total required points: ${totalRequired.toFixed(2)}%`);
  console.log(`With completed (12%): ${(12 + totalRequired).toFixed(2)}%`);
  console.log(`Target: 93%`);
  console.log(
    `Match: ${Math.abs(12 + totalRequired - 93) < 0.1 ? "✅ YES" : "❌ NO"}`
  );
} catch (error) {
  console.error("Error:", error.message);
  console.error(error.stack);
}
