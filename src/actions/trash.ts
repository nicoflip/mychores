'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTrashSchedule(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) return

  const label = formData.get('label') as string
  const day_of_week = parseInt(formData.get('day_of_week') as string, 10)
  const frequency_weeks = parseInt(formData.get('frequency_weeks') as string, 10) || 1
  const color = (formData.get('color') as string) || 'zinc'

  if (!label || isNaN(day_of_week)) return

  const { error } = await supabase.from('trash_schedules').insert({
    household_id: profile.household_id,
    label,
    day_of_week,
    frequency_weeks,
    color,
  })

  if (error) console.error('createTrashSchedule error:', error.message)
  revalidatePath('/add')
  revalidatePath('/dashboard')
}

export async function deleteTrashSchedule(id: string) {
  const supabase = await createClient()
  await supabase.from('trash_schedules').delete().eq('id', id)
  revalidatePath('/add')
  revalidatePath('/dashboard')
}
