// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import Link from 'next/link'
// import { EnrollButton } from '@/components/ui/enroll-button'
// import { VideoPlayer } from '@/components/ui/video-player'
// import { CertificateToggle } from '@/components/ui/certificate-toggle'
// import { CertificateGenerator } from '@/components/ui/certificate-generator'
// import { formatDateShort, formatNumber } from '@/lib/date-utils'

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
//   video_url: string | null
//   video_thumbnail_url: string | null
//   video_duration: number | null
//   chapters: Chapter[]
//   enrolled: boolean
//   video_completed: boolean
// }

// interface Certificate {
//   id: string
//   certificate_number: string
//   first_name: string
//   last_name: string
//   issued_date: string
//   completion_date: string
// }

// interface UserProfile {
//   id: string
//   first_name: string | null
//   last_name: string | null
//   email: string
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
//       video_url,
//       video_thumbnail_url,
//       video_duration,
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

//   // Check if course video is completed
//   const { data: videoProgress, error: videoError } = await supabase
//     .from('video_progress')
//     .select('completed')
//     .eq('user_id', userId)
//     .eq('course_id', courseId)
//     .single()

//   const videoCompleted = !videoError && videoProgress?.completed

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
//     video_url: courseData.video_url,
//     video_thumbnail_url: courseData.video_thumbnail_url,
//     video_duration: courseData.video_duration,
//     enrolled: !!enrolled,
//     video_completed: videoCompleted,
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

// async function getUserCertificate(userId: string, courseId: string): Promise<Certificate | null> {
//   const supabase = createServerComponentClient({ cookies })
  
//   const { data: certificate, error } = await supabase
//     .from('certificates')
//     .select('*')
//     .eq('user_id', userId)
//     .eq('course_id', courseId)
//     .single()

//   if (error || !certificate) {
//     return null
//   }

//   return certificate
// }

// async function getUserProfile(userId: string): Promise<UserProfile | null> {
//   const supabase = createServerComponentClient({ cookies })
  
//   const { data: profile, error } = await supabase
//     .from('profiles')
//     .select('id, first_name, last_name, email')
//     .eq('id', userId)
//     .single()

//   if (error || !profile) {
//     return null
//   }

//   return profile
// }

// function formatDuration(seconds: number): string {
//   const hours = Math.floor(seconds / 3600)
//   const minutes = Math.floor((seconds % 3600) / 60)
//   const remainingSeconds = seconds % 60

//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
//   } else {
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
//   }
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
//   const userProfile = await getUserProfile(user.id)

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
//   const isCourseCompleted = progressPercentage === 100

//   // Get existing certificate if any
//   const existingCertificate = await getUserCertificate(user.id, course.id)

//   // Check if video is completed and user is eligible for certificate
//   const isEligibleForCertificate = course.enrolled && course.video_completed && !existingCertificate

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
//             {/* Course Video Section */}
//             {course.video_url && (
//               <Card className="mb-8">
//                 <CardContent className="p-0 relative">
//                   <VideoPlayer
//                     videoUrl={course.video_url}
//                     thumbnailUrl={course.video_thumbnail_url}
//                     title={course.title}
//                     enrolled={course.enrolled}
//                   />
                  
//                   {/* Certificate Toggle - Show when video is completed */}
//                   {course.enrolled && course.video_completed && (
//                     <CertificateToggle
//                       courseId={course.id}
//                       courseTitle={course.title}
//                       instructor={course.instructor}
//                       completionDate={new Date()}
//                       userEmail={user.email}
//                       userId={user.id}
//                       existingCertificate={existingCertificate}
//                     />
//                   )}
//                 </CardContent>
//               </Card>
//             )}

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
//                 {course.video_duration && (
//                   <Badge variant="outline">🎥 {formatDuration(course.video_duration)}</Badge>
//                 )}
//                 <Badge variant="outline">⭐ {course.rating}</Badge>
//                 {course.video_completed && (
//                   <Badge variant="default" className="bg-green-500">
//                     ✅ Video Completed
//                   </Badge>
//                 )}
//                 {isCourseCompleted && (
//                   <Badge variant="default" className="bg-green-500">
//                     ✅ Course Completed
//                   </Badge>
//                 )}
//                 {existingCertificate && (
//                   <Badge variant="default" className="bg-blue-500">
//                     🏆 Certificate Earned
//                   </Badge>
//                 )}
//               </div>

//               {course.enrolled && (
//                 <div className="mb-6">
//                   <div className="flex justify-between items-center mb-2">
//                     <span className="text-sm font-medium">Your Progress</span>
//                     <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
//                   </div>
//                   <div className="w-full h-3 bg-gray-200 rounded-full">
//                     <div 
//                       className={`h-full rounded-full transition-all duration-300 ${
//                         isCourseCompleted ? 'bg-green-500' : 'bg-blue-500'
//                       }`}
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
//                     <p className="font-medium">{formatNumber(course.students)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Last Updated</p>
//                     <p className="font-medium">{formatDateShort(course.created_at)}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Language</p>
//                     <p className="font-medium">English</p>
//                   </div>
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
//                     {existingCertificate ? (
//                       <div className="space-y-2">
//                         <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg" disabled>
//                           🏆 Certificate Earned
//                         </Button>
//                         <Button 
//                           variant="outline" 
//                           className="w-full"
//                           onClick={() => {
//                             // Download existing certificate
//                             const link = document.createElement('a')
//                             link.href = `/api/certificates/${existingCertificate.id}/download`
//                             link.download = `${course.title}-Certificate.pdf`
//                             link.click()
//                           }}
//                         >
//                           📥 Download Certificate
//                         </Button>
//                       </div>
//                     ) : isEligibleForCertificate ? (
//                       <CertificateGenerator
//                         courseId={course.id}
//                         courseTitle={course.title}
//                         instructor={course.instructor}
//                         userId={user.id}
//                         userEmail={user.email || ''}
//                         userProfile={userProfile}
//                       />
//                     ) : isCourseCompleted ? (
//                       <Button className="w-full bg-green-500 hover:bg-green-600" size="lg" disabled>
//                         ✅ Course Completed
//                       </Button>
//                     ) : (
//                       <Button className="w-full" size="lg" asChild>
//                         <Link href={`/courses/${course.id}/learn`}>
//                           Continue Learning
//                         </Link>
//                       </Button>
//                     )}
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
//                     {course.video_duration && (
//                       <div className="flex items-center gap-2">
//                         <span>🎬</span>
//                         <span>Course preview ({formatDuration(course.video_duration)})</span>
//                       </div>
//                     )}
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
import { CertificateGenerator } from '@/components/ui/certificate-generator'
import { formatDateShort, formatNumber } from '@/lib/date-utils'

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
  video_completed: boolean
}

interface Certificate {
  id: string
  certificate_number: string
  first_name: string
  last_name: string
  issued_date: string
  completion_date: string
}

interface UserProfile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
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

  // Check if course video is completed
  const { data: videoProgress, error: videoError } = await supabase
    .from('video_progress')
    .select('completed')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  const videoCompleted = !videoError && videoProgress?.completed

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
    video_completed: videoCompleted,
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

async function getUserCertificate(userId: string, courseId: string): Promise<Certificate | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: certificate, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error || !certificate) {
    return null
  }

  return certificate
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return null
  }

  return profile
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
  const userProfile = await getUserProfile(user.id)

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
  const isCourseCompleted = progressPercentage === 100

  // Get existing certificate if any
  const existingCertificate = await getUserCertificate(user.id, course.id)

  // Check if video is completed and user is eligible for certificate
  const isEligibleForCertificate = course.enrolled && course.video_completed && !existingCertificate

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
                <CardContent className="p-0 relative">
                  <VideoPlayer
                    videoUrl={course.video_url}
                    thumbnailUrl={course.video_thumbnail_url}
                    title={course.title}
                    enrolled={course.enrolled}
                    courseId={course.id}
                    userId={user.id}
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
                {course.video_completed && (
                  <Badge variant="default" className="bg-green-500">
                    ✅ Video Completed
                  </Badge>
                )}
                {isCourseCompleted && (
                  <Badge variant="default" className="bg-green-500">
                    ✅ Course Completed
                  </Badge>
                )}
                {existingCertificate && (
                  <Badge variant="default" className="bg-blue-500">
                    🏆 Certificate Earned
                  </Badge>
                )}
              </div>

              {course.enrolled && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-gray-600">{progressPercentage}% Complete</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isCourseCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
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
                    <p className="font-medium">{formatNumber(course.students)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDateShort(course.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Language</p>
                    <p className="font-medium">English</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                {course.enrolled ? (
                  <div className="space-y-4">
                    {/* Certificate Generation Section */}
                    {isEligibleForCertificate && (
                      <CertificateGenerator
                        courseId={course.id}
                        courseTitle={course.title}
                        instructor={course.instructor}
                        userId={user.id}
                        userEmail={user.email || ''}
                        userProfile={userProfile}
                      />
                    )}

                    {/* Existing Certificate Display */}
                    {existingCertificate && (
                      <div className="space-y-2">
                        <Button className="w-full bg-blue-500 hover:bg-blue-600" size="lg" disabled>
                          🏆 Certificate Earned
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            // Trigger certificate download
                            const link = document.createElement('a')
                            link.href = `/api/certificates/generate`
                            link.click()
                          }}
                        >
                          📥 Download Certificate
                        </Button>
                      </div>
                    )}

                    {/* Course Progress Actions */}
                    {!isEligibleForCertificate && !existingCertificate && (
                      <>
                        {course.video_completed ? (
                          <Button className="w-full bg-green-500 hover:bg-green-600" size="lg" disabled>
                            ✅ Video Completed
                          </Button>
                        ) : (
                          <Button className="w-full" size="lg" asChild>
                            <Link href={`/courses/${course.id}/learn`}>
                              Continue Learning
                            </Link>
                          </Button>
                        )}
                      </>
                    )}

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