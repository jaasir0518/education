// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import Link from 'next/link'
// import { EnrollButton } from '@/components/ui/enroll-button'

// // Types
// interface Lesson {
//   id: string
//   title: string
//   duration: string
//   order_index: number
//   completed: boolean
// }

// interface Chapter {
//   id: string
//   title: string
//   order_index: number
//   lessons: Lesson[]
// }

// interface CourseDetail {
//   id: string
//   title: string
//   description: string
//   long_description: string
//   duration: string
//   level: string
//   thumbnail: string
//   instructor: string
//   rating: number
//   students: number
//   created_at: string
//   chapters: Chapter[]
//   enrolled: boolean
// }

// // Database functions
// async function getCourseById(courseId: string, userId: string): Promise<CourseDetail | null> {
//   const supabase = createServerComponentClient({ cookies })
  
//   // Get course with chapters and lessons
//   const { data: courseData, error: courseError } = await supabase
//     .from('courses')
//     .select(`
//       id,
//       title,
//       description,
//       long_description,
//       duration,
//       level,
//       thumbnail,
//       instructor,
//       rating,
//       students,
//       created_at,
//       chapters (
//         id,
//         title,
//         order_index,
//         lessons (
//           id,
//           title,
//           duration,
//           order_index
//         )
//       )
//     `)
//     .eq('id', courseId)
//     .single()

//   if (courseError || !courseData) {
//     console.error('Error fetching course:', courseError)
//     return null
//   }

//   // Check if user is enrolled
//   const { data: enrollmentData, error: enrollmentError } = await supabase
//     .from('enrollments')
//     .select('id')
//     .eq('user_id', userId)
//     .eq('course_id', courseId)
//     .single()

//   const enrolled = !enrollmentError && enrollmentData

//   // Get lesson progress if enrolled
//   let lessonProgress: Record<string, boolean> = {}
//   if (enrolled) {
//     const { data: progressData, error: progressError } = await supabase
//       .from('lesson_progress')
//       .select(`
//         lesson_id,
//         completed,
//         lessons!inner (
//           id,
//           chapters!inner (
//             course_id
//           )
//         )
//       `)
//       .eq('user_id', userId)
//       .eq('lessons.chapters.course_id', courseId)

//     if (!progressError && progressData) {
//       lessonProgress = progressData.reduce((acc, progress) => {
//         acc[progress.lesson_id] = progress.completed
//         return acc
//       }, {} as Record<string, boolean>)
//     }
//   }

//   // Transform data
//   const transformedCourse: CourseDetail = {
//     id: courseData.id,
//     title: courseData.title,
//     description: courseData.description,
//     long_description: courseData.long_description || courseData.description,
//     duration: courseData.duration,
//     level: courseData.level,
//     thumbnail: courseData.thumbnail,
//     instructor: courseData.instructor,
//     rating: courseData.rating,
//     students: courseData.students,
//     created_at: courseData.created_at,
//     enrolled: !!enrolled,
//     chapters: courseData.chapters
//       .sort((a, b) => a.order_index - b.order_index)
//       .map(chapter => ({
//         id: chapter.id,
//         title: chapter.title,
//         order_index: chapter.order_index,
//         lessons: chapter.lessons
//           .sort((a, b) => a.order_index - b.order_index)
//           .map(lesson => ({
//             id: lesson.id,
//             title: lesson.title,
//             duration: lesson.duration,
//             order_index: lesson.order_index,
//             completed: lessonProgress[lesson.id] || false
//           }))
//       }))
//   }

//   return transformedCourse
// }

// interface CourseDetailPageProps {
//   params: {
//     courseId: string
//   }
// }

// export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
//   const supabase = createServerComponentClient({ cookies })
  
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/auth/login')
//   }

//   const course = await getCourseById(params.courseId, user.id)

//   if (!course) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
//           <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
//           <Link href="/courses">
//             <Button>Back to Courses</Button>
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   const completedLessons = course.chapters.reduce((total, chapter) => {
//     return total + chapter.lessons.filter(lesson => lesson.completed).length
//   }, 0)

//   const totalLessons = course.chapters.reduce((total, chapter) => {
//     return total + chapter.lessons.length
//   }, 0)

//   const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-6xl mx-auto">
//         {/* Breadcrumb */}
//         <nav className="mb-6">
//           <div className="flex items-center space-x-2 text-sm text-gray-600">
//             <Link href="/courses" className="hover:text-gray-900">Courses</Link>
//             <span>›</span>
//             <span>{course.title}</span>
//           </div>
//         </nav>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             {/* Course Header */}
//             <div className="mb-8">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="text-4xl">{course.thumbnail}</div>
//                 <div>
//                   <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
//                   <p className="text-gray-600">{course.description}</p>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-2 mb-4">
//                 <Badge variant="secondary">{course.level}</Badge>
//                 <Badge variant="outline">{totalLessons} lessons</Badge>
//                 <Badge variant="outline">{course.duration}</Badge>
//                 <Badge variant="outline">⭐ {course.rating}</Badge>
//               </div>

//               {course.enrolled && (
//                 <div className="mb-6">
//                   <div className="flex justify-between items-center mb-2">
//                     <span className="text-sm font-medium">Your Progress</span>
//                     <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
//                   </div>
//                   <div className="w-full h-3 bg-gray-200 rounded-full">
//                     <div 
//                       className="h-full bg-blue-500 rounded-full transition-all duration-300"
//                       style={{ width: `${progressPercentage}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Course Description */}
//             <Card className="mb-8">
//               <CardHeader>
//                 <CardTitle>About This Course</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p className="text-gray-700 leading-relaxed mb-4">
//                   {course.long_description}
//                 </p>
                
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                   <div>
//                     <p className="text-gray-500">Instructor</p>
//                     <p className="font-medium">{course.instructor}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Students</p>
//                     <p className="font-medium">{course.students.toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Last Updated</p>
//                     <p className="font-medium">{new Date(course.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Language</p>
//                     <p className="font-medium">English</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Course Content */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Course Content</CardTitle>
//                 <CardDescription>
//                   {course.chapters.length} chapters • {totalLessons} lessons • {course.duration} total
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {course.chapters.map((chapter) => (
//                     <div key={chapter.id} className="border rounded-lg p-4">
//                       <h3 className="font-semibold mb-3">{chapter.title}</h3>
//                       <div className="space-y-2">
//                         {chapter.lessons.map((lesson) => (
//                           <div key={lesson.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
//                             <div className="flex items-center gap-3">
//                               <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
//                                 lesson.completed ? 'bg-green-500' : 'bg-gray-300'
//                               }`}>
//                                 {lesson.completed && (
//                                   <span className="text-white text-xs">✓</span>
//                                 )}
//                               </div>
//                               <span className={`text-sm ${lesson.completed ? 'text-gray-900' : 'text-gray-600'}`}>
//                                 {lesson.title}
//                               </span>
//                             </div>
//                             <span className="text-xs text-gray-500">{lesson.duration}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Sidebar */}
//           <div className="lg:col-span-1">
//             <Card className="sticky top-6">
//               <CardContent className="p-6">
//                 {course.enrolled ? (
//                   <div className="space-y-4">
//                     <Button className="w-full" size="lg" asChild>
//                       <Link href={`/courses/${course.id}/learn`}>
//                         Continue Learning
//                       </Link>
//                     </Button>
//                     <Button variant="outline" className="w-full">
//                       Download Materials
//                     </Button>
//                     <Button variant="outline" className="w-full">
//                       Ask Question
//                     </Button>
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     <EnrollButton courseId={course.id} />
//                     <Button variant="outline" className="w-full">
//                       Preview Course
//                     </Button>
//                   </div>
//                 )}

//                 <div className="mt-6 pt-6 border-t">
//                   <h4 className="font-semibold mb-3">This course includes:</h4>
//                   <div className="space-y-2 text-sm">
//                     <div className="flex items-center gap-2">
//                       <span>📹</span>
//                       <span>{course.duration} of video content</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span>📝</span>
//                       <span>{totalLessons} lessons</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span>📱</span>
//                       <span>Access on mobile and desktop</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span>🏆</span>
//                       <span>Certificate of completion</span>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span>♾️</span>
//                       <span>Lifetime access</span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { EnrollButton } from '@/components/ui/enroll-button'
import { VideoPlayer } from '@/components/ui/video-player'

// Types
interface Lesson {
  id: string
  title: string
  duration: string
  order_index: number
  completed: boolean
}

interface Chapter {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface CourseDetail {
  id: string
  title: string
  description: string
  long_description: string
  duration: string
  level: string
  thumbnail: string
  instructor: string
  rating: number
  students: number
  created_at: string
  video_url: string | null
  video_thumbnail_url: string | null
  video_duration: number | null
  chapters: Chapter[]
  enrolled: boolean
}

// Database functions
async function getCourseById(courseId: string, userId: string): Promise<CourseDetail | null> {
  const supabase = createServerComponentClient({ cookies })
  
  // Get course with chapters and lessons
  const { data: courseData, error: courseError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      description,
      long_description,
      duration,
      level,
      thumbnail,
      instructor,
      rating,
      students,
      created_at,
      video_url,
      video_thumbnail_url,
      video_duration,
      chapters (
        id,
        title,
        order_index,
        lessons (
          id,
          title,
          duration,
          order_index
        )
      )
    `)
    .eq('id', courseId)
    .single()

  if (courseError || !courseData) {
    console.error('Error fetching course:', courseError)
    return null
  }

  // Check if user is enrolled
  const { data: enrollmentData, error: enrollmentError } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  const enrolled = !enrollmentError && enrollmentData

  // Get lesson progress if enrolled
  let lessonProgress: Record<string, boolean> = {}
  if (enrolled) {
    const { data: progressData, error: progressError } = await supabase
      .from('lesson_progress')
      .select(`
        lesson_id,
        completed,
        lessons!inner (
          id,
          chapters!inner (
            course_id
          )
        )
      `)
      .eq('user_id', userId)
      .eq('lessons.chapters.course_id', courseId)

    if (!progressError && progressData) {
      lessonProgress = progressData.reduce((acc, progress) => {
        acc[progress.lesson_id] = progress.completed
        return acc
      }, {} as Record<string, boolean>)
    }
  }

  // Transform data
  const transformedCourse: CourseDetail = {
    id: courseData.id,
    title: courseData.title,
    description: courseData.description,
    long_description: courseData.long_description || courseData.description,
    duration: courseData.duration,
    level: courseData.level,
    thumbnail: courseData.thumbnail,
    instructor: courseData.instructor,
    rating: courseData.rating,
    students: courseData.students,
    created_at: courseData.created_at,
    video_url: courseData.video_url,
    video_thumbnail_url: courseData.video_thumbnail_url,
    video_duration: courseData.video_duration,
    enrolled: !!enrolled,
    chapters: courseData.chapters
      .sort((a, b) => a.order_index - b.order_index)
      .map(chapter => ({
        id: chapter.id,
        title: chapter.title,
        order_index: chapter.order_index,
        lessons: chapter.lessons
          .sort((a, b) => a.order_index - b.order_index)
          .map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            duration: lesson.duration,
            order_index: lesson.order_index,
            completed: lessonProgress[lesson.id] || false
          }))
      }))
  }

  return transformedCourse
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }
}

interface CourseDetailPageProps {
  params: {
    courseId: string
  }
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const course = await getCourseById(params.courseId, user.id)

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedLessons = course.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.filter(lesson => lesson.completed).length
  }, 0)

  const totalLessons = course.chapters.reduce((total, chapter) => {
    return total + chapter.lessons.length
  }, 0)

  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/courses" className="hover:text-gray-900">Courses</Link>
            <span>›</span>
            <span>{course.title}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Video Section */}
            {course.video_url && (
              <Card className="mb-8">
                <CardContent className="p-0">
                  <VideoPlayer
                    videoUrl={course.video_url}
                    thumbnailUrl={course.video_thumbnail_url}
                    title={course.title}
                    enrolled={course.enrolled}
                  />
                </CardContent>
              </Card>
            )}

            {/* Course Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-4xl">{course.thumbnail}</div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-gray-600">{course.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline">{totalLessons} lessons</Badge>
                <Badge variant="outline">{course.duration}</Badge>
                {course.video_duration && (
                  <Badge variant="outline">🎥 {formatDuration(course.video_duration)}</Badge>
                )}
                <Badge variant="outline">⭐ {course.rating}</Badge>
              </div>

              {course.enrolled && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Description */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>About This Course</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {course.long_description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Instructor</p>
                    <p className="font-medium">{course.instructor}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Students</p>
                    <p className="font-medium">{course.students.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{new Date(course.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
                <CardDescription>
                  {course.chapters.length} chapters • {totalLessons} lessons • {course.duration} total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-3">{chapter.title}</h3>
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                                lesson.completed ? 'bg-green-500' : 'bg-gray-300'
                              }`}>
                                {lesson.completed && (
                                  <span className="text-white text-xs">✓</span>
                                )}
                              </div>
                              <span className={`text-sm ${lesson.completed ? 'text-gray-900' : 'text-gray-600'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {course.enrolled ? (
                  <div className="space-y-4">
                    <Button className="w-full" size="lg" asChild>
                      <Link href={`/courses/${course.id}/learn`}>
                        Continue Learning
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download Materials
                    </Button>
                    <Button variant="outline" className="w-full">
                      Ask Question
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <EnrollButton courseId={course.id} />
                    <Button variant="outline" className="w-full">
                      Preview Course
                    </Button>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-3">This course includes:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📹</span>
                      <span>{course.duration} of video content</span>
                    </div>
                    {course.video_duration && (
                      <div className="flex items-center gap-2">
                        <span>🎬</span>
                        <span>Course preview ({formatDuration(course.video_duration)})</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>📝</span>
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span>Access on mobile and desktop</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>♾️</span>
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}