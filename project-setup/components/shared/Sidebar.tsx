"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  courseId?: string;
}

export function Sidebar({ courseId }: SidebarProps) {
  const pathname = usePathname();

  const navItems = courseId
    ? [
        { href: "/courses", label: "← Back to Courses" },
        { href: `/courses/${courseId}/dashboard`, label: "Dashboard" },
      ]
    : [
        { href: "/courses", label: "My Courses" },
        { href: "#", label: "Dashboard" },
        { href: "#", label: "Settings" },
      ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-[var(--accent)] p-8 shadow-[4px_0_20px_rgba(0,0,0,0.15)] overflow-y-auto z-[100] hidden lg:block">
      <div className="mb-8">
        <h1 className="text-white text-[28px] font-bold leading-tight mb-2">
          Grade
          <br />
          Planner
        </h1>
        <p className="text-white/90 text-[13px]">Academic planning made easy</p>
      </div>

      <nav>
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block px-4 py-3 rounded-lg text-[15px] font-medium text-white transition-colors",
                    isActive ? "bg-white/25 font-semibold" : "hover:bg-white/15"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
