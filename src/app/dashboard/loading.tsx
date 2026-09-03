export default function Loading() {
  return (
    <div className="p-6 w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
      <div className="mt-8 h-64 bg-gray-200 rounded-lg w-full"></div>
    </div>
  );
}
