'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { loginAction } from '@/features/auth/actions'
import { loginSchema, type LoginValues } from '@/features/auth/schema'

export function LoginForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setServerError(null)

    const result = await loginAction(values)

    if (!result.ok) {
      for (const [field, message] of Object.entries(result.errors ?? {})) {
        if (field === 'email' || field === 'password') {
          form.setError(field, { type: 'server', message })
        }
      }
      setServerError(result.message ?? 'Login failed')
      return
    }

    router.replace('/tickets')
    router.refresh()
  }

  useEffect(() => {
    form.reset()
  }, [])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      <Card>
        <CardContent>
          <form
            id="login-form"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              {serverError && (
                <FieldError errors={[{ message: serverError }]} />
              )}

              <Button
                type="submit"
                form="login-form"
                className="w-full"
                disabled={
                  !form.formState.isValid || form.formState.isSubmitting
                }
              >
                {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}{' '}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary underline">
          Register
        </Link>
      </p>
    </div>
  )
}
