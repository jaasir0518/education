import LoginForm from '@/components/ui/auth/login-form'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <Link href="/" className="text-2xl font-bold text-gray-900">
                        <span className="text-blue-600">Learn</span>Hub
                    </Link>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm />
            </div>

            <div className="mt-8 text-center">
                <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
                    ← Back to homepage
                </Link>
            </div>
        </div>
    )
}