/**
 * /sales/teachers — the teachers page for all staff (founders and assistants).
 * Same screen as /admin/teachers; it decides inside what only a founder may do
 * (change pay, delete an account). /admin/* stays founder-only.
 */
export { default } from '@/app/admin/teachers/page'
