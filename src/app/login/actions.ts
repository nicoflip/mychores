'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    redirect('/login?view=signup&error=Veuillez remplir tous les champs')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name }
    }
  })

  if (error) {
    redirect(`/login?view=signup&error=${error.message}`)
  }

  if (data.user) {
    await supabase.from('profiles').upsert([
      { id: data.user.id, email: email, display_name: name }
    ])
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
