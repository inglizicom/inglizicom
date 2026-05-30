'use client'

import { useState, useEffect } from 'react'

/**
 * Returns the correct base path prefix for CRM routes.
 *
 * - On admin.inglizi.com  → "" (empty) because the middleware maps
 *   /leads → /sales/leads, so links should be /leads, /students, etc.
 * - On inglizi.com        → "/sales" because routes live at /sales/*
 *
 * Defaults to "/sales" during SSR (safe fallback).
 */
export function useCrmBasePath(): string {
  const [base, setBase] = useState('/sales')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      if (host === 'admin.inglizi.com' || host.startsWith('admin.localhost')) {
        setBase('')
      }
    }
  }, [])

  return base
}

/** True when running on admin.inglizi.com */
export function useIsAdminDomain(): boolean {
  const [isAdmin, setIsAdmin] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      setIsAdmin(host === 'admin.inglizi.com' || host.startsWith('admin.localhost'))
    }
  }, [])
  return isAdmin
}
