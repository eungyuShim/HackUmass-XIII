"use client";

import "@/components/courses/CourseCard.css";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
  className?: string;
}

export default function Skeleton({
  width = "100%",
  height = "20px",
  circle = false,
  count = 1,
  className = "",
}: SkeletonProps) {
  const skeletonStyle: React.CSSProperties = {
    display: "block",
    width,
    height,
    borderRadius: circle ? "50%" : "4px",
    backgroundColor: "#e5e7eb",
    backgroundImage:
      "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)",
    backgroundSize: "200% 100%",
    animation: "skeleton-loading 1.5s ease-in-out infinite",
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={className} style={skeletonStyle} />
      ))}
      <style jsx>{`
        @keyframes skeleton-loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
}

// Preset skeleton components
export const CourseCardSkeleton = () => {
  return (
    <div className="course-card">
      <div className="course-card__color-bar" style={{ backgroundColor: "#e5e7eb" }} />
      <div className="course-card__content">
        <div className="skeleton skeleton--title" style={{ width: "70%" }} />
        <div className="skeleton skeleton--text" style={{ width: "40%", marginBottom: "12px" }} />
        <div className="skeleton skeleton--text" style={{ width: "50%", marginBottom: "8px" }} />
        <div className="skeleton skeleton--text" style={{ width: "45%" }} />
        <div className="skeleton skeleton--button" style={{ marginTop: "auto" }} />
      </div>
    </div>
  );
};

export function CategorySkeleton() {
  return (
    <div
      style={{
        padding: "16px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        marginBottom: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton width="150px" height="20px" />
        <Skeleton width="60px" height="20px" />
      </div>
      <div style={{ marginTop: "12px" }}>
        <Skeleton width="100%" height="16px" />
        <Skeleton width="100%" height="16px" className="mt-1" />
        <Skeleton width="80%" height="16px" className="mt-1" />
      </div>
    </div>
  );
}

export function AssignmentSkeleton() {
  return (
    <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Skeleton width="200px" height="18px" />
        <Skeleton width="50px" height="18px" />
      </div>
    </div>
  );
}
