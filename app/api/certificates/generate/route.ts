// app/api/certificates/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { jsPDF } from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const {
      certificateId,
      firstName,
      lastName,
      courseTitle,
      instructor,
      certificateNumber,
      completionDate,
      issuedDate
    } = await request.json()

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify certificate belongs to user
    const { data: certificate, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .eq('user_id', user.id)
      .single()

    if (certError || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Create PDF certificate
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    // Set up the certificate design
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const centerX = pageWidth / 2
    const centerY = pageHeight / 2

    // Background gradient effect (using rectangles)
    doc.setFillColor(240, 248, 255) // Light blue
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    // Border
    doc.setLineWidth(2)
    doc.setDrawColor(59, 130, 246) // Blue
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Inner border
    doc.setLineWidth(1)
    doc.setDrawColor(147, 197, 253) // Light blue
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

    // Title
    doc.setFontSize(36)
    doc.setTextColor(59, 130, 246) // Blue
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICATE OF COMPLETION', centerX, 50, { align: 'center' })

    // Decorative line
    doc.setLineWidth(1)
    doc.setDrawColor(59, 130, 246)
    doc.line(centerX - 60, 60, centerX + 60, 60)

    // Main content
    doc.setFontSize(16)
    doc.setTextColor(55, 65, 81) // Gray-700
    doc.setFont('helvetica', 'normal')
    doc.text('This is to certify that', centerX, 80, { align: 'center' })

    // Student name
    doc.setFontSize(28)
    doc.setTextColor(17, 24, 39) // Gray-900
    doc.setFont('helvetica', 'bold')
    doc.text(`${firstName} ${lastName}`, centerX, 100, { align: 'center' })

    // Course completion text
    doc.setFontSize(16)
    doc.setTextColor(55, 65, 81) // Gray-700
    doc.setFont('helvetica', 'normal')
    doc.text('has successfully completed the course', centerX, 120, { align: 'center' })

    // Course title
    doc.setFontSize(22)
    doc.setTextColor(59, 130, 246) // Blue
    doc.setFont('helvetica', 'bold')
    
    // Split long course titles
    const splitTitle = doc.splitTextToSize(courseTitle, pageWidth - 80)
    doc.text(splitTitle, centerX, 140, { align: 'center' })

    // Instructor
    doc.setFontSize(14)
    doc.setTextColor(55, 65, 81) // Gray-700
    doc.setFont('helvetica', 'normal')
    doc.text(`Instructor: ${instructor}`, centerX, 165, { align: 'center' })

    // Completion date
    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    doc.setFontSize(12)
    doc.setTextColor(107, 114, 128) // Gray-500
    doc.text(`Completed on: ${formattedDate}`, centerX, 180, { align: 'center' })

    // Certificate number
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // Gray-500
    doc.text(`Certificate ID: ${certificateNumber}`, centerX, 190, { align: 'center' })

    // Footer
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128) // Gray-500
    doc.text('This certificate verifies successful completion of the course requirements.', centerX, pageHeight - 25, { align: 'center' })

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer')

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${courseTitle}-Certificate.pdf"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    )
  }
}