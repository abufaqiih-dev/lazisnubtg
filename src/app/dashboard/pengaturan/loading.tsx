export default function Loading() {
  return (
    <div className="p-6 w-full max-w-4xl mx-auto animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
          </div>
        ))}
        <div className="pt-4 flex justify-end">
           <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
