"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  name: string;
  term: string;
}

export default function CoursesPage() {
  const router = useRouter();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const tokenPresent = sessionStorage.getItem("canvas_token_present") === "1";
    setHasToken(tokenPresent);
  }, []);

  // Demo courses
  const courses: Course[] = [
    { id: "C-160", name: "MICROBIO 160", term: "Fall 2025" },
    { id: "C-514", name: "CS 514 — Algorithms", term: "Fall 2025" },
  ];

  const handleViewCourse = (course: Course) => {
    sessionStorage.setItem("current_course_id", course.id);
    sessionStorage.setItem("current_course_name", course.name);
    router.push(`/courses/${course.id}/dashboard`);
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-[var(--bg-left)] overflow-y-auto lg:ml-[260px] p-8">
        <header className="mb-8">
          <h2 className="text-[32px] font-bold mb-2">My Courses</h2>
          <div className="text-[15px] text-[var(--txt-muted)] mb-2">
            Select a course to get started
          </div>
          <div className="inline-block px-4 py-1.5 bg-[var(--bg-gray-alt)] rounded-full text-[13px] font-semibold text-[var(--txt-muted)] mt-2">
            {hasToken ? "✓ Token detected" : "Demo mode (no token)"}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="p-6 bg-white border border-[var(--border-light)] rounded-xl shadow-[var(--shadow-sm)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
            >
              <h3 className="text-xl font-bold mb-2">{course.name}</h3>
              <div className="text-sm text-[var(--txt-muted)] mb-3">
                {course.term}
              </div>
              <div className="inline-block px-3 py-1 bg-[var(--bg-gray-alt)] rounded-full text-xs font-semibold text-[var(--txt-muted)] w-fit my-3">
                Course ID: {course.id}
              </div>
              <div className="mt-auto pt-4">
                <Button
                  onClick={() => handleViewCourse(course)}
                  className="w-full bg-[var(--txt)] hover:bg-[var(--hover-gray)] text-white"
                >
                  View Course
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
