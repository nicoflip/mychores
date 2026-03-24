import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { markChoreDone } from '@/actions/chores'
import { Nav } from '@/components/Nav'
import { formatDistanceToNow, addDays, startOfDay, differenceInDays, isToday, isTomorrow, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { CheckCircle2, AlertCircle, Sparkles, CalendarDays, Flame, Calendar as CalendarIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, households(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) {
    return (
      <div className="min-h-[100dvh] bg-zinc-50/50 pb-20 md:pb-0">
        <Nav />
        <main className="mx-auto flex max-w-lg flex-col items-center p-6 pt-12 text-center md:pt-24">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 shadow-inner">
            <Sparkles className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mt-8 text-3xl font-extrabold tracking-tight text-zinc-900">Bienvenue, {profile?.display_name || user.email?.split('@')[0]}</h1>
          <p className="mt-4 leading-relaxed text-zinc-500">
            Pour commencer à gérer vos tâches, vous devez d'abord configurer ou rejoindre un foyer.
          </p>
          <Link href="/setup" className="relative mt-8 inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-blue-500 active:scale-95 sm:w-auto">
            Configurer mon foyer
          </Link>
        </main>
      </div>
    )
  }

  const { data: chores } = await supabase
    .from('chores')
    .select(`
      id, title, description, frequency_days, created_at, notes,
      chore_steps (*),
      chore_logs (
        id, completed_at,
        profiles (display_name, email)
      )
    `)
    .eq('household_id', profile.household_id)

  const now = startOfDay(new Date())

  const processedChores = (chores || []).map((chore: any) => {
    const logs = Array.isArray(chore.chore_logs) ? chore.chore_logs : []
    const sortedLogs = logs.sort((a: any, b: any) => 
      new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )
    
    const lastLog = sortedLogs[0] as any
    const lastDoneDate = lastLog ? startOfDay(new Date(lastLog.completed_at)) : null
    
    let dueDate: Date;
    if (!lastDoneDate) {
      dueDate = now // If never done, it's due today
    } else {
      dueDate = addDays(lastDoneDate, chore.frequency_days)
    }
    
    const daysUntilDue = differenceInDays(dueDate, now) 
    const isOverdue = daysUntilDue < 0
    const isDueToday = daysUntilDue === 0
    
    return {
      ...chore,
      lastLog,
      dueDate,
      daysUntilDue,
      isOverdue,
      isDueToday,
      isUrgent: isOverdue || isDueToday,
    }
  }).sort((a, b) => a.daysUntilDue - b.daysUntilDue)

  // Top 3 priority chores (the ones most overdue or closest to due)
  const top3Chores = processedChores.slice(0, 3)

  // Calendar setup (Next 7 days)
  const calendarDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(now, i)
    const isDateToday = isToday(date)
    
    const choresForDay = processedChores.filter(chore => {
      if (isDateToday) {
        return chore.dueDate <= date // Overdue + Today
      } else {
        return differenceInDays(chore.dueDate, now) === i // Exactly due in i days
      }
    })

    return { date, isToday: isDateToday, chores: choresForDay }
  })

  // Format helper
  const getDayName = (date: Date) => {
    if (isToday(date)) return "Aujourd'hui"
    if (isTomorrow(date)) return "Demain"
    return format(date, 'EEEE', { locale: fr })
  }

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 pt-8 md:px-8 md:pt-32 relative z-10">
        
        {/* Header */}
        <div className="mb-10 flex items-center justify-between fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">Vue d'ensemble</h1>
            <p className="mt-2 text-zinc-500 font-medium">
              Foyer : <strong className="text-zinc-800">{profile.households.name}</strong>
            </p>
          </div>
        </div>

        {processedChores.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200">
              <CalendarDays className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">Aucune tâche active</h2>
            <p className="mt-4 max-w-sm leading-relaxed text-zinc-500">Ajoutez des tâches pour voir votre planning se remplir.</p>
            <Link href="/add" className="mt-8 inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-zinc-800 active:scale-95">
              Ajouter une tâche
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* Top 3 Priorities */}
            <section className="fade-in-up stagger-1">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 shadow-inner">
                  <Flame className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Top 3 Priorités</h2>
              </div>
              
              <div className="grid gap-5 md:grid-cols-3">
                {top3Chores.map(chore => (
                  <div key={chore.id} className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] glass-card p-6 ${chore.isUrgent ? 'border-orange-200/80 shadow-orange-100/30' : ''}`}>
                    {chore.isUrgent && (
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-400 to-red-500" />
                    )}
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-xl font-bold tracking-tight ${chore.isUrgent ? 'text-zinc-900' : 'text-zinc-700'}`}>{chore.title}</h3>
                        {chore.isOverdue && (
                          <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-red-700">En retard</span>
                        )}
                        {!chore.isOverdue && chore.isDueToday && (
                          <span className="shrink-0 rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-orange-700">Aujourd'hui</span>
                        )}
                      </div>
                      <p className="mt-4 text-sm font-medium text-zinc-500">
                        {chore.daysUntilDue < 0 ? (
                          <span className="text-red-500 flex items-center gap-1.5"><AlertCircle className="h-4 w-4" /> Dépassé de {Math.abs(chore.daysUntilDue)}j</span>
                        ) : chore.daysUntilDue === 0 ? (
                          <span className="text-orange-600 font-bold">À faire aujourd'hui</span>
                        ) : (
                          <span className="text-blue-600">Prévu dans {chore.daysUntilDue} jour(s)</span>
                        )}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100">
                      <form action={async (formData) => {
                        "use server";
                        const { updateChoreDetails } = await import('@/actions/chores');
                        formData.append('frequency_days', chore.frequency_days.toString());
                        await updateChoreDetails(chore.id, formData);
                      }} className="flex items-center gap-2">
                        <input name="notes" defaultValue={chore.notes || ''} placeholder="Aucune note..." className="flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 focus:border-blue-200 focus:bg-white focus:outline-none" />
                        <button type="submit" className="text-[10px] uppercase font-bold text-zinc-400 hover:text-blue-600">Save</button>
                      </form>
                    </div>
                    
                    {chore.chore_steps && chore.chore_steps.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {chore.chore_steps.sort((a:any,b:any)=>new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).map((step: any) => (
                          <div key={step.id} className="flex items-center gap-3">
                            <form action={async () => {
                              "use server";
                              const { toggleChoreStep } = await import('@/actions/chores');
                              await toggleChoreStep(step.id, !step.is_done);
                            }}>
                              <button className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${step.is_done ? 'bg-blue-500 text-white' : 'bg-zinc-100 text-transparent border border-zinc-300'}`}>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              </button>
                            </form>
                            <span className={`text-sm font-medium ${step.is_done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{step.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <form action={async () => {
                      'use server'
                      await markChoreDone(chore.id)
                    }} className="mt-8">
                      <button className={`flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${chore.isUrgent ? 'bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-900 hover:text-white'}`}>
                        <CheckCircle2 className="mr-2 h-5 w-5 opacity-80" />
                        Terminer maintenant
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            </section>

            {/* Calendar View */}
            <section className="relative fade-in-up stagger-2">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-inner">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900">Prévisions sur 7 jours</h2>
              </div>
              
              <div className="flex overflow-x-auto pb-6 snap-x snap-mandatory gap-4 md:grid md:grid-cols-7 md:gap-4 scrollbar-hide">
                {calendarDays.map((day, idx) => (
                  <div key={idx} className={`snap-center flex-shrink-0 w-72 md:w-auto h-full flex flex-col rounded-3xl border overflow-hidden ${day.isToday ? 'border-blue-200 shadow-blue-100/50 shadow-lg ring-1 ring-blue-100' : 'border-zinc-200/50 bg-white/50'}`}>
                    
                    {/* Day Header */}
                    <div className={`p-4 text-center border-b ${day.isToday ? 'bg-blue-500 text-white' : 'bg-zinc-50 border-zinc-100'}`}>
                      <div className={`text-xs font-bold uppercase tracking-wider ${day.isToday ? 'text-blue-100' : 'text-zinc-400'}`}>
                        {getDayName(day.date)}
                      </div>
                      <div className={`mt-1 text-2xl font-black ${day.isToday ? 'text-white' : 'text-zinc-700'}`}>
                        {format(day.date, 'd', { locale: fr })}
                      </div>
                    </div>

                    {/* Day Chores List */}
                    <div className="flex-1 bg-white p-3 space-y-3">
                      {day.chores.length === 0 ? (
                        <div className="flex h-full min-h-[120px] flex-col items-center justify-center text-center">
                          <CheckCircle2 className={`h-8 w-8 mb-2 ${day.isToday ? 'text-green-500/30' : 'text-zinc-200'}`} />
                          <span className="text-xs font-semibold text-zinc-400">Rien de prévu</span>
                        </div>
                      ) : (
                        day.chores.map((chore: any) => (
                          <div key={chore.id} className={`rounded-2xl p-3 border ${chore.isUrgent && day.isToday ? 'border-orange-200 bg-orange-50' : 'border-zinc-100 bg-zinc-50'}`}>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className={`text-sm font-bold leading-tight ${chore.isUrgent && day.isToday ? 'text-orange-900' : 'text-zinc-800'}`}>{chore.title}</h4>
                              <form action={async () => {
                                'use server'
                                await markChoreDone(chore.id)
                              }}>
                                <button className="transition-transform hover:scale-110 active:scale-90" title="Marquer comme fait">
                                  <div className={`flex h-6 w-6 items-center justify-center rounded-full ${chore.isUrgent && day.isToday ? 'bg-orange-200 text-orange-700 hover:bg-orange-500 hover:text-white' : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  </div>
                                </button>
                              </form>
                            </div>
                            
                            {(!chore.isUrgent && day.isToday === false && chore.lastLog) && (
                              <p className="mt-2 text-[10px] font-medium text-zinc-400 leading-tight">
                                Dernier: {chore.lastLog.profiles?.display_name || 'Inconnu'} ({formatDistanceToNow(new Date(chore.lastLog.completed_at), { locale: fr })})
                              </p>
                            )}
                            
                            {chore.isUrgent && day.isToday && (
                              <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                                {chore.daysUntilDue < 0 ? `En retard de ${Math.abs(chore.daysUntilDue)}j` : 'À faire aujourd\'hui'}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    
                  </div>
                ))}
              </div>
            </section>
            
          </div>
        )}
      </main>
      
      {/* Hide Scrollbar CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
