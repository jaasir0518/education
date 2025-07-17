// app/home/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Loading Animation */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>

        {/* Landing Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-10 bg-white/20 rounded-lg mb-4 animate-pulse"></div>
            <div className="h-6 bg-white/20 rounded-lg mb-6 animate-pulse max-w-2xl mx-auto"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-12 bg-white/20 rounded-lg w-40 animate-pulse"></div>
              <div className="h-12 bg-white/20 rounded-lg w-40 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Features Section Skeleton */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-300 rounded-lg mb-4 animate-pulse max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-300 rounded-lg animate-pulse max-w-xl mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-300 rounded-lg mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-300 rounded-lg mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Community Section Skeleton */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <div className="h-8 bg-white/20 rounded-lg mb-4 animate-pulse max-w-md mx-auto"></div>
                <div className="h-6 bg-white/20 rounded-lg animate-pulse max-w-xl mx-auto"></div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Community Stats Skeleton */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="h-7 bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="text-center">
                        <div className="h-8 bg-gray-700 rounded-lg mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Story Skeleton */}
                <div className="bg-gray-800 rounded-xl p-6">
                  <div className="h-7 bg-gray-700 rounded-lg mb-4 animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-700 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-700 rounded animate-pulse w-2/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-4 h-4 bg-gray-700 rounded animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-5 bg-gray-300 rounded mb-2 animate-pulse"></div>
                  <div className="h-4 bg-gray-300 rounded animate-pulse w-2/3"></div>
                </div>
                <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
          <div className="h-6 bg-gray-300 rounded mb-4 animate-pulse w-48"></div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
                <div>
                  <div className="h-4 bg-gray-300 rounded mb-1 animate-pulse w-32"></div>
                  <div className="h-3 bg-gray-300 rounded animate-pulse w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-16"></div>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="bg-gray-900 rounded-2xl p-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Company Info */}
              <div className="col-span-1 md:col-span-2">
                <div className="h-8 bg-gray-700 rounded mb-4 animate-pulse w-48"></div>
                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                  ))}
                </div>
              </div>

              {/* Quick Links & Support */}
              {[...Array(2)].map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-gray-700 rounded mb-4 animate-pulse w-24"></div>
                  <div className="space-y-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-700 rounded animate-pulse w-20"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <div className="h-4 bg-gray-700 rounded animate-pulse max-w-md mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}