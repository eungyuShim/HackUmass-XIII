export default function SyllabusPage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Upload Syllabus</h1>
        <p className="text-muted-foreground mb-4">
          Course ID: {params.courseId}
        </p>
        {/* Syllabus upload and parsing UI will be added here */}
      </div>
    </main>
  );
}
