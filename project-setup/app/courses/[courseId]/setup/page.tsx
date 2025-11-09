// Syllabus setup page
// TODO: PDF upload, AI parsing, and category weight editing

export default function SetupPage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <div>
      <h1>Syllabus Setup</h1>
      <p>Course ID: {params.courseId}</p>
      {/* TODO: Add syllabus upload and editing components */}
    </div>
  );
}
