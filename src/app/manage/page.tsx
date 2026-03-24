import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { Trash2, User, Key, CheckCircle2, LogOut, Info, Settings2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ManagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, households(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) redirect('/dashboard')

  const { data: choresData } = await supabase
    .from('chores')
    .select('*, chore_steps(*)')
    .eq('household_id', profile.household_id)
    .order('created_at', { ascending: false })
    
  const chores = choresData || []

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative">
      <Nav />
      <main className="mx-auto mt-8 max-w-5xl px-4 md:mt-32 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] glass-card p-6 md:p-10 fade-in-up stagger-1">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-50 blur-3xl opacity-60 flex" />
          <div className="relative z-10 flex flex-col justify-between md:flex-row md:items-end gap-6">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2"><Settings2 className="h-4 w-4"/> Interface système</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Gérer mon foyer</h1>
              <p className="mt-2 text-zinc-500 font-medium">Inventaire des tâches, paramètres du compte et du foyer partagé.</p>
            </div>
          </div>
        </div>

        {/* Top Row: Information (Profile & Household) */}
        <div className="grid gap-8 mb-8 md:grid-cols-2">
          {/* Household Info */}
          <div className="rounded-[2rem] glass-card p-6 md:p-8 relative overflow-hidden fade-in-up stagger-2">
            <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-50 blur-2xl" />
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Key className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900">Votre Foyer</h3>
                <p className="text-sm font-medium text-zinc-500 mt-1">{profile.households.name}</p>
                <div className="mt-4 rounded-xl border border-zinc-200/60 bg-white/50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Code d'invitation secret</p>
                  <code className="mt-1 block text-xs font-mono text-zinc-600 break-all select-all font-bold">{profile.household_id}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="rounded-[2rem] glass-card p-6 md:p-8 relative overflow-hidden fade-in-up stagger-3">
            <div className="relative z-10 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <User className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-zinc-900">Mon profil</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-bold text-zinc-700">{profile.display_name || 'Anonyme'}</p>
                  <p className="text-sm font-medium text-zinc-500">{user.email}</p>
                </div>
                <form action={async () => {
                  "use server";
                  const supabase = await createClient();
                  await supabase.auth.signOut();
                  redirect("/login");
                }} className="mt-6 border-t border-zinc-100 pt-4">
                  <button className="flex w-full items-center justify-center rounded-xl bg-red-50/50 py-3 text-sm font-bold text-red-600 hover:bg-red-100 transition-colors">
                    <LogOut className="mr-2 h-4 w-4" /> Se déconnecter du foyer
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Manage Chores */}
        <div className="rounded-[2rem] glass-card overflow-hidden fade-in-up stagger-4 relative">
          <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
            <h2 className="text-xl font-bold text-zinc-900">Inventaire des tâches ({chores.length})</h2>
          </div>
          
          <div className="">
            {chores.length === 0 ? (
              <div className="flex flex-col items-center justify-center bg-zinc-50/50 py-16 text-center">
                <Info className="mb-3 h-8 w-8 text-zinc-300" />
                <p className="text-sm font-medium text-zinc-500">Aucune tâche n'a été ajoutée au foyer.</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100/80">
                {chores.map((chore) => (
                  <li key={chore.id} className="p-6 md:p-8 transition-colors hover:bg-zinc-50/30">
                    <div className="flex flex-col gap-6">
                      {/* Top Row: Title + Delete Button */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <div className="text-lg font-black tracking-tight text-zinc-900">{chore.title}</div>
                            {chore.description && <div className="mt-1.5 text-sm font-medium text-zinc-500 line-clamp-2 leading-relaxed">{chore.description}</div>}
                          </div>
                          
                          <form action={async () => {
                            "use server";
                            const { deleteChore } = await import('@/actions/chores');
                            await deleteChore(chore.id);
                          }}>
                            <button type="submit" className="flex h-10 px-4 items-center justify-center rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-500 hover:text-white transition-colors border border-red-100/50 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 whitespace-nowrap" title="Supprimer définitivement">
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </button>
                          </form>
                      </div>

                      {/* Form for Cycle and Notes */}
                      <form action={async (formData) => {
                          "use server";
                          const { updateChoreDetails } = await import('@/actions/chores');
                          await updateChoreDetails(chore.id, formData);
                      }} className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 bg-white border border-zinc-200 shadow-sm px-3 py-2 rounded-lg">Cycle :</span>
                            <div className="flex h-10 items-center rounded-xl bg-white border border-zinc-200/80 p-1 w-24">
                              <input name="frequency_days" type="number" defaultValue={chore.frequency_days} min="1" className="w-full bg-transparent text-center text-sm font-bold text-zinc-700 outline-none" />
                              <span className="text-xs font-bold text-zinc-400 pr-2 pointer-events-none">j</span>
                            </div>
                            <button type="submit" className="flex h-10 items-center rounded-xl bg-zinc-900 px-4 text-xs font-bold text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95">Mettre à jour</button>
                          </div>
                          <input type="text" name="notes" defaultValue={chore.notes || ''} placeholder="Commentaires (ex: Mettre un produit spécial, instructions...)" className="w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-all placeholder:text-zinc-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm" />
                      </form>
                      
                      {/* Sub-steps */}
                      <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-4">
                          <h4 className="text-[10px] font-black text-zinc-400 mb-4 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-3 w-3"/> Check-lists (Sous-étapes)</h4>
                          <div className="space-y-2">
                            {(chore.chore_steps || []).sort((a:any,b:any)=>new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((step: any) => (
                              <div key={step.id} className="flex items-center justify-between bg-white border border-zinc-100 shadow-sm rounded-xl py-2 px-3 group transition-all hover:border-zinc-200">
                                <span className="text-sm font-bold text-zinc-700 flex items-center gap-2"><span className="text-zinc-300">-</span> {step.title}</span>
                                <form action={async () => {
                                  "use server";
                                  const { deleteChoreStep } = await import('@/actions/chores');
                                  await deleteChoreStep(step.id);
                                }}>
                                  <button type="submit" className="text-zinc-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors opacity-100 opacity-60 hover:opacity-100" title="Supprimer l'étape">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </form>
                              </div>
                            ))}
                            <form action={async (formData) => {
                              "use server";
                              const { addChoreStep } = await import('@/actions/chores');
                              await addChoreStep(formData);
                            }} className="flex flex-col sm:flex-row items-center gap-2 mt-2 pt-2 border-t border-zinc-200/50">
                              <input type="hidden" name="chore_id" value={chore.id} />
                              <input required name="title" placeholder="Créer une nouvelle étape (ex: Pliage...)" className="w-full sm:flex-1 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100/50 shadow-sm" />
                              <button type="submit" className="w-full sm:w-auto shrink-0 flex h-10 items-center justify-center rounded-xl px-4 font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors active:scale-95 border border-emerald-100/50">
                                + Ajouter
                              </button>
                            </form>
                          </div>
                      </div>

                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
      </main>
    </div>
  )
}
