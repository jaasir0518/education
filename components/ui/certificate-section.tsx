'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Download, Award, User, Calendar, BookOpen } from 'lucide-react'
import { formatDateShort } from '@/lib/date-utils'

interface CertificateSectionProps {
  courseId: string
  courseTitle: string
  instructor: string
  completionDate: Date
  userEmail?: string
}

export function CertificateSection({
  courseId,
  courseTitle,
  instructor,
  completionDate,
  userEmail
}: CertificateSectionProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateGenerated, setCertificateGenerated] = useState(false)

  const handleGenerateCertificate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first name and last name')
      return
    }

    setIsGenerating(true)
    
    try {
      // Here you would typically call your API to generate the certificate
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate certificate canvas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        throw new Error('Could not create canvas context')
      }

      // Set canvas dimensions
      canvas.width = 800
      canvas.height = 600

      // Background
      ctx.fillStyle = '#f8f9fa'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Border
      ctx.strokeStyle = '#2563eb'
      ctx.lineWidth = 8
      ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

      // Inner border
      ctx.strokeStyle = '#1d4ed8'
      ctx.lineWidth = 2
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

      // Title
      ctx.fillStyle = '#1f2937'
      ctx.font = 'bold 32px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Certificate of Completion', canvas.width / 2, 120)

      // Subtitle
      ctx.font = '18px Arial'
      ctx.fillStyle = '#6b7280'
      ctx.fillText('This is to certify that', canvas.width / 2, 160)

      // Student name
      ctx.font = 'bold 28px Arial'
      ctx.fillStyle = '#2563eb'
      ctx.fillText(`${firstName} ${lastName}`, canvas.width / 2, 220)

      // Course completion text
      ctx.font = '18px Arial'
      ctx.fillStyle = '#6b7280'
      ctx.fillText('has successfully completed the course', canvas.width / 2, 260)

      // Course title
      ctx.font = 'bold 24px Arial'
      ctx.fillStyle = '#1f2937'
      ctx.fillText(courseTitle, canvas.width / 2, 310)

      // Instructor
      ctx.font = '16px Arial'
      ctx.fillStyle = '#6b7280'
      ctx.fillText(`Instructor: ${instructor}`, canvas.width / 2, 360)

      // Date
      ctx.fillText(`Completion Date: ${formatDateShort(completionDate)}`, canvas.width / 2, 390)

      // Award icon (simple star)
      ctx.fillStyle = '#fbbf24'
      ctx.font = '40px Arial'
      ctx.fillText('⭐', canvas.width / 2, 460)

      // Signature line
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(canvas.width / 2 - 100, 520)
      ctx.lineTo(canvas.width / 2 + 100, 520)
      ctx.stroke()

      ctx.font = '14px Arial'
      ctx.fillStyle = '#6b7280'
      ctx.fillText('Authorized Signature', canvas.width / 2, 540)

      setCertificateGenerated(true)
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadCertificate = () => {
    // Recreate the certificate for download
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 800
    canvas.height = 600

    // Background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Border
    ctx.strokeStyle = '#2563eb'
    ctx.lineWidth = 8
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)

    // Inner border
    ctx.strokeStyle = '#1d4ed8'
    ctx.lineWidth = 2
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80)

    // Title
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 32px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Certificate of Completion', canvas.width / 2, 120)

    // Subtitle
    ctx.font = '18px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('This is to certify that', canvas.width / 2, 160)

    // Student name
    ctx.font = 'bold 28px Arial'
    ctx.fillStyle = '#2563eb'
    ctx.fillText(`${firstName} ${lastName}`, canvas.width / 2, 220)

    // Course completion text
    ctx.font = '18px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('has successfully completed the course', canvas.width / 2, 260)

    // Course title
    ctx.font = 'bold 24px Arial'
    ctx.fillStyle = '#1f2937'
    ctx.fillText(courseTitle, canvas.width / 2, 310)

    // Instructor
    ctx.font = '16px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(`Instructor: ${instructor}`, canvas.width / 2, 360)

    // Date
    ctx.fillText(`Completion Date: ${formatDateShort(completionDate)}`, canvas.width / 2, 390)

    // Award icon
    ctx.fillStyle = '#fbbf24'
    ctx.font = '40px Arial'
    ctx.fillText('⭐', canvas.width / 2, 460)

    // Signature line
    ctx.strokeStyle = '#6b7280'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 100, 520)
    ctx.lineTo(canvas.width / 2 + 100, 520)
    ctx.stroke()

    ctx.font = '14px Arial'
    ctx.fillStyle = '#6b7280'
    ctx.fillText('Authorized Signature', canvas.width / 2, 540)

    // Download
    const link = document.createElement('a')
    link.download = `${courseTitle}_Certificate_${firstName}_${lastName}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <Card className="mb-8 border-2 border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <Award className="w-6 h-6" />
          🎉 Congratulations! You've completed the course!
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Completion Badge */}
          <div className="flex items-center justify-center">
            <Badge variant="default" className="bg-green-500 text-white px-4 py-2 text-lg">
              ✅ Course Completed
            </Badge>
          </div>

          {/* Course Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Course:</span>
              <span className="text-gray-600">{courseTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Instructor:</span>
              <span className="text-gray-600">{instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Completed:</span>
              <span className="text-gray-600">{formatDateShort(completionDate)}</span>
            </div>
          </div>

          {!certificateGenerated ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Get Your Certificate of Completion
                </h3>
                <p className="text-gray-600 text-sm">
                  Enter your details below to generate your personalized certificate
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleGenerateCertificate}
                  disabled={isGenerating || !firstName.trim() || !lastName.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating Certificate...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Generate Certificate
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Certificate Generated Successfully!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your certificate for <strong>{courseTitle}</strong> is ready for download.
                </p>
                <p className="text-sm text-gray-500">
                  Certificate issued to: <strong>{firstName} {lastName}</strong>
                </p>
              </div>

              <Button
                onClick={downloadCertificate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Certificate
              </Button>

              <div className="text-xs text-gray-500 mt-2">
                <p>💡 Tip: Save this certificate to your device or print it for your records</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}