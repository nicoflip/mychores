'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addShoppingItem(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  
  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) return
  
  const itemName = formData.get('item_name') as string
  if (!itemName) return
  
  await supabase.from('shopping_items').insert({
    household_id: profile.household_id,
    item_name: itemName
  })
  
  revalidatePath('/shopping')
}

export async function toggleShoppingItem(id: string, isPurchased: boolean) {
  const supabase = await createClient()
  await supabase.from('shopping_items').update({ is_purchased: isPurchased }).eq('id', id)
  revalidatePath('/shopping')
}

export async function deleteShoppingItem(id: string) {
  const supabase = await createClient()
  await supabase.from('shopping_items').delete().eq('id', id)
  revalidatePath('/shopping')
}
