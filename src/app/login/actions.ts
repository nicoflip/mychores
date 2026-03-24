'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const emailRaw = formData.get('email') as string
  const passwordRaw = formData.get('password') as string

  if (!emailRaw || !passwordRaw) {
    redirect('/login?error=Veuillez remplir tous les champs')
  }

  const data = {
    email: emailRaw.trim(),
    password: passwordRaw,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    let msg = error.message
    if (msg.includes("Invalid login credentials")) msg = "Identifiants incorrects"
    redirect(`/login?error=${encodeURIComponent(msg)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const name = (formData.get('name') as string)?.trim()
  const emailRaw = formData.get('email') as string
  // Remove hidden chars, spaces, and make lowercase
  const email = emailRaw?.replace(/[\s\u200B-\u200D\uFEFF]/g, '')?.toLowerCase()
  const password = formData.get('password') as string

  if (!name || !email || !password) {
    redirect('/login?view=signup&error=Veuillez remplir tous les champs')
  }

  // Basic regex check before hitting Supabase just in case
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect('/login?view=signup&error=Adresse email invalide (vérifiez les espaces)')
  }

  if (password.length < 6) {
    redirect('/login?view=signup&error=Le mot de passe doit faire au moins 6 caractères')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name }
    }
  })

  // Traduire les erreurs courantes de Supabase
  if (error) {
    let msg = error.message
    if (msg.toLowerCase().includes("invalid format") || msg.toLowerCase().includes("unable to validate email") || msg.toLowerCase().includes("invalid")) {
      msg = "L'adresse email n'a pas un format valide."
    } else if (msg.toLowerCase().includes("already registered")) {
      msg = "Un compte utilise déjà cette adresse email."
    }
    redirect(`/login?view=signup&error=${encodeURIComponent(msg)}`)
  }

  if (data.user) {
    await supabase.from('profiles').upsert([
      { id: data.user.id, email: email, display_name: name }
    ])
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
