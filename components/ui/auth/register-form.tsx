'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

export default function RegisterForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const router = useRouter()
    const supabase = createClientComponentClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        // Password validation
        if (password !== confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long')
            setLoading(false)
            return
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        email: email,
                        created_at: new Date().toISOString()
                    }
                }
            })

            if (error) {
                console.error('Signup error:', error)
                
                // Handle specific error types
                if (error.message.includes('Database error saving new user')) {
                    setError('Database configuration issue. Please check your Supabase database setup, RLS policies, and table permissions.')
                } else if (error.message.includes('500') || error.message.includes('Internal server error')) {
                    setError('Server error: Please check your Supabase configuration and database setup.')
                } else if (error.message.includes('User already registered') || error.message.includes('already registered')) {
                    setError('An account with this email already exists. Please try signing in instead.')
                } else if (error.message.includes('Invalid email')) {
                    setError('Please enter a valid email address.')
                } else if (error.message.includes('Password')) {
                    setError('Password requirements not met. Please use at least 6 characters.')
                } else {
                    setError(error.message || 'An error occurred during registration.')
                }
            } else if (data.user) {
                // Only create profile if user creation was successful
                if (data.user.id) {
                    try {
                        // Check if users table exists and create profile
                        const { data: existingProfile } = await supabase
                            .from('users')
                            .select('id')
                            .eq('id', data.user.id)
                            .single()

                        if (!existingProfile) {
                            const { error: profileError } = await supabase
                                .from('users')
                                .upsert({
                                    id: data.user.id,
                                    email: data.user.email,
                                    created_at: new Date().toISOString(),
                                    updated_at: new Date().toISOString()
                                }, {
                                    onConflict: 'id'
                                })

                            if (profileError) {
                                console.warn('Profile creation error (non-fatal):', profileError)
                                // Don't fail the registration for profile creation issues
                            }
                        }
                    } catch (profileError) {
                        console.warn('Profile creation failed (non-fatal):', profileError)
                        // Don't fail the registration for profile creation issues
                    }
                }

                // Check if email confirmation is required
                if (!data.session) {
                    setSuccess('Registration successful! Please check your email and click the confirmation link to activate your account.')
                } else {
                    // User is immediately signed in (email confirmation disabled)
                    setSuccess('Registration successful! Redirecting to dashboard...')
                    setTimeout(() => {
                        router.push('/dashboard')
                    }, 1500)
                }
            }
        } catch (error: any) {
            console.error('Unexpected registration error:', error)
            if (error.message?.includes('Database error saving new user')) {
                setError('Database configuration issue. Please contact support or check your Supabase setup.')
            } else {
                setError('An unexpected error occurred. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div>
                <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Join thousands of learners today
                </p>
            </div>

            <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                            required
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                            placeholder="Create a password (min 6 characters)"
                        />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                            placeholder="Confirm your password"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="agree-terms"
                            name="agree-terms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                            I agree to the{' '}
                            <a href="#" className="text-green-600 hover:text-green-500">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="text-green-600 hover:text-green-500">
                                Privacy Policy
                            </a>
                        </label>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                            <div className="flex">
                                <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                            <div className="flex">
                                <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{success}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                            )}
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-500">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}