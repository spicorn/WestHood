import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { SchoolCrest } from '@/components/shared/brand'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { roleHome, useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  identifier: z.string().min(1, 'Enter your email or username'),
  password: z.string().min(1, 'Enter your password'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const session = useAuthStore((s) => s.session)
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [forgotOpen, setForgotOpen] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { identifier: '', password: '' },
  })

  if (session) return <Navigate to={roleHome(session.role)} replace />

  const onSubmit = handleSubmit((values) => {
    setFormError(null)
    const result = login(values.identifier, values.password)
    if (!result.ok) {
      setFormError(result.error)
      return
    }
    const role = useAuthStore.getState().session!.role
    navigate(roleHome(role), { replace: true })
  })

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #0f1d30 0%, #1e3a5f 42%, #2d5a3f 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(212,160,23,0.25), transparent 40%), radial-gradient(circle at 80% 80%, rgba(45,90,63,0.4), transparent 45%)',
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <SchoolCrest size="lg" />
            </div>
            <h1 className="font-display text-4xl font-semibold text-white">Westwood College</h1>
            <p className="mt-1 text-sm tracking-[0.25em] uppercase text-gold-400">Visus Manifestus.</p>
            <p className="mt-3 text-sm text-navy-100/70">School Management Portal</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/95 p-6 shadow-2xl backdrop-blur">
            <h2 className="font-display text-2xl font-semibold text-navy-800">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your school account credentials.</p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Email or username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="identifier" className="pl-9" placeholder="admin@westwood.co.zw" autoComplete="username" {...register('identifier')} />
                </div>
                {errors.identifier && <p className="text-xs text-destructive">{errors.identifier.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs font-medium text-navy-600 hover:underline" onClick={() => setForgotOpen(true)}>
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    className="pl-9 pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              {formError && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{formError}</div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Sign in
              </Button>
            </form>

            <div className="mt-5 rounded-md border border-dashed border-navy-200 bg-navy-50/60 p-3 text-xs text-muted-foreground">
              <p className="font-semibold text-navy-700 mb-1">Demo accounts</p>
              <p>admin / staff / parent / student — password matches the username</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset your password</DialogTitle>
            <DialogDescription>
              Password resets are handled by the school administrator. Please contact the IT office or front desk.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium">Westwood College IT Support</p>
            <p className="text-muted-foreground">it@westwood.co.zw · +263 242 885 120</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setForgotOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
