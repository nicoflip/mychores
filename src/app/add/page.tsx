import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createChore } from '@/actions/chores'
import { Nav } from '@/components/Nav'
import { Plus, Sparkles, Wand2 } from 'lucide-react'

export const dynamic = 'force-dynamic'

const PREDEFINED_CHORES = [
  { title: "Aspirateur", description: "Aspirer sols et tapis dans tout le foyer", frequency_days: 5, icon: "🧹" },
  { title: "Linge", description: "Lancer une machine de lessive, étendre ou plier", frequency_days: 4, icon: "🧺" },
  { title: "Nettoyer SDB", description: "Laver les toilettes, la douche et le lavabo", frequency_days: 7, icon: "🛁" },
  { title: "Litière chat", description: "Vider, nettoyer et changer la litière", frequency_days: 7, icon: "🐈" },
  { title: "Changer Draps", description: "Laver et remplacer le linge de lit", frequency_days: 14, icon: "🛏️" },
  { title: "Poussières", description: "Dépoussiérer les meubles et étagères", frequency_days: 14, icon: "🧽" },
  { title: "Grand ménage frigo", description: "Jeter les périmés et laver les surfaces", frequency_days: 30, icon: "❄️" }
]

export default async function AddChorePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('household_id').eq('id', user.id).single()
  if (!profile?.household_id) redirect('/dashboard')

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative">
      <Nav />
      <main className="mx-auto mt-8 max-w-4xl px-4 md:mt-32 md:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] glass-card p-6 md:p-10 fade-in-up stagger-1">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50 blur-3xl opacity-60 flex" />
          <div className="relative z-10 flex flex-col justify-between md:flex-row md:items-end gap-6">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2"><Wand2 className="h-4 w-4"/> Catalogue des tâches</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Ajouter une tâche</h1>
              <p className="mt-2 text-zinc-500 font-medium">Créez de nouvelles tâches pour enrichir l'emploi du temps de votre foyer.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          
          {/* Custom Chore Form */}
          <div className="rounded-[2rem] glass-card p-6 md:p-8 fade-in-up stagger-2 lg:sticky lg:top-24">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Nouvelle tâche</h2>
                <p className="text-sm font-medium text-zinc-500">Une récurrence sur-mesure</p>
              </div>
            </div>
            
            <form action={async (formData) => { "use server"; await import('@/actions/chores').then(m => m.createChore(formData)); }} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-zinc-700">Titre de la tâche</label>
                <input
                  id="title"
                  name="title"
                  required
                  className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                  placeholder="Ex: Passer l'aspirateur"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-semibold text-zinc-700">Description détaillée <span className="font-normal text-zinc-400">(optionnel)</span></label>
                <input
                  id="description"
                  name="description"
                  className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                  placeholder="Détails, produits à utiliser..."
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="frequency_days" className="text-sm font-semibold text-zinc-700">Fréquence cible</label>
                <div className="flex items-center gap-4">
                  <div className="relative flex flex-1 items-center">
                    <input
                      id="frequency_days"
                      name="frequency_days"
                      type="number"
                      min="1"
                      defaultValue="7"
                      required
                      className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm text-zinc-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
                    />
                    <span className="absolute right-4 text-sm font-medium text-zinc-400 pointer-events-none">Jours</span>
                  </div>
                  <div className="flex-1 text-sm text-zinc-500 leading-tight">
                    Cette tâche reviendra <br className="hidden sm:block"/>à faire après ce délai.
                  </div>
                </div>
              </div>
              <button className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95">
                Créer la tâche
              </button>
            </form>
          </div>

          {/* Quick Suggestions */}
          <div className="rounded-[2rem] glass-card p-6 md:p-8 overflow-hidden fade-in-up stagger-3">
            <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Suggestions rapides</h2>
                <p className="text-sm font-medium text-zinc-500">Ajoutez les classiques d'un clic</p>
              </div>
            </div>

            <div className="grid gap-3">
              {PREDEFINED_CHORES.map((chore, idx) => (
                <div key={idx} className="group flex items-center justify-between rounded-2xl border border-zinc-100 p-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/50 bg-white/50 shadow-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-2xl shadow-sm transition-transform group-hover:scale-110">
                      {chore.icon}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-900 leading-tight" title={chore.title}>{chore.title}</div>
                      <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mt-1 border border-zinc-200 rounded-md inline-block px-1.5 py-0.5">Tous les {chore.frequency_days}j</div>
                    </div>
                  </div>
                  <form action={async () => {
                    "use server";
                    const formData = new FormData();
                    formData.append('title', chore.title);
                    formData.append('description', chore.description);
                    formData.append('frequency_days', chore.frequency_days.toString());
                    await createChore(formData);
                  }}>
                    <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm transition-colors hover:bg-indigo-600 hover:text-white active:scale-90" title="Ajouter cette tâche">
                      <Plus className="h-5 w-5" />
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
          
        </div>

      </main>
    </div>
  )
}
