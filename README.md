This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { progress, duration } = body
    
    // Validate the request body
    if (typeof progress !== 'number') {
      return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
    }

    console.log('API received:', { videoId: params.id, progress, duration })

    const supabase = createServerComponentClient({ cookies })
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.error('Auth error:', authError.message, authError)
      return NextResponse.json({ error: `Authentication failed: ${authError.message}` }, { status: 401 })
    }
    
    if (!user) {
      console.error('No user found')
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Validate inputs
    if (!params.id || typeof params.id !== 'string') {
      console.error('Invalid video ID:', params.id)
      return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 })
    }

    if (typeof progress !== 'number' || progress < 0) {
      console.error('Invalid progress value:', progress)
      return NextResponse.json({ error: 'Invalid progress value' }, { status: 400 })
    }

    // Calculate progress percentage if duration is provided
    const progressPercent = duration ? (progress / duration) * 100 : progress

    // Prepare the data to upsert
    const progressData = {
      user_id: user.id,
      video_id: params.id,
      progress: Math.min(Math.max(progressPercent, 0), 100), // Clamp between 0 and 100
      last_position: progress, // Store actual time position
      updated_at: new Date().toISOString(),
      ...(duration && typeof duration === 'number' && duration > 0 && { duration })
    }

    console.log('Attempting to save progress data:', progressData)

    // First, let's try to check if the video_progress table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('video_progress')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('Video progress table error:', {
        message: tableError.message,
        details: tableError.details,
        hint: tableError.hint,
        code: tableError.code
      })
      
      // If table doesn't exist, we'll create a simple log instead
      console.log('Video progress table not found, logging progress:', progressData)
      return NextResponse.json({ 
        success: true, 
        message: 'Progress logged (table not available)',
        data: progressData 
      })
    }

    // Upsert progress (insert or update)
    const { data, error } = await supabase
      .from('video_progress')
      .upsert(progressData, {
        onConflict: 'user_id,video_id'
      })
      .select()

    if (error) {
      console.error('Database error saving video progress:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        progressData: progressData
      })
      return NextResponse.json({ error: `Failed to save progress: ${error.message}` }, { status: 500 })
    }

    console.log('Video progress saved successfully:', data)
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      errorType: typeof error,
      errorString: String(error),
      error: error
    })
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to save progress',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}
