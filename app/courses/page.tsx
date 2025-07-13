import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Clock, Users, Star, BookOpen, Play, AlertCircle, Filter } from 'lucide-react'
import { CoursesPageContent } from './courses-page-content'

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

// Add proper types for the query results
interface LessonProgressResult {
  lesson_id: string
  completed: boolean
  user_id: string
  lessons: {
    id: string
    chapter_id: string
    chapters: {
      course_id: string
    }[]
  }[]
}

interface ChapterWithLessons {
  course_id: string
  lessons: Array<{ id: string }> | null
}

// Enhanced database function with better error handling and debugging
async function getAllActiveCourses(userId: string) {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // First, let's get all courses with a simpler query
    const { data: coursesData, error: coursesError } = await supabase
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
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (coursesError) {
      console.error('Error fetching courses:', coursesError)
      return { enrolledCourses: [], availableCourses: [], allCourses: [], error: 'Failed to fetch courses' }
    }

    // Initialize with safe defaults
    let enrolledCourseIds = new Set<string>()
    let courseProgress = new Map<string, number>()
    let courseLessons = new Map<string, number>()

    // Try to get course lesson counts
    try {
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select(`
          course_id,
          lessons (
            id
          )
        `)
        .in('course_id', coursesData.map(c => c.id))

      if (chaptersError) {
        console.warn('Could not fetch lesson counts:', chaptersError)
      } else if (chaptersData) {
        // Type assertion for the chapters data
        const typedChaptersData = chaptersData as ChapterWithLessons[]
        
        typedChaptersData.forEach(chapter => {
          const courseId = chapter.course_id
          const currentCount = courseLessons.get(courseId) || 0
          courseLessons.set(courseId, currentCount + (chapter.lessons?.length || 0))
        })
      }
    } catch (error) {
      console.warn('Could not fetch lesson counts:', error)
    }

    // Try to get user enrollments with enhanced error handling
    try {
      console.log('Fetching enrollments for user:', userId)
      
      // Simple enrollment query first
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', userId)

      if (enrollmentsError) {
        // Better error logging
        console.error('Enrollments error details:', {
          message: enrollmentsError.message || 'No message',
          details: enrollmentsError.details || 'No details',
          hint: enrollmentsError.hint || 'No hint',
          code: enrollmentsError.code || 'No code',
          // Log the full error object
          fullError: JSON.stringify(enrollmentsError, null, 2)
        })
        
        // Check if it's a table/column existence issue
        if (enrollmentsError.code === 'PGRST116' || 
            enrollmentsError.message?.includes('relation') || 
            enrollmentsError.message?.includes('column') ||
            enrollmentsError.message?.includes('does not exist')) {
          console.warn('Enrollments table or columns may not exist. Continuing without enrollment data.')
        } else {
          console.error('Other enrollment error:', enrollmentsError)
        }
      } else if (enrollmentsData) {
        console.log('Successfully fetched enrollments:', enrollmentsData.length)
        enrolledCourseIds = new Set(enrollmentsData.map(e => e.course_id))
      }
    } catch (error) {
      console.error('Unexpected error fetching enrollments:', error)
      // Log the error type and properties
      console.error('Error type:', typeof error)
      console.error('Error properties:', Object.getOwnPropertyNames(error))
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }

    // Try to get lesson progress for enrolled courses
    if (enrolledCourseIds.size > 0) {
      try {
        console.log('Fetching progress for enrolled courses:', Array.from(enrolledCourseIds))
        
        const { data: progressData, error: progressError } = await supabase
          .from('lesson_progress')
          .select(`
            lesson_id,
            completed,
            user_id,
            lessons!inner (
              id,
              chapter_id,
              chapters!inner (
                course_id
              )
            )
          `)
          .eq('user_id', userId)
          .eq('completed', true)

        if (progressError) {
          console.warn('Could not fetch lesson progress:', {
            message: progressError.message || 'No message',
            details: progressError.details || 'No details',
            hint: progressError.hint || 'No hint',
            code: progressError.code || 'No code',
            fullError: JSON.stringify(progressError, null, 2)
          })
        } else if (progressData) {
          console.log('Successfully fetched progress data:', progressData.length)
          
          // Type assertion for the progress data
          const typedProgressData = progressData as LessonProgressResult[]
          
          const progressByCourse = typedProgressData.reduce((acc, progress) => {
            const courseId = progress.lessons?.[0]?.chapters?.[0]?.course_id
            if (courseId) {
              if (!acc[courseId]) acc[courseId] = 0
              acc[courseId]++
            }
            return acc
          }, {} as Record<string, number>)

          Object.entries(progressByCourse).forEach(([courseId, completedCount]) => {
            const totalLessons = courseLessons.get(courseId) || 1
            const progressPercentage = Math.round((completedCount / totalLessons) * 100)
            courseProgress.set(courseId, Math.min(progressPercentage, 100))
          })
        }
      } catch (error) {
        console.error('Unexpected error fetching lesson progress:', error)
      }
    }

    // Transform data with safe defaults
    const transformedCourses: Course[] = coursesData.map(course => {
      const totalLessons = courseLessons.get(course.id) || 0
      const enrolled = enrolledCourseIds.has(course.id)
      const progress = enrolled ? (courseProgress.get(course.id) || 0) : 0

      return {
        id: course.id,
        title: course.title || 'Untitled Course',
        description: course.description || 'No description available',
        long_description: course.long_description,
        duration: course.duration || 'N/A',
        level: course.level || 'Beginner',
        thumbnail: course.thumbnail || '📚',
        instructor: course.instructor || 'Unknown',
        rating: course.rating || 0,
        students: course.students || 0,
        enrolled,
        progress,
        totalLessons,
        created_at: course.created_at,
        updated_at: course.updated_at
      }
    })

    const enrolledCourses = transformedCourses.filter(course => course.enrolled)
    const availableCourses = transformedCourses.filter(course => !course.enrolled)

    console.log('Course data summary:', {
      total: transformedCourses.length,
      enrolled: enrolledCourses.length,
      available: availableCourses.length
    })

    return { 
      enrolledCourses, 
      availableCourses, 
      allCourses: transformedCourses,
      error: null 
    }

  } catch (error) {
    console.error('Unexpected error in getAllActiveCourses:', error)
    return { 
      enrolledCourses: [], 
      availableCourses: [], 
      allCourses: [], 
      error: 'An unexpected error occurred while fetching courses' 
    }
  }
}

// Debug function to check database schema
async function debugDatabaseSchema() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    // Test basic table access with more detailed logging
    const tables = ['courses', 'enrollments', 'chapters', 'lessons', 'lesson_progress']
    
    for (const table of tables) {
      try {
        console.log(`Testing access to ${table} table...`)
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.error(`Error accessing ${table}:`, {
            message: error.message || 'No message',
            details: error.details || 'No details',
            hint: error.hint || 'No hint',
            code: error.code || 'No code',
            fullError: JSON.stringify(error, null, 2)
          })
        } else {
          console.log(`${table} table accessible:`, data ? `Yes (${data.length} records)` : 'No data')
          if (data && data.length > 0) {
            console.log(`${table} columns:`, Object.keys(data[0]))
          }
        }
      } catch (err) {
        console.error(`Exception accessing ${table}:`, err)
      }
    }

    // Test the specific enrollments table structure
    try {
      console.log('Testing enrollments table structure...')
      const { data: enrollmentTest, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('id, user_id, course_id, created_at')
        .limit(1)
      
      if (enrollmentError) {
        console.error('Enrollments structure test failed:', {
          message: enrollmentError.message || 'No message',
          details: enrollmentError.details || 'No details',
          hint: enrollmentError.hint || 'No hint',
          code: enrollmentError.code || 'No code',
          fullError: JSON.stringify(enrollmentError, null, 2)
        })
      } else {
        console.log('Enrollments table structure test passed')
      }
    } catch (err) {
      console.error('Exception testing enrollments structure:', err)
    }

  } catch (error) {
    console.error('Error in debugDatabaseSchema:', error)
  }
}

// Main Courses Page Component
export default async function CoursesPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Always run debug function to help diagnose issues
  console.log('Running database schema debug...')
  await debugDatabaseSchema()

  const { enrolledCourses, availableCourses, allCourses, error } = await getAllActiveCourses(user.id)

  return (
    <CoursesPageContent
      enrolledCourses={enrolledCourses}
      availableCourses={availableCourses}
      allCourses={allCourses}
      error={error}
    />
  )
}