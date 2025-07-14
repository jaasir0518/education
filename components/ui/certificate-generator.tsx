'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Input } from './input'
import { Label } from './label'
import { Badge } from './badge'
import { Award, Download, User, Calendar, FileText } from 'lucide-react'

interface CertificateGeneratorProps {
  courseId: string
  courseTitle: string
  instructor: string
  userId: string
  userEmail: string
  userProfile: {
    id: string
    first_name: string | null
    last_name: string | null
    email: string
  } | null
}

interface CertificateData {
  id: string
  certificate_number: string
  first_name: string
  last_name: string
  course_title: string
  instructor: string
  completion_date: string
  issued_date: string
}

export function CertificateGenerator({ 
  courseId, 
  courseTitle, 
  instructor, 
  userId, 
  userEmail, 
  userProfile 
}: CertificateGeneratorProps) {
  const [firstName, setFirstName] = useState(userProfile?.first_name || '')
  const [lastName, setLastName] = useState(userProfile?.last_name || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificate, setCertificate] = useState<CertificateData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  const generateCertificate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your first and last name')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // First, update the user's profile if needed
      if (userProfile && (!userProfile.first_name || !userProfile.last_name)) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            email: userEmail
          })
      }

      // Generate certificate number
      const certificateNumber = `CERT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      // Create certificate record
      const { data: certificateData, error: certificateError } = await supabase
        .from('certificates')
        .insert({
          user_id: userId,
          course_id: courseId,
          certificate_number: certificateNumber,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          course_title: courseTitle,
          instructor: instructor,
          completion_date: new Date().toISOString(),
          issued_date: new Date().toISOString()
        })
        .select()
        .single()

      if (certificateError) {
        throw certificateError
      }

      setCertificate(certificateData)
    } catch (error: any) {
      console.error('Error generating certificate:', error)
      setError(error.message || 'Failed to generate certificate')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCertificate = async () => {
    if (!certificate) return

    try {
      // Create a simple PDF certificate (you can enhance this with a proper PDF library)
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: certificate.id,
          firstName: certificate.first_name,
          lastName: certificate.last_name,
          courseTitle: certificate.course_title,
          instructor: certificate.instructor,
          certificateNumber: certificate.certificate_number,
          completionDate: certificate.completion_date,
          issuedDate: certificate.issued_date
        })
      })

      if (!response.ok) {
        throw new Error('Failed to download certificate')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${courseTitle}-Certificate.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading certificate:', error)
      setError('Failed to download certificate')
    }
  }

  if (certificate) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-green-600">Certificate Generated!</CardTitle>
          <CardDescription>
            Congratulations! You've successfully completed the course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Certificate Details</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900">
                {certificate.first_name} {certificate.last_name}
              </h3>
              
              <p className="text-sm text-gray-600 mb-2">
                has successfully completed
              </p>
              
              <h4 className="text-md font-semibold text-gray-900 mb-2">
                {certificate.course_title}
              </h4>
              
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-3 h-3" />
                  <span>Instructor: {certificate.instructor}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Completed: {new Date(certificate.completion_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <Badge variant="outline" className="mt-2">
                #{certificate.certificate_number}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <Button 
              onClick={downloadCertificate}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Certificate
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigator.share?.({
                title: 'My Course Certificate',
                text: `I just completed ${courseTitle} and earned a certificate!`,
                url: window.location.href
              })}
            >
              Share Achievement
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl">Get Your Certificate</CardTitle>
        <CardDescription>
          You've completed the course video! Enter your details to generate your certificate.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Certificate Preview</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><strong>Course:</strong> {courseTitle}</p>
            <p><strong>Instructor:</strong> {instructor}</p>
            <p><strong>Student:</strong> {firstName || '[First Name]'} {lastName || '[Last Name]'}</p>
            <p><strong>Completion Date:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <Button 
          onClick={generateCertificate}
          disabled={isGenerating || !firstName.trim() || !lastName.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          size="lg"
        >
          {isGenerating ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Certificate...</span>
            </div>
          ) : (
            <>
              <Award className="w-4 h-4 mr-2" />
              Generate Certificate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}