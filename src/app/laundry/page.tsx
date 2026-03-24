import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { Shirt, Plus, ArrowRight, Trash2, Droplets, Wind, FoldHorizontal, AlertCircle } from 'lucide-react'
import { createLaundryMachine, updateLaundryStatus, deleteLaundryMachine } from '@/actions/laundry'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

const STATUS_FLOW = {
  'dirty': {
    label: 'Prêt à lancer',
    next: 'washing',
    nextLabel: 'Démarrer le Lavage',
    icon: Droplets,
    color: 'text-zinc-500',
    bgColor: 'bg-zinc-100',
    barColor: 'bg-zinc-200'
  },
  'washing': {
    label: 'En Lavage',
    next: 'waiting_washer',
    nextLabel: 'Machine terminée',
    icon: Droplets,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    barColor: 'bg-blue-400'
  },
  'waiting_washer': {
    label: 'Dans le Lave-linge',
    next: 'drying',
    nextLabel: 'Passer au Séchage (ou étendre)',
    icon: AlertCircle,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    barColor: 'bg-red-400'
  },
  'drying': {
    label: 'En Séchage',
    next: 'waiting_dryer',
    nextLabel: 'Séchage terminé',
    icon: Wind,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    barColor: 'bg-amber-400'
  },
  'waiting_dryer': {
    label: 'Dans le Sèche-linge',
    next: 'folding',
    nextLabel: 'Sortir pour pliage',
    icon: AlertCircle,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    barColor: 'bg-orange-400'
  },
  'folding': {
    label: 'À Plier & Ranger',
    next: 'done',
    nextLabel: 'Terminer',
    icon: FoldHorizontal,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-100',
    barColor: 'bg-emerald-400'
  }
} as const

// Helper to determine stepper visual logic
const STEPPER_STAGES = ['dirty', 'washing', 'waiting_washer', 'drying', 'waiting_dryer', 'folding']

export default async function LaundryPage() {
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

  const { data: rawMachines } = await supabase
    .from('laundry_machines')
    .select('*')
    .eq('household_id', profile.household_id)
    .order('created_at', { ascending: false })

  const machines = rawMachines || []

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative">
      <Nav />
      <main className="mx-auto max-w-4xl px-4 pt-8 md:px-8 md:pt-32 relative z-10">
        
        {/* Header Section */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] glass-card p-6 md:p-10 fade-in-up stagger-1">
           <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-50 blur-3xl opacity-60" />
           <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
             <div>
               <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2"><Shirt className="h-4 w-4"/> Foyer partagé</p>
               <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Suivi du Linge</h1>
             </div>
           </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
           {/* Add Machine Form */}
           <div className="lg:col-span-1 fade-in-up stagger-2">
             <div className="rounded-[2rem] glass-card p-6 md:p-8 lg:sticky lg:top-24">
               <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2"><Plus className="h-5 w-5"/> Lancer une machine</h2>
               <form action={createLaundryMachine} className="flex flex-col gap-4">
                 <button type="submit" className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95">
                   Lancer une nouvelle machine de linge
                 </button>
               </form>
             </div>
           </div>

           {/* Laundry Machines List */}
           <div className="space-y-6 lg:col-span-2">
             {machines.length === 0 ? (
               <div className="rounded-[2rem] glass-card p-12 text-center fade-in-up stagger-3">
                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-50 border border-zinc-100 mb-4">
                    <Shirt className="h-8 w-8 text-zinc-300" />
                 </div>
                 <h3 className="text-lg font-bold text-zinc-900">Aucune machine en cours</h3>
                 <p className="mt-2 text-sm font-medium text-zinc-500">Ajoutez du linge sale pour commencer le suivi.</p>
               </div>
             ) : (
               machines.map((machine, index) => {
                 const currentStatus = STATUS_FLOW[machine.status as keyof typeof STATUS_FLOW]
                 const Icon = currentStatus.icon
                 const currentIndex = STEPPER_STAGES.indexOf(machine.status)

                 return (
                   <div key={machine.id} className={`rounded-[2rem] glass-card p-6 md:p-8 overflow-hidden fade-in-up stagger-${(index + 3) > 5 ? 5 : (index + 3)} relative group`}>
                      {/* Delete Button (absolute) */}
                      <form action={async () => {
                         "use server"
                         await deleteLaundryMachine(machine.id)
                      }} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="text-zinc-300 hover:text-red-500 transition-colors bg-white/50 rounded-lg p-1.5 backdrop-blur-sm border border-zinc-100">
                           <Trash2 className="h-4 w-4" />
                         </button>
                      </form>

                      {/* Machine Title & Status */}
                      <div className="mb-6 pr-10">
                        <h3 className="text-2xl font-black tracking-tight text-zinc-900">{machine.title}</h3>
                        <div className="mt-2 flex items-center gap-2">
                           <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${currentStatus.bgColor} ${currentStatus.color}`}>
                             <Icon className="h-3 w-3" />
                             {currentStatus.label}
                           </span>
                           <span className="text-[10px] font-bold text-zinc-400 border border-zinc-200 rounded-full px-2 py-1">
                             Màj : {formatDistanceToNow(new Date(machine.updated_at), { locale: fr })}
                           </span>
                        </div>
                      </div>

                      {/* Visual Stepper */}
                      <div className="mb-8 mt-8">
                         <div className="flex justify-between relative">
                            {/* Background Line */}
                            <div className="absolute top-1/2 left-[5%] right-[5%] h-1 -translate-y-1/2 bg-zinc-100 rounded-full z-0" />
                            {/* Active Line */}
                            <div className={`absolute top-1/2 left-[5%] h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-700 ease-out ${currentStatus.barColor}`} style={{ width: `${(currentIndex / (STEPPER_STAGES.length - 1)) * 90}%` }} />
                            
                            {STEPPER_STAGES.map((stage, stepIdx) => {
                               const isActive = stepIdx <= currentIndex
                               const isCurrent = stepIdx === currentIndex
                               return (
                                 <div key={stage} className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-500 ${isActive ? currentStatus.barColor + ' border-transparent shadow-md scale-110' : 'border-zinc-200 bg-white'}`}>
                                    {isActive && <div className="h-2 w-2 rounded-full bg-white" />}
                                 </div>
                               )
                            })}
                         </div>
                      </div>

                      {/* Action Button */}
                      <form action={async () => {
                         "use server"
                         await updateLaundryStatus(machine.id, currentStatus.next)
                      }}>
                         <button className={`w-full flex items-center justify-center rounded-xl px-4 py-4 text-sm font-bold transition-all shadow-sm hover:shadow-lg active:scale-[0.98] ${currentStatus.bgColor} ${currentStatus.color} border border-transparent hover:border-current/10`}>
                           {currentStatus.nextLabel} <ArrowRight className="ml-2 h-4 w-4" />
                         </button>
                      </form>
                   </div>
                 )
               })
             )}
           </div>
        </div>

      </main>
    </div>
  )
}
