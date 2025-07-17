// app/home/page.tsx
'use client'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Loading from './loading'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies })
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // If user is not authenticated, redirect to login
    if (!session) {
      redirect('/auth/login')
    }

    const { data: { user } } = await supabase.auth.getUser()

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header
          <header className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-600 mt-2">
                  Ready to continue your learning journey?
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href="/courses"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  My Courses
                </Link>
                <Link 
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Profile
                </Link>
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </header> */}

          {/* Landing Section - Platform Introduction */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 mb-12 text-white">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Transform Your Future with Expert-Led Learning</h2>
              <p className="text-xl mb-6 text-blue-100">
                Join thousands of learners who are advancing their careers with our comprehensive, 
                industry-focused courses designed by leading professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/courses"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Courses
                </Link>
                <Link 
                  href="/dashboard"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  View My Progress
                </Link>
              </div>
            </div>
          </section>

          {/* Explore Courses Section with Valuable Insights */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Learning Platform?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the unique advantages that set our platform apart and accelerate your learning journey
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast-Track Learning</h3>
                <p className="text-gray-600">
                  Learn 3x faster with our structured curriculum and interactive exercises. 
                  Master complex concepts through hands-on practice and real-world projects.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Industry-Verified Skills</h3>
                <p className="text-gray-600">
                  Gain credentials recognized by top employers. Our courses are designed with 
                  industry partners to ensure you learn relevant, in-demand skills.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Mentorship</h3>
                <p className="text-gray-600">
                  Get personalized guidance from industry experts. Join live sessions, 
                  ask questions, and receive feedback on your progress.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking</h3>
                <p className="text-gray-600">
                  Monitor your learning journey with detailed analytics. Track completion rates, 
                  skill improvements, and achievement milestones.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Flexible Learning</h3>
                <p className="text-gray-600">
                  Learn at your own pace, anytime, anywhere. Access courses on any device 
                  with offline capability for uninterrupted learning.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2h2a2 2 0 002-2V6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Career Support</h3>
                <p className="text-gray-600">
                  Get career guidance, resume reviews, and job placement assistance. 
                  Connect with our network of hiring partners and career counselors.
                </p>
              </div>
            </div>
          </section>

          {/* Creative Section - Learning Community & Success Stories */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Join Our Thriving Learning Community</h2>
                  <p className="text-xl text-gray-300">
                    Connect with fellow learners, share experiences, and celebrate achievements together
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Community Stats */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-6">Community Impact</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">50K+</div>
                        <div className="text-sm text-gray-400">Active Learners</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">95%</div>
                        <div className="text-sm text-gray-400">Success Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">1M+</div>
                        <div className="text-sm text-gray-400">Courses Completed</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-2">24/7</div>
                        <div className="text-sm text-gray-400">Support Available</div>
                      </div>
                    </div>
                  </div>

                  {/* Success Story */}
                  <div className="bg-gray-800 rounded-xl p-6">
                    <h3 className="text-2xl font-bold mb-4">Success Story</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">JS</span>
                        </div>
                        <div>
                          <div className="font-semibold">John Smith</div>
                          <div className="text-sm text-gray-400">Software Engineer at TechCorp</div>
                        </div>
                      </div>
                      <p className="text-gray-300">
                        "This platform transformed my career! I went from a junior developer to a senior 
                        engineer in just 8 months. The structured learning path and expert mentorship 
                        made all the difference."
                      </p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link 
              href="/courses"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Browse Courses</h3>
                  <p className="text-gray-600 text-sm mt-1">Explore available courses</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link 
              href="/dashboard"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Dashboard</h3>
                  <p className="text-gray-600 text-sm mt-1">View your progress</p>
                </div>
                <div className="text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Link>

            <Link 
              href="/profile"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
                  <p className="text-gray-600 text-sm mt-1">Manage your account</p>
                </div>
                <div className="text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Welcome to the platform!</p>
                    <p className="text-xs text-gray-500">Start by exploring our courses</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">Just now</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gray-900 text-white rounded-2xl p-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Company Info */}
                <div className="col-span-1 md:col-span-2">
                  <h3 className="text-2xl font-bold mb-4">LearnPlatform</h3>
                  <p className="text-gray-300 mb-4">
                    Empowering learners worldwide with cutting-edge education technology. 
                    Join millions who trust us to advance their careers and achieve their goals.
                  </p>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-semibold mb-4">Quick Links</h4>
                  <ul className="space-y-2">
                    <li><Link href="/courses" className="text-gray-400 hover:text-white transition-colors">All Courses</Link></li>
                    <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                    <li><Link href="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Certificates</a></li>
                  </ul>
                </div>

                {/* Support */}
                <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
                  </ul>
                </div>
              </div>
              
              <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
                <p>&copy; 2025 LearnPlatform. All rights reserved. | Privacy Policy | Terms of Service</p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in home page:', error)
    redirect('/auth/login')
  }
}