import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 })
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${user.id}_${Date.now()}.${fileExtension}`
    const filePath = `avatars/${fileName}`

    try {
      // Try to upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        
        // If storage bucket doesn't exist, provide instructions
        if (uploadError.message.includes('Bucket not found')) {
          return NextResponse.json({ 
            error: 'Storage not configured. Please set up the "avatars" bucket in Supabase Storage.',
            instructions: 'Go to your Supabase dashboard > Storage > Create bucket named "avatars" with public access.'
          }, { status: 500 })
        }
        
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      if (!urlData.publicUrl) {
        return NextResponse.json({ error: 'Failed to get public URL' }, { status: 500 })
      }

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
      }

      return NextResponse.json({ 
        avatar_url: urlData.publicUrl,
        message: 'Avatar uploaded successfully' 
      })

    } catch (storageError) {
      console.error('Storage error:', storageError)
      return NextResponse.json({ 
        error: 'Storage service unavailable. Please try again or use avatar URL instead.',
        fallback: true
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
