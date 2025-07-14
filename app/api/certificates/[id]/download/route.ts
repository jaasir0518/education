// app/api/certificates/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get certificate from database
    const { data: certificate, error } = await supabase
      .from('certificates')
      .select(`
        *,
        courses (
          title,
          instructor
        )
      `)
      .eq('id', params.id)
      .eq('user_id', user.id) // Ensure user can only download their own certificates
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // If PDF data doesn't exist, generate it
    if (!certificate.pdf_data) {
      // Import the PDF generation function from the generate route
      const { generateCertificatePDF } = await import('../../generate/route')
      
      const pdfBuffer = await generateCertificatePDF({
        certificateNumber: certificate.certificate_number,
        firstName: certificate.first_name,
        lastName: certificate.last_name,
        courseTitle: certificate.courses.title,
        instructor: certificate.courses.instructor,
        completionDate: certificate.completion_date
      })

      const pdfBase64 = pdfBuffer.toString('base64')

      // Update certificate with PDF data
      await supabase
        .from('certificates')
        .update({ 
          pdf_data: pdfBase64,
          generated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      // Return the newly generated PDF
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="Certificate-${certificate.certificate_number}.pdf"`,
          'Content-Length': pdfBuffer.length.toString()
        }
      })
    }

    // Convert base64 back to buffer
    const pdfBuffer = Buffer.from(certificate.pdf_data, 'base64')

    // Return PDF as download
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Certificate-${certificate.certificate_number}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Certificate download error:', error)
    return NextResponse.json({ 
      error: 'Failed to download certificate' 
    }, { status: 500 })
  }
}