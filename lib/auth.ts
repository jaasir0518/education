import { supabase } from './supabase/client';

export interface Authuser {
    id: string
    email: string
    full_name?: string
    avatar_url?: string
}

export const signUp = async (email: string , password: string, fullname?: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullname,

            },
        },
    })

    if (error) throw error
    return data
}
export const signIn = async (email: string, password: string) => {
    const { data , error } = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw error 
    return data 
}

export const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error 
}
    export const getCurrentUser = async () => {
        const { data: { session}} = await supabase.auth.getSession()
        return session?.user ?? null;
    }

