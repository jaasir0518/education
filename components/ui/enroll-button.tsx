'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface EnrollButtonProps {
  courseId: string
}

export function EnrollButton({ courseId }: EnrollButtonProps) {
  const [isEnrolling, setIsEnrolling] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  const handleEnroll = async () => {
    setIsEnrolling(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please log in to enroll in courses')
        return
      }

      const { error } = await supabase
        .from('enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId
        })

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('You are already enrolled in this course')
        } else {
          toast.error('Failed to enroll in course')
        }
        return
      }

      toast.success('Successfully enrolled in course!')
      router.refresh()
    } catch (error) {
      console.error('Error enrolling:', error)
      toast.error('An error occurred while enrolling')
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <Button 
      className="w-full" 
      size="lg" 
      onClick={handleEnroll}
      disabled={isEnrolling}
    >
      {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
    </Button>
  )
}