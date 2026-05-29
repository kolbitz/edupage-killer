export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-center gap-2 text-sm text-amber-800 flex-shrink-0">
      <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
      <span className="font-semibold">Demo mode</span>
      <span className="text-amber-500">·</span>
      <span className="text-amber-700">
        Viewing sample data — connect a real backend for live content
      </span>
    </div>
  );
}
