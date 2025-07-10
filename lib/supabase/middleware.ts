import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function updatesession9(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

 const supabase = createMiddlewareClient({ req: request, res: response })
    await supabase.auth.getSession()

    // You can add additional logic here if needed, such as modifying the response
    // or handling specific authentication flows.

    return response
}