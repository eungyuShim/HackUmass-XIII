export default function DashboardPage({
  params,
}: {
  params: { courseId: string };
}) {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Grade Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Course ID: {params.courseId}
        </p>
        {/* Dashboard with calculations will be added here */}
      </div>
    </main>
  );
}
