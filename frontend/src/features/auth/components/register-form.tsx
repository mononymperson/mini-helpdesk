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
import { registerAction } from '@/features/auth/actions'
import { registerSchema, type RegisterValues } from '@/features/auth/schema'

const REGISTER_FIELDS = ['business_name', 'name', 'email', 'password'] as const

export function RegisterForm() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      business_name: '',
      name: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: RegisterValues) {
    setServerError(null)

    const result = await registerAction(values)

    if (!result.ok) {
      for (const [field, message] of Object.entries(result.errors ?? {})) {
        if ((REGISTER_FIELDS as readonly string[]).includes(field)) {
          form.setError(field as (typeof REGISTER_FIELDS)[number], {
            type: 'server',
            message,
          })
        }
      }
      setServerError(result.message ?? 'Registration failed')
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up your helpdesk business.
        </p>
      </div>
      <Card>
        <CardContent>
          <form
            id="register-form"
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup>
              <Controller
                name="business_name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-business-name">
                      Business name
                    </FieldLabel>
                    <Input
                      {...field}
                      id="register-business-name"
                      autoComplete="organization"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-name">Name</FieldLabel>
                    <Input
                      {...field}
                      id="register-name"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="register-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="register-email"
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
                    <FieldLabel htmlFor="register-password">
                      Password
                    </FieldLabel>
                    <Input
                      {...field}
                      id="register-password"
                      type="password"
                      autoComplete="new-password"
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
                form="register-form"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? 'Creating account...'
                  : 'Register'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-primary underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
