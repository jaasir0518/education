import { redirect } from 'next/navigation'
import LoginForm from '@/components/ui/auth/login-form'

export default function LoginPage() {
    // Uncomment the line below to redirect immediately
    // redirect('/')
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <LoginForm />
        </div>
    )
}