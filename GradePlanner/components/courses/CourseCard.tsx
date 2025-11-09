import React from "react";
import "./CourseCard.css";

interface CourseCardProps {
  id: string;
  name: string;
  courseCode: string;
  term: string; // Keep for backward compatibility but won't display
  color: string;
  onViewCourse: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  id,
  name,
  courseCode,
  color,
  onViewCourse,
}) => {
  return (
    <div className="course-card">
      <div
        className="course-card__color-bar"
        style={{ backgroundColor: color }}
      />
      <div className="course-card__content">
        <h3 className="course-card__title">{name}</h3>
        <div className="course-card__code">{courseCode}</div>
        <div className="course-card__info">
          <span className="course-card__pill course-card__pill--muted">
            Course ID: {id}
          </span>
        </div>
        <div className="course-card__actions">
          <button className="btn btn--primary" onClick={onViewCourse}>
            View Course
          </button>
        </div>
      </div>
    </div>
  );
};
