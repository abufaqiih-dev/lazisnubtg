export default function Loading() {
  return (
    <div className="p-6 w-full animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="w-full bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50 p-4">
          <div className="flex justify-between gap-4">
             <div className="h-4 bg-gray-200 rounded w-1/6"></div>
             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/6"></div>
             <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-4 border-b border-gray-50 flex justify-between gap-4 items-center">
            <div className="h-4 bg-gray-100 rounded w-1/6"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
            <div className="h-4 bg-gray-100 rounded w-1/6"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
