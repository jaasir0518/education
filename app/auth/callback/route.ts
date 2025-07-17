import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        // Pass the cookies function directly to createRouteHandlerClient
        const supabase = createRouteHandlerClient({ cookies })
        
        try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code)
            
            if (error) {
                console.error('Error exchanging code for session:', error)
                // Redirect to error page or login with error message
                return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_error`)
            }

            // Optional: Add user to your custom users table if needed
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('users') // Assuming you have a users table
                    .upsert({
                        id: data.user.id,
                        email: data.user.email,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    })
                    .select()

                if (profileError) {
                    console.error('Error creating user profile:', profileError)
                }
            }

            // Redirect to home page on success
            return NextResponse.redirect(`${requestUrl.origin}/home`)
        } catch (error) {
            console.error('Unexpected error during auth callback:', error)
            return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=callback_error`)
        }
    }

    // If no code, redirect to login
    return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
}