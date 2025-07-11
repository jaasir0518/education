// import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { redirect } from 'next/navigation'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'

// export default async function ProfilePage() {
//   const supabase = createServerComponentClient({ cookies })
  
//   const {
//     data: { user },
//   } = await supabase.auth.getUser()

//   if (!user) {
//     redirect('/auth/login')
//   }

//   // Mock user profile data - replace with actual data fetching
//   const userProfile = {
//     email: user.email,
//     full_name: user.user_metadata?.full_name || '',
//     bio: user.user_metadata?.bio || '',
//     location: user.user_metadata?.location || '',
//     website: user.user_metadata?.website || '',
//     avatar_url: user.user_metadata?.avatar_url || '',
//     created_at: user.created_at,
//     last_sign_in: user.last_sign_in_at
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
//           <p className="text-gray-600">Manage your account information and preferences</p>
//         </div>

//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Profile Overview */}
//           <div className="lg:col-span-1">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Profile Overview</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 {/* Avatar */}
//                 <div className="flex flex-col items-center">
//                   <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
//                     {userProfile.avatar_url ? (
//                       <img 
//                         src={userProfile.avatar_url} 
//                         alt="Profile" 
//                         className="w-full h-full rounded-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-2xl text-gray-500">
//                         {userProfile.full_name ? userProfile.full_name[0].toUpperCase() : '👤'}
//                       </span>
//                     )}
//                   </div>
//                   <Button variant="outline" size="sm">
//                     Change Avatar
//                   </Button>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="border-t pt-4">
//                   <div className="space-y-2">
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Member since</span>
//                       <span className="text-sm font-medium">
//                         {new Date(userProfile.created_at).toLocaleDateString()}
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Last login</span>
//                       <span className="text-sm font-medium">
//                         {userProfile.last_sign_in ? 
//                           new Date(userProfile.last_sign_in).toLocaleDateString() : 
//                           'N/A'
//                         }
//                       </span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Courses enrolled</span>
//                       <span className="text-sm font-medium">5</span>
//                     </div>
//                     <div className="flex justify-between">
//                       <span className="text-sm text-gray-600">Certificates earned</span>
//                       <span className="text-sm font-medium">2</span>
//                     </div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Profile Form */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Personal Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Personal Information</CardTitle>
//                 <CardDescription>
//                   Update your personal details and contact information
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="email">Email</Label>
//                     <Input 
//                       id="email" 
//                       type="email" 
//                       value={userProfile.email || ''} 
//                       disabled
//                       className="bg-gray-50"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       Email cannot be changed
//                     </p>
//                   </div>
//                   <div>
//                     <Label htmlFor="full_name">Full Name</Label>
//                     <Input 
//                       id="full_name" 
//                       type="text" 
//                       defaultValue={userProfile.full_name}
//                       placeholder="Enter your full name"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label htmlFor="bio">Bio</Label>
//                   <Textarea 
//                     id="bio" 
//                     placeholder="Tell us about yourself..."
//                     defaultValue={userProfile.bio}
//                     rows={3}
//                   />
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label htmlFor="location">Location</Label>
//                     <Input 
//                       id="location" 
//                       type="text" 
//                       defaultValue={userProfile.location}
//                       placeholder="Your location"
//                     />
//                   </div>
//                   <div>
//                     <Label htmlFor="website">Website</Label>
//                     <Input 
//                       id="website" 
//                       type="url" 
//                       defaultValue={userProfile.website}
//                       placeholder="https://your-website.com"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex gap-3">
//                   <Button>Save Changes</Button>
//                   <Button variant="outline">Cancel</Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Security Settings */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Security Settings</CardTitle>
//                 <CardDescription>
//                   Manage your account security and authentication
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between p-4 border rounded-lg">
//                   <div>
//                     <h4 className="font-medium">Password</h4>
//                     <p className="text-sm text-gray-600">
//                       Last changed 30 days ago
//                     </p>
//                   </div>
//                   <Button variant="outline">Change Password</Button>
//                 </div>

//                 <div className="flex items-center justify-between p-4 border rounded-lg">
//                   <div>
//                     <h4 className="font-medium">Two-Factor Authentication</h4>
//                     <p className="text-sm text-gray-600">
//                       Add an extra layer of security
//                     </p>
//                   </div>
//                   <Button variant="outline">Enable 2FA</Button>
//                 </div>

//                 <div className="flex items-center justify-between p-4 border rounded-lg">
//                   <div>
//                     <h4 className="font-medium">Active Sessions</h4>
//                     <p className="text-sm text-gray-600">
//                       Manage your logged-in devices
//                     </p>
//                   </div>
//                   <Button variant="outline">View Sessions</Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Preferences */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Preferences</CardTitle>
//                 <CardDescription>
//                   Customize your learning experience
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Email Notifications</h4>
//                     <p className="text-sm text-gray-600">
//                       Receive updates about your courses
//                     </p>
//                   </div>
//                   <Button variant="outline" size="sm">Configure</Button>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Language</h4>
//                     <p className="text-sm text-gray-600">
//                       Choose your preferred language
//                     </p>
//                   </div>
//                   <Button variant="outline" size="sm">English</Button>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h4 className="font-medium">Theme</h4>
//                     <p className="text-sm text-gray-600">
//                       Choose your preferred theme
//                     </p>
//                   </div>
//                   <Button variant="outline" size="sm">Light</Button>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Danger Zone */}
//             <Card className="border-red-200">
//               <CardHeader>
//                 <CardTitle className="text-red-600">Danger Zone</CardTitle>
//                 <CardDescription>
//                   Irreversible and destructive actions
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
//                   <div>
//                     <h4 className="font-medium text-red-600">Delete Account</h4>
//                     <p className="text-sm text-gray-600">
//                       Permanently delete your account and all data
//                     </p>
//                   </div>
//                   <Button variant="destructive" size="sm">
//                     Delete Account
//                   </Button>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// app/profile/page.tsx
// app/profile/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Loader2, Upload } from 'lucide-react'

interface UserProfile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  created_at: string
  updated_at: string | null
}

interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    avatar_url: '',
    website: '',
  })
  const [errors, setErrors] = useState({
    username: '',
    website: '',
  })
  
  const router = useRouter()

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        website: profile.website || '',
      })
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/auth/login')
          return
        }
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      setUserData(data.user)
      setProfile(data.profile)
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear errors when user starts typing
    if (field === 'username' || field === 'website') {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = { username: '', website: '' }
    let isValid = true

    // Validate username
    if (formData.username.trim() && formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
      isValid = false
    }
    
    // Validate website URL
    if (formData.website.trim() && formData.website.trim().length > 0) {
      try {
        new URL(formData.website.trim())
      } catch {
        newErrors.website = 'Please enter a valid website URL'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setErrors(prev => ({ ...prev, username: 'Username already taken' }))
          return
        }
        throw new Error(data.error || 'Failed to update profile')
      }

      setProfile(data.profile)
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
    )
    
    if (!confirmed) return

    setDeleting(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully",
      })
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        website: profile.website || '',
      })
    }
    setErrors({ username: '', website: '' })
  }

  const hasChanges = () => {
    if (!profile) return false
    return (
      formData.username !== (profile.username || '') ||
      formData.full_name !== (profile.full_name || '') ||
      formData.avatar_url !== (profile.avatar_url || '') ||
      formData.website !== (profile.website || '')
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!userData || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">Failed to load profile data</p>
          <Button onClick={fetchProfile} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4 relative overflow-hidden">
                    {formData.avatar_url ? (
                      <img 
                        src={formData.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="text-2xl text-gray-500">
                        {formData.full_name ? formData.full_name[0].toUpperCase() : '👤'}
                      </span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Use the Avatar URL field below
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Member since</span>
                      <span className="text-sm font-medium">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last login</span>
                      <span className="text-sm font-medium">
                        {userData.last_sign_in_at ? 
                          new Date(userData.last_sign_in_at).toLocaleDateString() : 
                          'N/A'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Username</span>
                      <span className="text-sm font-medium">
                        {profile.username || 'Not set'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={userData.email || ''} 
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      placeholder="Enter your username"
                      className={errors.username ? 'border-red-500' : ''}
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Must be at least 3 characters
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input 
                    id="avatar_url" 
                    type="url" 
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Link to your profile picture
                  </p>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website" 
                    type="url" 
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                    className={errors.website ? 'border-red-500' : ''}
                  />
                  {errors.website && (
                    <p className="text-xs text-red-500 mt-1">{errors.website}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleSave}
                    disabled={saving || !hasChanges()}
                  >
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={!hasChanges()}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-gray-600">
                      Change your account password
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Enable 2FA
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}