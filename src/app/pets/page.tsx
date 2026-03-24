import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Nav } from '@/components/Nav'
import {
  createPet, deletePet, updatePet, createTreatment,
  administerTreatment, deleteTreatment, refillTreatment
} from '@/actions/pets'
import {
  PawPrint, Plus, Trash2, Heart, Cake, Pill,
  AlertTriangle, CheckCircle2, Syringe, RefreshCw, Pencil, X, Check
} from 'lucide-react'
import { differenceInDays, differenceInYears, format, addYears, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export const dynamic = 'force-dynamic'

// ─── 10 most common cat coat colors & patterns ───────────────────────────────
const COLOR_PALETTE = [
  {
    key: 'tabby-brown',
    label: 'Tabby Marron',
    desc: 'La plus répandue au monde',
    from: '#92400e', to: '#78350f',
    css: 'bg-gradient-to-br from-amber-800 to-yellow-900',
    dot: 'bg-amber-800',
  },
  {
    key: 'ginger',
    label: 'Roux / Gingembre',
    desc: 'Souvent mâle (génétique X)',
    from: '#ea580c', to: '#c2410c',
    css: 'bg-gradient-to-br from-orange-600 to-orange-800',
    dot: 'bg-orange-600',
  },
  {
    key: 'black',
    label: 'Noir',
    desc: 'Uni, sans marquages',
    from: '#18181b', to: '#09090b',
    css: 'bg-gradient-to-br from-zinc-800 to-zinc-950',
    dot: 'bg-zinc-900',
  },
  {
    key: 'white',
    label: 'Blanc',
    desc: 'Entièrement immaculé',
    from: '#d4d4d8', to: '#a1a1aa',
    css: 'bg-gradient-to-br from-zinc-200 to-zinc-400',
    dot: 'bg-zinc-300',
  },
  {
    key: 'grey-blue',
    label: 'Gris / Bleu',
    desc: 'Dilution du noir',
    from: '#6b7280', to: '#4b5563',
    css: 'bg-gradient-to-br from-gray-500 to-gray-700',
    dot: 'bg-gray-500',
  },
  {
    key: 'tortoiseshell',
    label: 'Écaille de tortue',
    desc: 'Mélange roux & noir, surtout femelles',
    from: '#b45309', to: '#1c1917',
    css: 'bg-gradient-to-br from-amber-700 to-stone-900',
    dot: 'bg-amber-700',
  },
  {
    key: 'calico',
    label: 'Calico (Tricolor)',
    desc: 'Blanc, noir & orange, quasi toujours femelles',
    from: '#f97316', to: '#0f172a',
    css: 'bg-gradient-to-br from-orange-500 via-white to-zinc-900',
    dot: 'bg-orange-500',
  },
  {
    key: 'tuxedo',
    label: 'Tuxedo (Bicolore)',
    desc: 'Noir et blanc, dos noir, poitrail blanc',
    from: '#18181b', to: '#e4e4e7',
    css: 'bg-gradient-to-br from-zinc-900 to-zinc-200',
    dot: 'bg-zinc-800',
  },
  {
    key: 'colorpoint',
    label: 'Colorpoint',
    desc: 'Corps clair, extrémités foncées (type Siamois)',
    from: '#d97706', to: '#f5f5f4',
    css: 'bg-gradient-to-br from-amber-600 to-stone-100',
    dot: 'bg-amber-600',
  },
  {
    key: 'tabby-grey',
    label: 'Tabby Gris',
    desc: 'Rayures grises sur fond argenté',
    from: '#9ca3af', to: '#4b5563',
    css: 'bg-gradient-to-br from-gray-400 to-gray-600',
    dot: 'bg-gray-400',
  },
]

function getColor(key: string) {
  return COLOR_PALETTE.find(c => c.key === key) || COLOR_PALETTE[0]
}

function getNextBirthday(birthday: string): { daysUntil: number; nextDate: Date } {
  const today = startOfDay(new Date())
  const birth = new Date(birthday)
  let next = new Date(today.getFullYear(), birth.getMonth(), birth.getDate())
  if (next < today) next = addYears(next, 1)
  return { daysUntil: differenceInDays(next, today), nextDate: next }
}

// Color swatch picker (reusable markup)
function ColorSwatches({ name = 'emoji', defaultValue = 'tabby-brown' }: { name?: string; defaultValue?: string }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {COLOR_PALETTE.map((c) => (
        <label key={c.key} className="cursor-pointer group" title={c.label}>
          <input
            type="radio"
            name={name}
            value={c.key}
            defaultChecked={c.key === defaultValue}
            className="sr-only peer"
          />
          <div
            className={`h-9 w-full rounded-xl shadow-sm ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-zinc-900 transition-all hover:scale-105 ${c.css}`}
          />
          <p className="mt-1 text-center text-[9px] font-bold text-zinc-400 leading-tight truncate peer-checked:text-zinc-700">{c.label}</p>
        </label>
      ))}
    </div>
  )
}

export default async function PetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*, households(*)').eq('id', user.id).single()

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

          {/* ──── LEFT: Forms ──── */}
          <div className="lg:col-span-1 space-y-6 fade-in-up stagger-2">
            
            {/* Add Pet */}
            <div className="rounded-[2rem] glass-card p-6 md:p-8 lg:sticky lg:top-24">
              <h2 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                <Heart className="h-4 w-4 text-rose-400" /> Ajouter un animal
              </h2>
              <form action={async (formData) => { "use server"; await createPet(formData) }} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-600">Prénom</label>
                  <input
                    name="name"
                    required
                    placeholder="Ex: Luna"
                    className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600">Robe / Couleur</label>
                  <ColorSwatches name="emoji" defaultValue="tabby-brown" />
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
              <div className="rounded-[2rem] glass-card p-6 md:p-8">
                <h2 className="text-lg font-bold text-zinc-900 mb-5 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-indigo-400" /> Ajouter un traitement
                </h2>
                <form action={async (formData) => { "use server"; await createTreatment(formData) }} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-600">Animal</label>
                    <select name="pet_id" required className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm">
                      {pets.map((pet: any) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-600">Nom du traitement</label>
                    <input name="name" required placeholder="Ex: Antipuces, Vermifuge..."
                      className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600">Fréquence (j)</label>
                      <input name="frequency_days" type="number" min="1" defaultValue="30"
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-zinc-600">Doses restantes</label>
                      <input name="doses_remaining" type="number" min="0" defaultValue="1"
                        className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm" />
                    </div>
                  </div>
                  <button className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95">
                    <Plus className="mr-2 h-4 w-4" /> Ajouter le traitement
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ──── RIGHT: Pets list ──── */}
          <div className="space-y-6 lg:col-span-2">
            {pets.length === 0 ? (
              <div className="rounded-[2rem] glass-card p-14 text-center fade-in-up stagger-3">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-4xl shadow-inner">🐱</div>
                <h3 className="text-xl font-bold text-zinc-900">Aucun animal</h3>
                <p className="mt-2 text-sm font-medium text-zinc-500">Ajoutez votre premier animal avec le formulaire.</p>
              </div>
            ) : (
              pets.map((pet: any, index: number) => {
                const col = getColor(pet.emoji)
                const treatments = (pet.pet_treatments || []).sort((a: any, b: any) =>
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
                const birthdayInfo = pet.birthday ? getNextBirthday(pet.birthday) : null
                const ageYears = pet.birthday ? differenceInYears(new Date(), new Date(pet.birthday)) : null
                const isBirthdaySoon = birthdayInfo && birthdayInfo.daysUntil <= 7
                const initial = pet.name.charAt(0).toUpperCase()
                const birthdayForInput = pet.birthday ? pet.birthday.split('T')[0] : ''

                return (
                  <div key={pet.id} className={`rounded-[2rem] glass-card overflow-hidden fade-in-up stagger-${Math.min(index + 3, 6)} relative`}>
                    
                    {/* Accent top bar */}
                    <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${col.from}, ${col.to})` }} />

                    {/* ── VIEW MODE ── */}
                    <details className="group/card">
                      <summary className="list-none">
                        <div className="p-5 md:p-7 cursor-default">
                          <div className="flex items-start gap-4">
                            {/* Color Avatar */}
                            <div
                              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white shadow-lg ${col.css}`}
                              style={{ boxShadow: `0 8px 20px -4px ${col.from}50` }}
                            >
                              {initial}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h2 className="text-2xl font-black tracking-tight text-zinc-900 truncate">{pet.name}</h2>
                              <p className="text-xs font-medium text-zinc-400 mt-0.5">{col.label}</p>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                {ageYears !== null && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-600">
                                    <Heart className="h-3 w-3 text-rose-400" />
                                    {ageYears} an{ageYears > 1 ? 's' : ''}
                                  </span>
                                )}
                                {birthdayInfo && (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                    isBirthdaySoon ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'
                                  } ${birthdayInfo.daysUntil === 0 ? 'animate-pulse' : ''}`}>
                                    <Cake className="h-3 w-3" />
                                    {birthdayInfo.daysUntil === 0 ? '🎉 Joyeux anniversaire !'
                                      : birthdayInfo.daysUntil === 1 ? '🎂 Demain !'
                                      : `🎂 Dans ${birthdayInfo.daysUntil}j`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Edit toggle */}
                              <label htmlFor={`edit-${pet.id}`} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 hover:bg-blue-50 hover:text-blue-500 transition-colors border border-zinc-100">
                                <Pencil className="h-4 w-4" />
                              </label>
                              {/* Delete */}
                              <form action={async () => { "use server"; await deletePet(pet.id) }}>
                                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 transition-colors border border-zinc-100">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </form>
                            </div>
                          </div>
                        </div>
                      </summary>

                      {/* ── EDIT PANEL (collapsible via checkbox hack) ── */}
                      <input type="checkbox" id={`edit-${pet.id}`} className="sr-only peer/edit" />
                      <div className="hidden peer-checked/edit:block border-t border-blue-100 bg-blue-50/40 px-5 md:px-7 py-5">
                        <form action={async (formData) => { "use server"; await updatePet(formData) }} className="space-y-4">
                          <input type="hidden" name="pet_id" value={pet.id} />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-600">Prénom</label>
                              <input name="name" defaultValue={pet.name} required
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm" />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-zinc-600 flex items-center gap-1"><Cake className="h-3 w-3" /> Anniversaire</label>
                              <input name="birthday" type="date" defaultValue={birthdayForInput}
                                className="flex h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-semibold text-zinc-600">Robe / Couleur</label>
                            <div className="grid grid-cols-5 gap-2">
                              {COLOR_PALETTE.map((c) => (
                                <label key={c.key} className="cursor-pointer" title={c.label}>
                                  <input type="radio" name="emoji" value={c.key} defaultChecked={c.key === pet.emoji} className="sr-only peer" />
                                  <div className={`h-9 w-full rounded-xl shadow-sm ring-2 ring-transparent peer-checked:ring-offset-2 peer-checked:ring-zinc-900 transition-all hover:scale-105 ${c.css}`} />
                                  <p className="mt-1 text-center text-[9px] font-bold text-zinc-400 leading-tight truncate">{c.label}</p>
                                </label>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" className="flex flex-1 items-center justify-center rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shadow-sm">
                              <Check className="mr-2 h-4 w-4" /> Enregistrer
                            </button>
                            <label htmlFor={`edit-${pet.id}`} className="flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-500 hover:bg-zinc-50 cursor-pointer transition-all">
                              <X className="h-4 w-4" />
                            </label>
                          </div>
                        </form>
                      </div>
                    </details>

                    {/* Treatments */}
                    <div className="border-t border-zinc-100 bg-zinc-50/30 px-5 md:px-7 py-5">
                      <h3 className="mb-4 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5" style={{ color: col.from }}>
                        <Syringe className="h-3.5 w-3.5" /> Traitements ({treatments.length})
                      </h3>

                      {treatments.length === 0 ? (
                        <p className="text-sm font-medium text-zinc-400 text-center py-3">Aucun traitement configuré.</p>
                      ) : (
                        <div className="space-y-3">
                          {treatments.map((t: any) => {
                            const isLow = t.doses_remaining <= 2
                            const isEmpty = t.doses_remaining === 0
                            const daysSinceLast = t.last_given_at ? differenceInDays(new Date(), new Date(t.last_given_at)) : null
                            const isDue = daysSinceLast !== null && daysSinceLast >= t.frequency_days

                            return (
                              <div key={t.id} className={`rounded-2xl border p-4 ${
                                isEmpty ? 'border-red-200 bg-red-50/60' : isLow ? 'border-amber-200 bg-amber-50/60' : 'border-zinc-100 bg-white/70'
                              }`}>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <span className="font-bold text-zinc-900">{t.name}</span>
                                  {isEmpty && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase text-red-600"><AlertTriangle className="h-3 w-3" /> Vide</span>}
                                  {!isEmpty && isLow && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase text-amber-600"><AlertTriangle className="h-3 w-3" /> Stock faible</span>}
                                  {isDue && !isEmpty && <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-600">À donner</span>}
                                </div>
                                <div className="flex flex-wrap gap-3 text-xs font-medium text-zinc-500 mb-3">
                                  <span>Tous les {t.frequency_days}j</span>
                                  <span className={`font-bold ${isEmpty ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-zinc-700'}`}>
                                    {t.doses_remaining} dose{t.doses_remaining !== 1 ? 's' : ''} restante{t.doses_remaining !== 1 ? 's' : ''}
                                  </span>
                                  {daysSinceLast !== null && <span>Donné il y a {daysSinceLast}j</span>}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <form action={async () => { "use server"; await administerTreatment(t.id, t.doses_remaining) }}>
                                    <button disabled={isEmpty} className={`flex h-9 items-center justify-center rounded-xl px-3 text-xs font-bold transition-all active:scale-95 ${isEmpty ? 'cursor-not-allowed bg-zinc-100 text-zinc-300' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm'}`}>
                                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Donner
                                    </button>
                                  </form>
                                  <form action={async (fd) => { "use server"; const d = parseInt(fd.get('refill_doses') as string, 10); if (d > 0) await refillTreatment(t.id, d) }} className="flex items-center gap-1.5">
                                    <input name="refill_doses" type="number" min="1" defaultValue="6"
                                      className="w-14 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-center text-xs font-bold text-zinc-700 focus:outline-none" />
                                    <button type="submit" className="flex h-9 items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors">
                                      <RefreshCw className="h-3.5 w-3.5" /> Remplir
                                    </button>
                                  </form>
                                  <form action={async () => { "use server"; await deleteTreatment(t.id) }} className="ml-auto">
                                    <button className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 hover:bg-red-50 hover:text-red-400 transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </form>
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
