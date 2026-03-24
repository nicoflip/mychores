import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import {
  createPet, deletePet, createTreatment,
  administerTreatment, deleteTreatment, refillTreatment
} from '@/actions/pets'
import {
  PawPrint, Plus, Trash2, Heart, Cake, Pill,
  AlertTriangle, CheckCircle2, Syringe, RefreshCw
} from 'lucide-react'
import { differenceInDays, differenceInYears, format, addYears, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

function getNextBirthday(birthday: string): { daysUntil: number; nextDate: Date } {
  const today = startOfDay(new Date())
  const birth = new Date(birthday)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = addYears(next, 1)
  return { daysUntil: differenceInDays(next, today), nextDate: next }
}

export default async function PetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, households(*)')
    .eq('id', user.id)
    .single()

  if (!profile?.household_id) redirect('/dashboard')

  const { data: petsRaw } = await supabase
    .from('pets')
    .select('*, pet_treatments(*)')
    .eq('household_id', profile.household_id)
    .order('created_at', { ascending: true })

  const pets = petsRaw || []

  return (
    <div className="min-h-[100dvh] pb-32 md:pb-12 relative">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 pt-8 md:px-8 md:pt-32 relative z-10">

        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] glass-card p-6 md:p-10 fade-in-up stagger-1">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-rose-50 blur-3xl opacity-60" />
          <div className="relative z-10">
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
              <PawPrint className="h-4 w-4" /> Foyer partagé
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">Mes Animaux</h1>
            <p className="mt-2 text-zinc-500 font-medium">Traitements, anniversaires et suivi de vos compagnons.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* === LEFT COLUMN: Add Pet Form === */}
          <div className="lg:col-span-1 fade-in-up stagger-2">
            <div className="rounded-[2rem] glass-card p-6 md:p-8 lg:sticky lg:top-24 space-y-6">
              
              {/* Add Pet */}
              <div>
                <h2 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-rose-400" /> Ajouter un animal
                </h2>
                <form action={async (formData) => { "use server"; await createPet(formData) }} className="space-y-4">
                  <div className="flex gap-3">
                    <div className="space-y-1.5 w-20">
                      <label className="text-xs font-semibold text-zinc-600">Emoji</label>
                      <input
                        name="emoji"
                        defaultValue="🐱"
                        maxLength={2}
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-3 text-center text-2xl focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="text-xs font-semibold text-zinc-600">Prénom</label>
                      <input
                        name="name"
                        required
                        placeholder="Ex: Luna"
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
                      <Cake className="h-3.5 w-3.5" /> Anniversaire <span className="font-normal text-zinc-400">(optionnel)</span>
                    </label>
                    <input
                      name="birthday"
                      type="date"
                      className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm"
                    />
                  </div>
                  <button className="flex w-full items-center justify-center rounded-xl bg-rose-500 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-400/20 transition-all hover:bg-rose-400 active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter l'animal
                  </button>
                </form>
              </div>

              {/* Add Treatment */}
              {pets.length > 0 && (
                <div className="border-t border-zinc-100 pt-6">
                  <h2 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                    <Pill className="h-5 w-5 text-indigo-400" /> Ajouter un traitement
                  </h2>
                  <form action={async (formData) => { "use server"; await createTreatment(formData) }} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600">Animal</label>
                      <select
                        name="pet_id"
                        required
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
                      >
                        {pets.map((pet: any) => (
                          <option key={pet.id} value={pet.id}>{pet.emoji} {pet.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600">Nom du traitement</label>
                      <input
                        name="name"
                        required
                        placeholder="Ex: Antipuces, Vermifuge..."
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-600">Fréquence (jours)</label>
                        <input
                          name="frequency_days"
                          type="number"
                          min="1"
                          defaultValue="30"
                          className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-600">Doses restantes</label>
                        <input
                          name="doses_remaining"
                          type="number"
                          min="0"
                          defaultValue="1"
                          className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
                        />
                      </div>
                    </div>
                    <button className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95">
                      <Plus className="mr-2 h-4 w-4" /> Ajouter le traitement
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* === RIGHT COLUMN: Pets List === */}
          <div className="space-y-6 lg:col-span-2">
            {pets.length === 0 ? (
              <div className="rounded-[2rem] glass-card p-14 text-center fade-in-up stagger-3">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-4xl shadow-inner">
                  🐱
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Aucun animal</h3>
                <p className="mt-2 text-sm font-medium text-zinc-500">Ajoutez votre premier animal avec le formulaire.</p>
              </div>
            ) : (
              pets.map((pet: any, index: number) => {
                const treatments = (pet.pet_treatments || []).sort((a: any, b: any) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )

                const birthdayInfo = pet.birthday ? getNextBirthday(pet.birthday) : null
                const ageYears = pet.birthday ? differenceInYears(new Date(), new Date(pet.birthday)) : null
                const isBirthdaySoon = birthdayInfo && birthdayInfo.daysUntil <= 7

                return (
                  <div key={pet.id} className={`rounded-[2rem] glass-card overflow-hidden fade-in-up stagger-${Math.min(index + 3, 6)} relative group`}>
                    
                    {/* Pet Header */}
                    <div className={`p-6 md:p-8 ${isBirthdaySoon ? 'bg-gradient-to-r from-amber-50/80 to-transparent' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-md ring-1 ring-zinc-100">
                            {pet.emoji}
                          </div>
                          <div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{pet.name}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {ageYears !== null && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                                  <Heart className="h-3 w-3 text-rose-400" />
                                  {ageYears} an{ageYears > 1 ? 's' : ''}
                                </span>
                              )}
                              {birthdayInfo && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                  isBirthdaySoon
                                    ? 'bg-amber-100 text-amber-700 animate-pulse'
                                    : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                  <Cake className="h-3 w-3" />
                                  {birthdayInfo.daysUntil === 0
                                    ? '🎉 C\'est son anniversaire !'
                                    : birthdayInfo.daysUntil === 1
                                    ? 'Anniversaire demain !'
                                    : `Anniversaire dans ${birthdayInfo.daysUntil}j (${format(birthdayInfo.nextDate, 'd MMM', { locale: fr })})`
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete pet */}
                        <form action={async () => { "use server"; await deletePet(pet.id) }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors border border-zinc-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Treatments */}
                    <div className="border-t border-zinc-100 px-6 md:px-8 py-5 bg-zinc-50/30">
                      <h3 className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-1.5">
                        <Syringe className="h-3.5 w-3.5" /> Traitements
                      </h3>

                      {treatments.length === 0 ? (
                        <p className="text-sm font-medium text-zinc-400 text-center py-3">
                          Aucun traitement. Ajoutez-en un depuis le formulaire.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {treatments.map((t: any) => {
                            const isLow = t.doses_remaining <= 2
                            const isEmpty = t.doses_remaining === 0
                            const daysSinceLast = t.last_given_at
                              ? differenceInDays(new Date(), new Date(t.last_given_at))
                              : null
                            const isDue = daysSinceLast !== null && daysSinceLast >= t.frequency_days

                            return (
                              <div key={t.id} className={`rounded-2xl border p-4 transition-colors ${
                                isEmpty ? 'border-red-200 bg-red-50/50'
                                : isLow ? 'border-amber-200 bg-amber-50/50'
                                : 'border-zinc-100 bg-white/60'
                              }`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                      <span className="font-bold text-zinc-900 truncate">{t.name}</span>
                                      {isEmpty && (
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-600">
                                          <AlertTriangle className="h-3 w-3" /> Stock vide
                                        </span>
                                      )}
                                      {!isEmpty && isLow && (
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-600">
                                          <AlertTriangle className="h-3 w-3" /> Stock faible
                                        </span>
                                      )}
                                      {isDue && !isEmpty && (
                                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-600">
                                          À donner
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap gap-3 text-xs font-medium text-zinc-500">
                                      <span>Tous les {t.frequency_days}j</span>
                                      <span className={`font-bold ${isEmpty ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-zinc-700'}`}>
                                        {t.doses_remaining} dose{t.doses_remaining !== 1 ? 's' : ''} restante{t.doses_remaining !== 1 ? 's' : ''}
                                      </span>
                                      {t.last_given_at && (
                                        <span>Donné il y a {daysSinceLast}j</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {/* Refill */}
                                    <form action={async (fd) => {
                                      "use server"
                                      const doses = parseInt(fd.get('refill_doses') as string, 10)
                                      if (doses > 0) await refillTreatment(t.id, doses)
                                    }} className="flex items-center gap-1">
                                      <input
                                        name="refill_doses"
                                        type="number"
                                        min="1"
                                        defaultValue="6"
                                        className="w-12 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-xs font-bold text-zinc-700 focus:outline-none"
                                      />
                                      <button type="submit" title="Réapprovisionner" className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 hover:bg-emerald-100 hover:text-emerald-600 transition-colors">
                                        <RefreshCw className="h-3.5 w-3.5" />
                                      </button>
                                    </form>

                                    {/* Administer */}
                                    <form action={async () => {
                                      "use server"
                                      await administerTreatment(t.id, t.doses_remaining)
                                    }}>
                                      <button
                                        disabled={isEmpty}
                                        className={`flex h-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition-all active:scale-95 ${
                                          isEmpty
                                            ? 'cursor-not-allowed bg-zinc-100 text-zinc-300'
                                            : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-200'
                                        }`}
                                      >
                                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                                        Donner
                                      </button>
                                    </form>

                                    {/* Delete treatment */}
                                    <form action={async () => { "use server"; await deleteTreatment(t.id) }}>
                                      <button className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 hover:bg-red-50 hover:text-red-400 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

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
