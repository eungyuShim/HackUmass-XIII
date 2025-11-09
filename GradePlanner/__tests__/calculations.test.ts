import { describe, test, expect } from "vitest";
import {
  calculateStrategy1,
  calculateStrategy2,
  calculateStrategy3,
} from "../lib/utils/calculations";
import { CalculationInput } from "../lib/types";

describe("Strategy 1: Even Deduction with Sacrifice", () => {
  test("should calculate minimum required scores with sacrifice", () => {
    const input: CalculationInput = {
      currentScore: 76,
      targetGrade: 93,
      totalWeight: 100,
      categories: [
        { name: "Exams", weight: 30, count: 3 },
        { name: "Quizzes", weight: 24, count: 12 },
      ],
      assignments: [
        {
          id: "1",
          name: "exam1",
          category: "Exams",
          weight: 10,
          earnedScore: 8,
          maxScore: 10,
          status: "completed",
        },
        {
          id: "2",
          name: "exam2",
          category: "Exams",
          weight: 10,
          earnedScore: 9,
          maxScore: 10,
          status: "completed",
        },
        {
          id: "3",
          name: "quiz1-11",
          category: "Quizzes",
          weight: 22,
          earnedScore: 21,
          maxScore: 22,
          status: "completed",
        },
        {
          id: "4",
          name: "exam3",
          category: "Exams",
          weight: 10,
          earnedScore: null,
          maxScore: 10,
          status: "pending",
        },
        {
          id: "5",
          name: "quiz12",
          category: "Quizzes",
          weight: 2,
          earnedScore: null,
          maxScore: 2,
          status: "pending",
        },
      ],
    };

    const result = calculateStrategy1(input);

    expect(result.achievable).toBe(true);
    expect(result.currentProgress).toBeCloseTo(76);

    const exam3 = result.recommendations.find((r) => r.name === "exam3");
    const quiz12 = result.recommendations.find((r) => r.name === "quiz12");

    expect(exam3?.minRequired).toBeGreaterThan(0);
    expect(quiz12?.status).toBe("sacrifice");
  });

  test("should return not achievable when target is impossible", () => {
    const input: CalculationInput = {
      currentScore: 50,
      targetGrade: 95,
      totalWeight: 100,
      categories: [],
      assignments: [
        {
          id: "1",
          name: "exam1",
          category: "Exams",
          weight: 30,
          earnedScore: 15,
          maxScore: 30,
          status: "completed",
        },
        {
          id: "2",
          name: "hw1",
          category: "Assignments",
          weight: 20,
          earnedScore: 15,
          maxScore: 20,
          status: "completed",
        },
        {
          id: "3",
          name: "final",
          category: "Exams",
          weight: 30,
          earnedScore: null,
          maxScore: 30,
          status: "pending",
        },
      ],
    };

    const result = calculateStrategy1(input);

    expect(result.achievable).toBe(false);
  });
});

describe("Strategy 2: Proportional Distribution", () => {
  test("should distribute required scores proportionally", () => {
    const input: CalculationInput = {
      currentScore: 70,
      targetGrade: 90,
      totalWeight: 100,
      categories: [],
      assignments: [
        {
          id: "1",
          name: "completed",
          category: "Exams",
          weight: 40,
          earnedScore: 35,
          maxScore: 40,
          status: "completed",
        },
        {
          id: "2",
          name: "quiz1",
          category: "Quizzes",
          weight: 20,
          earnedScore: null,
          maxScore: 20,
          status: "pending",
        },
        {
          id: "3",
          name: "final",
          category: "Exams",
          weight: 40,
          earnedScore: null,
          maxScore: 40,
          status: "pending",
        },
      ],
    };

    const result = calculateStrategy2(input);

    expect(result.achievable).toBe(true);

    const quiz1 = result.recommendations.find((r) => r.name === "quiz1");
    const final = result.recommendations.find((r) => r.name === "final");

    // Both should have same achievement ratio
    if (quiz1 && final) {
      const quiz1Ratio = quiz1.minRequired / quiz1.weight;
      const finalRatio = final.minRequired / final.weight;
      expect(quiz1Ratio).toBeCloseTo(finalRatio);
    }
  });
});

describe("Strategy 3: Perfect Non-Exam Scores", () => {
  test("should assume perfect scores for non-exam items", () => {
    const input: CalculationInput = {
      currentScore: 60,
      targetGrade: 90,
      totalWeight: 100,
      categories: [],
      assignments: [
        {
          id: "1",
          name: "midterm",
          category: "Exams",
          weight: 30,
          earnedScore: 25,
          maxScore: 30,
          status: "completed",
        },
        {
          id: "2",
          name: "hw1",
          category: "Assignments",
          weight: 20,
          earnedScore: 18,
          maxScore: 20,
          status: "completed",
        },
        {
          id: "3",
          name: "quiz1",
          category: "Quizzes",
          weight: 10,
          earnedScore: null,
          maxScore: 10,
          status: "pending",
        },
        {
          id: "4",
          name: "final",
          category: "Exams",
          weight: 40,
          earnedScore: null,
          maxScore: 40,
          status: "pending",
        },
      ],
    };

    const result = calculateStrategy3(input);

    expect(result.achievable).toBe(true);

    const quiz1 = result.recommendations.find((r) => r.name === "quiz1");
    const final = result.recommendations.find((r) => r.name === "final");

    // Quiz should require perfect score
    expect(quiz1?.minRequired).toBe(quiz1?.weight);

    // Final should require less than perfect
    expect(final?.minRequired).toBeLessThan(final?.weight || 0);
  });
});
