'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createLaundryMachine(formData?: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) return
  
  // Get count of existing machines to generate a number
  const { count } = await supabase
    .from('laundry_machines')
    .select('*', { count: 'exact', head: true })
    .eq('household_id', profile.household_id)
    
  const machineNumber = (count || 0) + 1;
  const title = `Machine n°${machineNumber}`
  
  await supabase.from('laundry_machines').insert({
    household_id: profile.household_id,
    title,
    status: 'dirty'
  })
  
  revalidatePath('/laundry')
}

export async function updateLaundryStatus(id: string, status: string) {
  const supabase = await createClient()
  
  if (status === 'done') {
    await supabase.from('laundry_machines').delete().eq('id', id)
  } else {
    // update state and timestamp
    await supabase.from('laundry_machines').update({ 
      status, 
      updated_at: new Date().toISOString() 
    }).eq('id', id)
  }
  
  revalidatePath('/laundry')
}

export async function deleteLaundryMachine(id: string) {
  const supabase = await createClient()
  await supabase.from('laundry_machines').delete().eq('id', id)
  revalidatePath('/laundry')
}
