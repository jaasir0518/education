// app/api/videos/[id]/download/route.ts
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

    // Get video from database
    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        *,
        courses (
          title,
          instructor
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    // Check if user has access to this video
    // This could be through enrollment, purchase, or other access control
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', video.course_id)
      .single()

    if (enrollmentError || !enrollment) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // If video has a file URL (stored in Supabase storage)
    if (video.file_url) {
      // Get signed URL for download
      const { data: signedUrl, error: urlError } = await supabase
        .storage
        .from('videos')
        .createSignedUrl(video.file_path, 3600) // 1 hour expiry

      if (urlError) {
        return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
      }

      // Redirect to signed URL for download
      return NextResponse.redirect(signedUrl.signedUrl)
    }

    // If video data is stored directly in database (base64)
    if (video.video_data) {
      const videoBuffer = Buffer.from(video.video_data, 'base64')
      
      // Determine content type based on file extension or metadata
      const contentType = video.mime_type || 'video/mp4'
      const filename = `${video.title || 'video'}.${video.file_extension || 'mp4'}`

      return new NextResponse(videoBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': videoBuffer.length.toString(),
          'Accept-Ranges': 'bytes'
        }
      })
    }

    // If video is stored externally (URL)
    if (video.external_url) {
      try {
        const response = await fetch(video.external_url)
        if (!response.ok) {
          throw new Error('Failed to fetch video')
        }

        const videoBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type') || 'video/mp4'
        const filename = `${video.title || 'video'}.mp4`

        return new NextResponse(videoBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': videoBuffer.byteLength.toString(),
            'Accept-Ranges': 'bytes'
          }
        })
      } catch (fetchError) {
        console.error('Error fetching external video:', fetchError)
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Video file not available' }, { status: 404 })

  } catch (error) {
    console.error('Video download error:', error)
      return NextResponse.json({ 
        error: 'Failed to download video' 
      }, { status: 500 })
    }
  }