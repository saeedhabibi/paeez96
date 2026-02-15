// lib/api.ts
import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}

export function handleError(err: unknown) {
  console.error(err)
  if (err instanceof ZodError) {
    return error(err.errors.map((e) => e.message).join(', '), 422)
  }
  if (err instanceof Error) {
    return error(err.message, 500)
  }
  return error('Internal server error', 500)
}
