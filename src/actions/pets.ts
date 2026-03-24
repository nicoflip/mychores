'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) return

  const name = formData.get('name') as string
  const emoji = (formData.get('emoji') as string) || '🐱'
  const birthday = formData.get('birthday') as string

  if (!name) return

  const { error } = await supabase.from('pets').insert({
    household_id: profile.household_id,
    name,
    emoji,
    birthday: birthday || null,
  })

  if (error) console.error('createPet error:', error.message)
  revalidatePath('/pets')
}

export async function deletePet(petId: string) {
  const supabase = await createClient()
  await supabase.from('pets').delete().eq('id', petId)
  revalidatePath('/pets')
}

export async function updatePet(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('pet_id') as string
  const name = formData.get('name') as string
  const emoji = (formData.get('emoji') as string) || 'tabby-brown'
  const birthday = formData.get('birthday') as string || null
  if (!id || !name) return
  const { error } = await supabase.from('pets').update({ name, emoji, birthday }).eq('id', id)
  if (error) console.error('updatePet error:', error.message)
  revalidatePath('/pets')
}

export async function createTreatment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) return

  const pet_id = formData.get('pet_id') as string
  const name = formData.get('name') as string
  const frequency_days = parseInt(formData.get('frequency_days') as string, 10) || 30
  const doses_remaining = parseInt(formData.get('doses_remaining') as string, 10) || 0

  if (!pet_id || !name) return

  const { error } = await supabase.from('pet_treatments').insert({
    pet_id,
    household_id: profile.household_id,
    name,
    frequency_days,
    doses_remaining,
  })

  if (error) console.error('createTreatment error:', error.message)
  revalidatePath('/pets')
}

export async function administerTreatment(treatmentId: string, currentDoses: number) {
  const supabase = await createClient()
  const newDoses = Math.max(0, currentDoses - 1)

  const { error } = await supabase.from('pet_treatments').update({
    doses_remaining: newDoses,
    last_given_at: new Date().toISOString(),
  }).eq('id', treatmentId)

  if (error) console.error('administerTreatment error:', error.message)
  revalidatePath('/pets')
}

export async function deleteTreatment(treatmentId: string) {
  const supabase = await createClient()
  await supabase.from('pet_treatments').delete().eq('id', treatmentId)
  revalidatePath('/pets')
}

export async function refillTreatment(treatmentId: string, doses: number) {
  const supabase = await createClient()
  const { error } = await supabase.from('pet_treatments').update({
    doses_remaining: doses,
  }).eq('id', treatmentId)

  if (error) console.error('refillTreatment error:', error.message)
  revalidatePath('/pets')
}
