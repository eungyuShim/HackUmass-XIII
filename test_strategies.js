// Quick test to verify strategy logic matches Python examples

// Test data from Python example:
// exam1 (15%), exam2 (15%), exam3 (20%), homework (30%), quiz1-10 (1% each)
// Completed: exam1 = 80/100
// Target: 93% (A grade)
// Current score: 15% * 0.8 = 12%
// Max possible: 12% + 85% = 97%
// Deductible: 97% - 93% = 4%

const testUngradedItems = [
  { itemName: 'exam2', itemWeight: 15, categoryName: 'Exams' },
  { itemName: 'exam3', itemWeight: 20, categoryName: 'Exams' },
  { itemName: 'homework', itemWeight: 30, categoryName: 'Homework' },
  { itemName: 'quiz1', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz2', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz3', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz4', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz5', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz6', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz7', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz8', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz9', itemWeight: 1, categoryName: 'Quizzes' },
  { itemName: 'quiz10', itemWeight: 1, categoryName: 'Quizzes' },
];

const totalDeductiblePoints = 4; // 97% - 93% = 4%

console.log('='.repeat(70));
console.log('EQUAL DISTRIBUTION STRATEGY');
console.log('='.repeat(70));

// Equal: Each item gets same deduction amount
const equalDeduction = totalDeductiblePoints / testUngradedItems.length;
console.log(`\nEqual deduction per item: ${equalDeduction.toFixed(4)}%`);
console.log(`Total items: ${testUngradedItems.length}`);

console.log('\nItem                Weight    Deduction  Required%  Score');
console.log('-'.repeat(70));
testUngradedItems.forEach(item => {
  const deduction = Math.min(equalDeduction, item.itemWeight);
  const requiredPct = item.itemWeight - deduction;
  const requiredScore = (requiredPct / item.itemWeight) * 100;
  console.log(
    `${item.itemName.padEnd(20)} ${item.itemWeight.toString().padStart(5)}%   ` +
    `${deduction.toFixed(4).padStart(8)}%  ${requiredPct.toFixed(4).padStart(8)}%  ` +
    `${requiredScore.toFixed(2).padStart(6)}/100`
  );
});

console.log('\n' + '='.repeat(70));
console.log('PROPORTIONAL DISTRIBUTION STRATEGY');
console.log('='.repeat(70));

// Proportional: Deduction proportional to weight
const totalWeight = testUngradedItems.reduce((sum, item) => sum + item.itemWeight, 0);
console.log(`\nTotal weight: ${totalWeight}%`);
console.log(`Total deductible: ${totalDeductiblePoints}%`);

console.log('\nItem                Weight    Share    Deduction  Required%  Score');
console.log('-'.repeat(70));
testUngradedItems.forEach(item => {
  const share = item.itemWeight / totalWeight;
  const deduction = totalDeductiblePoints * share;
  const requiredPct = item.itemWeight - deduction;
  const requiredScore = (requiredPct / item.itemWeight) * 100;
  console.log(
    `${item.itemName.padEnd(20)} ${item.itemWeight.toString().padStart(5)}%   ` +
    `${share.toFixed(4)}   ${deduction.toFixed(4).padStart(8)}%  ${requiredPct.toFixed(4).padStart(8)}%  ` +
    `${requiredScore.toFixed(2).padStart(6)}/100`
  );
});

// Verification
console.log('\n' + '='.repeat(70));
console.log('VERIFICATION');
console.log('='.repeat(70));

const equalTotal = testUngradedItems.reduce((sum, item) => {
  const deduction = Math.min(totalDeductiblePoints / testUngradedItems.length, item.itemWeight);
  return sum + (item.itemWeight - deduction);
}, 0);

const propTotal = testUngradedItems.reduce((sum, item) => {
  const share = item.itemWeight / totalWeight;
  const deduction = totalDeductiblePoints * share;
  return sum + (item.itemWeight - deduction);
}, 0);

console.log(`\nEqual Strategy Total Required: ${equalTotal.toFixed(4)}% + 12% (completed) = ${(equalTotal + 12).toFixed(2)}%`);
console.log(`Proportional Strategy Total Required: ${propTotal.toFixed(4)}% + 12% (completed) = ${(propTotal + 12).toFixed(2)}%`);
console.log(`Target: 93%`);
