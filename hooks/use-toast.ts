// hooks/use-toast.ts
import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

interface ToastState {
  toasts: Toast[]
}

let toastCount = 0

export const useToast = () => {
  const [state, setState] = useState<ToastState>({ toasts: [] })

  const toast = useCallback(
    ({
      title,
      description,
      variant = 'default',
      duration = 3000,
    }: Omit<Toast, 'id'>) => {
      const id = (++toastCount).toString()
      const newToast: Toast = {
        id,
        title,
        description,
        variant,
        duration,
      }

      setState((prevState) => ({
        toasts: [...prevState.toasts, newToast],
      }))

      // Auto-remove toast after duration
      setTimeout(() => {
        setState((prevState) => ({
          toasts: prevState.toasts.filter((t) => t.id !== id),
        }))
      }, duration)

      return id
    },
    []
  )

  const dismissToast = useCallback((id: string) => {
    setState((prevState) => ({
      toasts: prevState.toasts.filter((t) => t.id !== id),
    }))
  }, [])

  return {
    toast,
    dismiss: dismissToast,
    toasts: state.toasts,
  }
}

// Simple toast component for basic usage
export const toast = ({
  title,
  description,
  variant = 'default',
}: Omit<Toast, 'id' | 'duration'>) => {
  console.log(`[${variant.toUpperCase()}] ${title}${description ? `: ${description}` : ''}`)
}