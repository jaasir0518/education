import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface Course {
  id: number
  title: string
  description: string
  longDescription?: string
  duration: string
  lessons: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  progress: number
  thumbnail: string
  enrolled: boolean
  instructor: string
  rating: number
  students: number
  lastUpdated: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: number
  title: string
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  title: string
  duration: string
  completed: boolean
}

// Mock data - replace with actual Supabase queries
export const mockCourses: Course[] = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    description: "Learn the basics of JavaScript programming language",
    longDescription: "This course is designed for complete beginners who want to learn JavaScript from the ground up. We'll start with the basics like variables, data types, and functions, then move on to more advanced topics like objects, arrays, and DOM manipulation.",
    duration: "8 hours",
    lessons: 24,
    level: "Beginner",
    progress: 75,
    thumbnail: "🟨",
    enrolled: true,
    instructor: "John Smith",
    rating: 4.8,
    students: 1234,
    lastUpdated: "2024-01-15"
  },
  {
    id: 2,
    title: "React Advanced Patterns",
    description: "Master advanced React patterns and best practices",
    longDescription: "Take your React skills to the next level with this advanced course covering compound components, render props, higher-order components, and modern hooks patterns.",
    duration: "12 hours",
    lessons: 36,
    level: "Advanced",
    progress: 45,
    thumbnail: "⚛️",
    enrolled: true,
    instructor: "Jane Doe",
    rating: 4.9,
    students: 892,
    lastUpdated: "2024-01-20"
  },
  {
    id: 3,
    title: "Next.js 14 Mastery",
    description: "Build production-ready applications with Next.js 14",
    longDescription: "Learn the latest features of Next.js 14 including the App Router, Server Components, and advanced optimization techniques.",
    duration: "16 hours",
    lessons: 48,
    level: "Intermediate",
    progress: 0,
    thumbnail: "🔺",
    enrolled: false,
    instructor: "Alex Johnson",
    rating: 4.7,
    students: 567,
    lastUpdated: "2024-01-25"
  },
  {
    id: 4,
    title: "TypeScript Deep Dive",
    description: "Advanced TypeScript concepts and enterprise patterns",
    longDescription: "Master TypeScript with advanced concepts including generics, conditional types, utility types, and enterprise-level patterns.",
    duration: "10 hours",
    lessons: 30,
    level: "Advanced",
    progress: 0,
    thumbnail: "🔷",
    enrolled: false,
    instructor: "Sarah Wilson",
    rating: 4.9,
    students: 445,
    lastUpdated: "2024-01-18"
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js",
    longDescription: "Learn to build robust backend applications using Node.js, Express, and modern development practices.",
    duration: "14 hours",
    lessons: 42,
    level: "Intermediate",
    progress: 0,
    thumbnail: "🟢",
    enrolled: false,
    instructor: "Michael Brown",
    rating: 4.6,
    students: 789,
    lastUpdated: "2024-01-22"
  },
  {
    id: 6,
    title: "Database Design & SQL",
    description: "Master database design principles and SQL queries",
    longDescription: "Learn database design fundamentals, normalization, and advanced SQL queries for efficient data management.",
    duration: "6 hours",
    lessons: 18,
    level: "Beginner",
    progress: 0,
    thumbnail: "🗄️",
    enrolled: false,
    instructor: "Emily Davis",
    rating: 4.5,
    students: 321,
    lastUpdated: "2024-01-12"
  }
]

export class CoursesService {
  private supabase = createClientComponentClient()

  // Get all courses
  async getCourses(): Promise<Course[]> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('courses')
    //   .select('*')
    
    return mockCourses
  }

  // Get enrolled courses
  async getEnrolledCourses(): Promise<Course[]> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('user_courses')
    //   .select('courses(*)')
    //   .eq('user_id', userId)
    
    return mockCourses.filter(course => course.enrolled)
  }

  // Get available courses (not enrolled)
  async getAvailableCourses(): Promise<Course[]> {
    // TODO: Replace with actual Supabase query
    return mockCourses.filter(course => !course.enrolled)
  }

  // Get course by ID
  async getCourseById(id: number): Promise<Course | null> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('courses')
    //   .select('*')
    //   .eq('id', id)
    //   .single()
    
    return mockCourses.find(course => course.id === id) || null
  }

  // Enroll in course
  async enrollInCourse(courseId: number): Promise<boolean> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('user_courses')
    //   .insert([
    //     { user_id: userId, course_id: courseId }
    //   ])
    
    // For now, just update the mock data
    const course = mockCourses.find(c => c.id === courseId)
    if (course) {
      course.enrolled = true
      return true
    }
    return false
  }

  // Update course progress
  async updateCourseProgress(courseId: number, progress: number): Promise<boolean> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('user_courses')
    //   .update({ progress })
    //   .eq('course_id', courseId)
    //   .eq('user_id', userId)
    
    const course = mockCourses.find(c => c.id === courseId)
    if (course) {
      course.progress = progress
      return true
    }
    return false
  }

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    // TODO: Replace with actual Supabase query with full-text search
    // const { data, error } = await this.supabase
    //   .from('courses')
    //   .select('*')
    //   .textSearch('title', query)
    
    return mockCourses.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Filter courses by level
  async getCoursesByLevel(level: Course['level']): Promise<Course[]> {
    // TODO: Replace with actual Supabase query
    // const { data, error } = await this.supabase
    //   .from('courses')
    //   .select('*')
    //   .eq('level', level)
    
    return mockCourses.filter(course => course.level === level)
  }
}

// Export a singleton instance
export const coursesService = new CoursesService()

// Utility functions
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`
  }
  return `${remainingMinutes}m`
}

export const calculateProgress = (completedLessons: number, totalLessons: number): number => {
  if (totalLessons === 0) return 0
  return Math.round((completedLessons / totalLessons) * 100)
}

export const getLevelColor = (level: Course['level']): string => {
  switch (level) {
    case 'Beginner':
      return 'bg-green-100 text-green-800'
    case 'Intermediate':
      return 'bg-blue-100 text-blue-800'
    case 'Advanced':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getProgressColor = (progress: number): string => {
  if (progress === 0) return 'bg-gray-200'
  if (progress < 50) return 'bg-blue-500'
  if (progress < 80) return 'bg-yellow-500'
  return 'bg-green-500'
}