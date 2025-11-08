import { describe, test, expect } from "vitest";
import {
  normalizeCategory,
  validateWeights,
  calculateCurrentScore,
  calculateRemainingWeight,
} from "../lib/utils/helpers";

describe("normalizeCategory", () => {
  test("should normalize exam variations", () => {
    expect(normalizeCategory("Exam")).toBe("Exams");
    expect(normalizeCategory("exam 1")).toBe("Exams");
    expect(normalizeCategory("Midterm Exam")).toBe("Exams");
  });

  test("should normalize assignment variations", () => {
    expect(normalizeCategory("Assignment")).toBe("Assignments");
    expect(normalizeCategory("HW 1")).toBe("Assignments");
    expect(normalizeCategory("Homework")).toBe("Assignments");
  });

  test("should normalize quiz variations", () => {
    expect(normalizeCategory("Quiz")).toBe("Quizzes");
    expect(normalizeCategory("quiz 1")).toBe("Quizzes");
  });

  test("should return original for unknown categories", () => {
    expect(normalizeCategory("Projects")).toBe("Projects");
  });
});

describe("validateWeights", () => {
  test("should validate correct weight totals", () => {
    expect(
      validateWeights([{ weight: 30 }, { weight: 40 }, { weight: 30 }])
    ).toBe(true);
  });

  test("should reject incorrect weight totals", () => {
    expect(
      validateWeights([{ weight: 30 }, { weight: 40 }, { weight: 20 }])
    ).toBe(false);
  });
});

describe("calculateCurrentScore", () => {
  test("should sum completed assignment scores", () => {
    const score = calculateCurrentScore([
      { earnedScore: 10, status: "completed" },
      { earnedScore: 15, status: "completed" },
      { earnedScore: null, status: "pending" },
    ]);

    expect(score).toBe(25);
  });
});

describe("calculateRemainingWeight", () => {
  test("should sum pending assignment weights", () => {
    const weight = calculateRemainingWeight([
      { weight: 10, status: "completed" },
      { weight: 15, status: "pending" },
      { weight: 20, status: "pending" },
    ]);

    expect(weight).toBe(35);
  });
});
