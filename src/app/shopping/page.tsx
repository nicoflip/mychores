import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { ShoppingCart, Plus, CheckCircle2, Circle, Trash2, ListChecks } from 'lucide-react'
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem } from '@/actions/shopping'

export const dynamic = 'force-dynamic'

export default async function ShoppingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, households(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) {
    redirect('/dashboard')
  }

  // Fetch shopping list...
  const { data: items } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('household_id', profile.household_id)
    .order('created_at', { ascending: true })

  const safeItems = items || []
  const activeItems = safeItems.filter(i => !i.is_purchased)
  const purchasedItems = safeItems.filter(i => i.is_purchased)

  return (
    <div className="min-h-[100dvh] bg-zinc-50/50 pb-32 md:pb-12">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 pt-8 md:px-8 md:pt-32 relative z-10">
        
        {/* Header Section */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] glass-card p-6 md:p-10 fade-in-up stagger-1">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-50 blur-3xl opacity-60" />
          
          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2"><ShoppingCart className="h-4 w-4"/> Foyer partagé</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Liste de courses</h1>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Add Item Form */}
          <div className="lg:col-span-1 fade-in-up stagger-2">
            <div className="rounded-[2rem] glass-card p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Ajouter un produit</h2>
              <form action={async (formData) => {
                "use server";
                await addShoppingItem(formData)
              }} className="flex flex-col gap-4">
                <input
                  name="item_name"
                  required
                  placeholder="Ex: Lait d'avoine, œufs..."
                  className="flex h-12 w-full rounded-xl border border-zinc-300 bg-zinc-50/50 px-4 py-2 text-sm transition-all focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button type="submit" className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-500 active:scale-95">
                  <Plus className="mr-2 h-4 w-4" /> Ajouter
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            
            <div className="rounded-[2rem] glass-card p-6 overflow-hidden fade-in-up stagger-3">
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <ListChecks className="text-zinc-400 h-5 w-5" /> À acheter ({activeItems.length})
              </h3>
              {activeItems.length === 0 ? (
                <p className="text-sm font-medium text-zinc-400 py-4 text-center">La liste est vide.</p>
              ) : (
                <ul className="space-y-2">
                  {activeItems.map((item: any) => (
                    <li key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50/50 p-4 transition-all hover:bg-zinc-50 hover:shadow-sm group">
                      <div className="flex items-center gap-3">
                        <form action={async () => { "use server"; await toggleShoppingItem(item.id, true) }}>
                          <button className="text-zinc-300 hover:text-emerald-500 transition-colors">
                            <Circle className="h-6 w-6" />
                          </button>
                        </form>
                        <span className="font-bold text-zinc-800">{item.item_name}</span>
                      </div>
                      <form action={async () => { "use server"; await deleteShoppingItem(item.id) }}>
                        <button className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {purchasedItems.length > 0 && (
              <div className="rounded-[2rem] border border-zinc-200/60 bg-white/50 p-6 shadow-sm overflow-hidden">
                <h3 className="text-lg font-bold text-zinc-400 mb-4">Dans le caddie ({purchasedItems.length})</h3>
                <ul className="space-y-2">
                  {purchasedItems.map((item: any) => (
                    <li key={item.id} className="flex items-center justify-between rounded-2xl border border-zinc-100/50 bg-zinc-50/30 p-3 opacity-60 transition-all hover:opacity-100 group">
                      <div className="flex items-center gap-3">
                        <form action={async () => { "use server"; await toggleShoppingItem(item.id, false) }}>
                          <button className="text-emerald-500 hover:text-emerald-600 transition-colors">
                            <CheckCircle2 className="h-5 w-5" />
                          </button>
                        </form>
                        <span className="font-medium text-zinc-500 line-through">{item.item_name}</span>
                      </div>
                      <form action={async () => { "use server"; await deleteShoppingItem(item.id) }}>
                        <button className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>
        </div>

      </main>
    </div>
  )
}
