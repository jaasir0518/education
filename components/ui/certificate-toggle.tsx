'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Download, Award, User, Calendar, BookOpen, Menu, X, ChevronDown, CheckCircle } from 'lucide-react'
import { formatDateShort } from '@/lib/date-utils'

interface Certificate {
  id: string
  certificate_number: string
  first_name: string
  last_name: string
  course_title: string
  instructor: string
  issued_date: string
  completion_date: string
  user_id: string
  course_id: string
  created_at: string
}

interface CertificateToggleProps {
  courseId: string
  courseTitle: string
  instructor: string
  completionDate: Date
  userEmail?: string
  userId: string
  existingCertificate?: Certificate | null
}

export function CertificateToggle({
  courseId,
  courseTitle,
  instructor,
  completionDate,
  userEmail,
  userId,
  existingCertificate
}: CertificateToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [firstName, setFirstName] = useState(existingCertificate?.first_name || '')
  const [lastName, setLastName] = useState(existingCertificate?.last_name || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [certificateGenerated, setCertificateGenerated] = useState(!!existingCertificate)
  const [generatedCertificate, setGeneratedCertificate] = useState<Certificate | null>(existingCertificate || null)

  const handleGenerateCertificate = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both first name and last name')
      return
    }

    setIsGenerating(true)
    
    try {
      // Generate unique certificate number
      const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      
      // Save certificate to database
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          first_name: firstName,
          last_name: lastName,
          course_title: courseTitle,
          instructor: instructor,
          certificate_number: certificateNumber,
          completion_date: completionDate.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate certificate')
      }

      const certificateData = await response.json()
      
      // Simulate certificate generation process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setGeneratedCertificate(certificateData)
      setCertificateGenerated(true)
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCertificateCanvas = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null

    // Set canvas dimensions (A4 landscape proportions)
    canvas.width = 1200
    canvas.height = 850

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f8fafc')
    gradient.addColorStop(1, '#e2e8f0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Decorative border
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 12
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60)

    // Inner decorative border
    ctx.strokeStyle = '#1e40af'
    ctx.lineWidth = 4
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100)

    // Header decoration
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(50, 50, canvas.width - 100, 80)

    // Title
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Certificate of Completion', canvas.width / 2, 110)

    // Decorative line
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 300, 160)
    ctx.lineTo(canvas.width / 2 + 300, 160)
    ctx.stroke()

    // Subtitle
    ctx.fillStyle = '#64748b'
    ctx.font = '24px Arial'
    ctx.fillText('This is to certify that', canvas.width / 2, 220)

    // Student name with background
    ctx.fillStyle = '#f1f5f9'
    ctx.fillRect(canvas.width / 2 - 350, 250, 700, 80)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2
    ctx.strokeRect(canvas.width / 2 - 350, 250, 700, 80)

    ctx.fillStyle = '#1e40af'
    ctx.font = 'bold 42px Arial'
    ctx.fillText(`${firstName} ${lastName}`, canvas.width / 2, 305)

    // Course completion text
    ctx.fillStyle = '#64748b'
    ctx.font = '24px Arial'
    ctx.fillText('has successfully completed the course', canvas.width / 2, 380)

    // Course title with background
    ctx.fillStyle = '#f8fafc'
    ctx.fillRect(canvas.width / 2 - 400, 400, 800, 60)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 1
    ctx.strokeRect(canvas.width / 2 - 400, 400, 800, 60)

    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 32px Arial'
    ctx.fillText(courseTitle, canvas.width / 2, 440)

    // Details section
    ctx.fillStyle = '#64748b'
    ctx.font = '20px Arial'
    ctx.textAlign = 'left'
    
    // Instructor
    ctx.fillText(`Instructor: ${instructor}`, canvas.width / 2 - 300, 520)
    
    // Date
    ctx.fillText(`Completion Date: ${formatDateShort(completionDate)}`, canvas.width / 2 - 300, 550)
    
    // Certificate number - Fixed the type issue
    const certNumber = generatedCertificate?.certificate_number || 
                      existingCertificate?.certificate_number || 
                      `CERT-${Date.now()}`
    ctx.fillText(`Certificate Number: ${certNumber}`, canvas.width / 2 - 300, 580)

    // Award seal
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(canvas.width / 2 + 300, 540, 60, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = '#92400e'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('AWARD', canvas.width / 2 + 300, 530)
    ctx.fillText('SEAL', canvas.width / 2 + 300, 555)

    // Signature section
    ctx.fillStyle = '#64748b'
    ctx.font = '18px Arial'
    ctx.textAlign = 'center'
    
    // Signature line
    ctx.strokeStyle = '#64748b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2 - 150, 680)
    ctx.lineTo(canvas.width / 2 + 150, 680)
    ctx.stroke()

    ctx.fillText('Authorized Signature', canvas.width / 2, 710)

    // Footer
    ctx.fillStyle = '#94a3b8'
    ctx.font = '16px Arial'
    ctx.fillText('This certificate verifies successful completion of the course requirements', canvas.width / 2, 750)

    return canvas
  }

  const downloadCertificate = () => {
    const canvas = generateCertificateCanvas()
    if (!canvas) return

    // Download
    const link = document.createElement('a')
    link.download = `${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Certificate_${firstName}_${lastName}.png`
    link.href = canvas.toDataURL('image/png', 1.0)
    link.click()
  }

  const currentCertificate = generatedCertificate || existingCertificate

  return (
    <div className="absolute top-4 right-4 z-10">
      {/* Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
        size="sm"
      >
        <Award className="w-4 h-4 mr-2" />
        Get Certificate
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Certificate Panel */}
      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 border-2 border-green-200 bg-white shadow-xl z-20">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Award className="w-5 h-5" />
                Certificate of Completion
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {currentCertificate ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge variant="default" className="bg-green-500 text-white mb-2">
                    ✅ Certificate Generated
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Your certificate was issued on {formatDateShort(currentCertificate.issued_date)}
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Name:</span>
                    <span>{currentCertificate.first_name} {currentCertificate.last_name}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Course:</span>
                    <span className="text-xs">{courseTitle}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Certificate #:</span>
                    <span className="text-xs">{currentCertificate.certificate_number}</span>
                  </div>
                </div>

                <Button
                  onClick={downloadCertificate}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {!certificateGenerated ? (
                  <>
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">
                        🎉 Congratulations! You've completed the course video.
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        Enter your details to generate your certificate:
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="firstName" className="text-sm font-medium">
                          First Name *
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Enter first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="lastName" className="text-sm font-medium">
                          Last Name *
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Enter last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleGenerateCertificate}
                      disabled={isGenerating || !firstName.trim() || !lastName.trim()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center mb-2">
                      <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    <Badge variant="default" className="bg-green-500 text-white">
                      ✅ Certificate Generated Successfully!
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Your certificate has been generated and is ready for download.
                    </p>
                    
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Name:</span>
                        <span>{firstName} {lastName}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Course:</span>
                        <span className="text-xs">{courseTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Certificate #:</span>
                        const certNumber = generatedCertificate?.certificate_number || 
                  existingCertificate?.certificate_number || 
                  `CERT-${Date.now()}`
                      </div>
                    </div>

                    <Button
                      onClick={downloadCertificate}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}