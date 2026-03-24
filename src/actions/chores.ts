'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateChoreDetails(id: string, formData: FormData) {
  const supabase = await createClient()
  const freq = parseInt(formData.get('frequency_days') as string, 10)
  const notes = formData.get('notes') as string
  
  if (freq > 0) {
    await supabase.from('chores').update({ frequency_days: freq, notes }).eq('id', id)
    revalidatePath('/manage')
    revalidatePath('/dashboard')
  }
}

export async function createChore(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const frequency_days = parseInt(formData.get('frequency_days') as string, 10)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) return { error: "No household found" }

  const { error } = await supabase.from('chores').insert([{
    household_id: profile.household_id,
    title,
    description,
    frequency_days
  }])

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard')
  revalidatePath('/manage')
  return { success: true }
}

export async function markChoreDone(choreId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from('chore_logs').insert([{
    chore_id: choreId,
    user_id: user.id
  }])

  if (error) return { error: error.message }

  // Reset all sub-steps for this recurring chore so they are ready for next cycle
  await supabase.from('chore_steps').update({ is_done: false }).eq('chore_id', choreId)

  revalidatePath('/dashboard')
  revalidatePath('/manage')
  return { success: true }
}

export async function deleteChore(choreId: string) {
  const supabase = await createClient()
  await supabase.from('chores').delete().eq('id', choreId)
  revalidatePath('/dashboard')
  revalidatePath('/manage')
}

export async function addChoreStep(formData: FormData) {
  const supabase = await createClient()
  const chore_id = formData.get('chore_id') as string
  const title = formData.get('title') as string
  if (chore_id && title) {
    await supabase.from('chore_steps').insert({ chore_id, title })
    revalidatePath('/manage')
    revalidatePath('/dashboard')
  }
}

export async function toggleChoreStep(stepId: string, isDone: boolean) {
  const supabase = await createClient()
  await supabase.from('chore_steps').update({ is_done: isDone }).eq('id', stepId)
  revalidatePath('/dashboard')
}

export async function deleteChoreStep(stepId: string) {
  const supabase = await createClient()
  await supabase.from('chore_steps').delete().eq('id', stepId)
  revalidatePath('/manage')
  revalidatePath('/dashboard')
}

