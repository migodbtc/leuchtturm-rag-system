export default function DashboardPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-8">
      <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
          Dashboard
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-gray-900">
          Welcome to Yellowpad
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Your workspace is ready. This dashboard is the single entry point for now.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
          <p className="mt-2 text-sm text-gray-600">
            Start by uploading or generating your first outline.
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <p className="mt-2 text-sm text-gray-600">
            More tools will appear here once your data is connected.
          </p>
        </div>
      </section>
    </div>
  );
}
