// app/api/profile/route.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch user profile
export async function GET() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch profile data from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" - we'll create a profile if it doesn't exist
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // If profile doesn't exist, create one
    if (!profile) {
      const newProfile = {
        id: user.id,
        username: null,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        website: null,
      }

      const { data: createdProfile, error: createError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single()

      if (createError) {
        console.error('Profile creation error:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        },
        profile: createdProfile,
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
      },
      profile,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { username, full_name, avatar_url, website } = body

    // Validate username if provided
    if (username && username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    // Validate website URL if provided
    if (website && website.trim().length > 0) {
      try {
        new URL(website)
      } catch {
        return NextResponse.json({ error: 'Invalid website URL' }, { status: 400 })
      }
    }

    // Update profile in database
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        username: username?.trim() || null,
        full_name: full_name?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        website: website?.trim() || null,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      
      // Handle unique constraint violation for username
      if (updateError.code === '23505') {
        return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
      }
      
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete user profile and account
export async function DELETE() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First delete the profile (this will happen automatically due to CASCADE, but we can be explicit)
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileDeleteError) {
      console.error('Profile deletion error:', profileDeleteError)
      // Don't return here, continue with user deletion
    }

    // Sign out the user first
    await supabase.auth.signOut()

    // Delete the user account using the admin client
    const supabaseAdmin = createServerComponentClient({ cookies })
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) {
      console.error('Account deletion error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}