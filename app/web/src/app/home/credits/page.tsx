export default function CreditsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Credits</h1>
        <p className="mt-2 text-sm text-gray-600">
          Thank you to everyone who contributed to Yellowpad.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Built with</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Next.js 16</li>
            <li>• React 19</li>
            <li>• Tailwind CSS v4</li>
            <li>• FastAPI</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Team</h2>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>• Design & Development</li>
            <li>• Product & Strategy</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
