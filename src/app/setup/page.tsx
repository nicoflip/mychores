import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createHousehold, joinHousehold } from '@/actions/household'
import { Nav } from '@/components/Nav'
import { Home, Key, Plus, LogOut } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SetupPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('household_id')
    .eq('id', user.id)
    .single()

  // Si l'utilisateur a déjà un foyer, on le renvoie au dashboard
  if (profile?.household_id) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative bg-slate-50">
      <Nav />
      
      {/* Decorative gradient background elements */}
      <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute -right-[10%] top-[20%] h-[50%] w-[50%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none" />

      <main className="mx-auto mt-8 max-w-4xl px-4 md:mt-24 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12 fade-in-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-blue-500/10">
            <Home className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Bienvenue sur ChoresSync</h1>
          <p className="mt-4 text-lg font-medium text-zinc-500 max-w-xl mx-auto">
            Pour commencer à gérer vos tâches, vous devez créer votre propre foyer ou en rejoindre un existant en utilisant un code d'invitation.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Create Household Form */}
          <div className="rounded-[2rem] glass-card p-8 md:p-10 fade-in-up stagger-1 relative overflow-hidden group hover:border-blue-200 transition-colors">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-100 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-6 shadow-inner">
                  <Plus className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Nouveau foyer</h2>
                <p className="mt-2 text-sm text-zinc-500 font-medium">Vous êtes le premier de votre famille ? Créez l'environnement de base.</p>
              </div>

              <form action={async (formData) => { 
                "use server"; 
                await createHousehold(formData); 
                redirect('/dashboard');
              }} className="mt-auto space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-semibold text-zinc-700">Nom du foyer</label>
                  <input
                    id="name"
                    name="name"
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    placeholder="Ex: Maison de famille, Coloc..."
                  />
                </div>
                <button className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95">
                  Créer et continuer
                </button>
              </form>
            </div>
          </div>

          {/* Join Household Form */}
          <div className="rounded-[2rem] glass-card p-8 md:p-10 fade-in-up stagger-2 relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-indigo-100 blur-2xl opacity-50 transition-opacity group-hover:opacity-100" />
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 mb-6 shadow-inner">
                  <Key className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Rejoindre un foyer</h2>
                <p className="mt-2 text-sm text-zinc-500 font-medium">Quelqu'un vous a invité ? Entrez le code de votre foyer partagé.</p>
              </div>

              <form action={async (formData) => { 
                "use server"; 
                await joinHousehold(formData); 
                redirect('/dashboard');
              }} className="mt-auto space-y-4">
                <div className="space-y-2">
                  <label htmlFor="household_id" className="text-sm font-semibold text-zinc-700">Code d'invitation (ID)</label>
                  <input
                    id="household_id"
                    name="household_id"
                    required
                    className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm text-zinc-900 font-mono transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                    placeholder="Ex: 123e4567-e89b-12d3..."
                  />
                </div>
                <button className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95">
                  Rejoindre le foyer
                </button>
              </form>
            </div>
          </div>

        </div>

        <div className="mt-12 text-center fade-in-up stagger-3">
          <form action={async () => {
            "use server";
            const supabase = await createClient();
            await supabase.auth.signOut();
            redirect("/login");
          }}>
            <button className="inline-flex items-center text-sm font-medium text-zinc-400 hover:text-red-500 transition-colors">
              <LogOut className="mr-2 h-4 w-4" />
              Se déconnecter et revenir plus tard
            </button>
          </form>
        </div>

      </main>
    </div>
  )
}
