// Course overview page (optional)
// TODO: Display course details and navigation

export default function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <div>
      <h1>Course Overview</h1>
      <p>Course ID: {params.courseId}</p>
      {/* TODO: Add course overview content */}
    </div>
  );
}
