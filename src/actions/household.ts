'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function ensureProfile(userId: string, email: string) {
  const supabase = await createClient()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  
  if (!profile) {
    await supabase.from('profiles').insert([{ id: userId, email, display_name: email.split('@')[0] }])
  }
}

export async function createHousehold(formData: FormData) {
  const supabase = await createClient()
  const name = formData.get('name') as string

  if (!name) return { error: "Name is required" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }
  
  await ensureProfile(user.id, user.email!)

  const { data: household, error: hcError } = await supabase
    .from('households')
    .insert([{ name }])
    .select()
    .single()

  if (hcError || !household) return { error: hcError?.message || "Error creating household" }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ household_id: household.id })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/dashboard')
  revalidatePath('/setup')
  return { success: true }
}

export async function joinHousehold(formData: FormData) {
  const supabase = await createClient()
  const householdId = formData.get('household_id') as string

  if (!householdId) return { error: "Household ID is required" }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }
  
  await ensureProfile(user.id, user.email!)

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ household_id: householdId })
    .eq('id', user.id)

  if (profileError) return { error: profileError.message }

  revalidatePath('/dashboard')
  revalidatePath('/setup')
  return { success: true }
}
