'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Clock, Users, Star, BookOpen, Play, AlertCircle, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatNumber } from '@/lib/date-utils'

// Types
interface Course {
  id: string
  title: string
  description: string
  long_description?: string
  duration: string
  level: string
  thumbnail: string
  instructor: string
  rating: number
  students: number
  enrolled: boolean
  progress: number
  totalLessons: number
  created_at: string
  updated_at: string
}

interface CoursePageClientProps {
  enrolledCourses: Course[]
  availableCourses: Course[]
  allCourses: Course[]
  error: string | null
}

// Filter Tabs Component
function FilterTabs({ 
  activeTab, 
  setActiveTab, 
  enrolledCount, 
  availableCount,
  totalCount 
}: { 
  activeTab: string
  setActiveTab: (tab: string) => void
  enrolledCount: number
  availableCount: number
  totalCount: number
}) {
  return (
    <div className="flex items-center gap-2 mb-8">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
          activeTab === 'all'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Filter className="w-4 h-4" />
        All Courses
        <Badge variant={activeTab === 'all' ? 'secondary' : 'outline'} className="text-xs">
          {totalCount}
        </Badge>
      </button>
      
      <button
        onClick={() => setActiveTab('enrolled')}
        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
          activeTab === 'enrolled'
            ? 'bg-green-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <BookOpen className="w-4 h-4" />
        My Courses
        <Badge variant={activeTab === 'enrolled' ? 'secondary' : 'outline'} className="text-xs">
          {enrolledCount}
        </Badge>
      </button>
      
      <button
        onClick={() => setActiveTab('available')}
        className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
          activeTab === 'available'
            ? 'bg-orange-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Search className="w-4 h-4" />
        Available
        <Badge variant={activeTab === 'available' ? 'secondary' : 'outline'} className="text-xs">
          {availableCount}
        </Badge>
      </button>
    </div>
  )
}

// Course Card Component
function CourseCard({ course, isEnrolled = false }: { course: Course; isEnrolled?: boolean }) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">{course.thumbnail}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
              <Badge variant={isEnrolled ? "default" : "outline"} className="text-xs">
                {isEnrolled ? "Enrolled" : "Available"}
              </Badge>
            </div>
            <CardDescription className="text-sm mt-1">
              {course.level} • {course.totalLessons} lessons • {course.instructor}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
        
        {/* Course Stats */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{formatNumber(course.students)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{course.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Progress Bar for Enrolled Courses */}
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{course.progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Link href={`/courses/${course.id}`} className="flex-1">
            <Button 
              size="sm" 
              className="w-full" 
              variant={isEnrolled ? "default" : "outline"}
            >
              {isEnrolled ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  {course.progress > 0 ? 'Continue' : 'Start'}
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Details
                </>
              )}
            </Button>
          </Link>
          
          {isEnrolled && (
            <Link href={`/courses/${course.id}/learn`}>
              <Button size="sm" variant="ghost">
                <Play className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Error Banner Component
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-500" />
        <div>
          <h3 className="font-medium text-red-800">Unable to Load Some Data</h3>
          <p className="text-sm text-red-600">{message}</p>
        </div>
      </div>
    </div>
  )
}

// Main Client Component
export function CoursePageClient({ enrolledCourses, availableCourses, allCourses, error }: CoursePageClientProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter courses based on active tab and search query
  const getFilteredCourses = () => {
    let coursesToShow: Course[] = []
    
    switch (activeTab) {
      case 'enrolled':
        coursesToShow = enrolledCourses
        break
      case 'available':
        coursesToShow = availableCourses
        break
      case 'all':
      default:
        coursesToShow = allCourses
        break
    }

    // Apply search filter
    if (searchQuery.trim()) {
      coursesToShow = coursesToShow.filter(course => 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return coursesToShow
  }

  const filteredCourses = getFilteredCourses()

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'enrolled':
        return 'My Courses'
      case 'available':
        return 'Available Courses'
      case 'all':
      default:
        return 'All Courses'
    }
  }

  const getSectionDescription = () => {
    switch (activeTab) {
      case 'enrolled':
        return enrolledCourses.length > 0 
          ? `Continue your learning journey • ${enrolledCourses.length} active courses`
          : 'You haven\'t enrolled in any courses yet. Browse available courses to get started!'
      case 'available':
        return `Discover new courses to expand your knowledge • ${availableCourses.length} courses available`
      case 'all':
      default:
        return `Explore all courses in our catalog • ${allCourses.length} total courses`
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Learning Dashboard</h1>
              <p className="text-gray-600">
                {getSectionDescription()}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Course Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{allCourses.length}</div>
                  <div>Total</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{enrolledCourses.length}</div>
                  <div>Enrolled</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-orange-600">{availableCourses.length}</div>
                  <div>Available</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <FilterTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            enrolledCount={enrolledCourses.length}
            availableCount={availableCourses.length}
            totalCount={allCourses.length}
          />
        </div>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} />}

        {/* Course Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{getSectionTitle()}</h2>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}
              </Badge>
              <select className="text-sm border rounded px-3 py-1">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course} 
                isEnrolled={course.enrolled}
              />
            ))}
          </div>
          
          {filteredCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {searchQuery ? '🔍' : activeTab === 'enrolled' ? '📚' : '🎓'}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery 
                  ? 'No courses found' 
                  : activeTab === 'enrolled' 
                    ? 'No enrolled courses' 
                    : 'No courses available'
                }
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms or browse all courses.'
                  : activeTab === 'enrolled' 
                    ? 'Start learning by enrolling in a course!'
                    : 'Check back later for new courses or contact support if you believe this is an error.'
                }
              </p>
              {activeTab === 'enrolled' && (
                <Button 
                  onClick={() => setActiveTab('available')}
                  className="mt-4"
                >
                  Browse Available Courses
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats Footer */}
        {allCourses.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{allCourses.length}</div>
                <div className="text-sm text-gray-600">Total Courses</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{enrolledCourses.length}</div>
                <div className="text-sm text-gray-600">Enrolled</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {enrolledCourses.reduce((acc, course) => acc + course.totalLessons, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Lessons</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {enrolledCourses.length > 0 
                    ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length)
                    : 0}%
                </div>
                <div className="text-sm text-gray-600">Avg Progress</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
