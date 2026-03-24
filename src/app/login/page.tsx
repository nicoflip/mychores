import { login, signup } from './actions'
import { CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; view?: 'signup' | 'login' }>
}) {
  const resolveSearchParams = await searchParams
  const isSignup = resolveSearchParams.view === 'signup'
  
  return (
    <div className="relative flex min-h-[100dvh] w-full overflow-hidden bg-slate-50 font-sans">
      {/* Decorative gradient background elements */}
      <div className="absolute -left-[10%] -top-[10%] h-[50%] w-[50%] rounded-full bg-blue-600/30 blur-[120px]" />
      <div className="absolute -bottom-[10%] -right-[10%] h-[50%] w-[50%] rounded-full bg-indigo-600/30 blur-[120px]" />
      
      <div className="relative flex w-full flex-col shadow-2xl lg:flex-row">
        
        {/* Left column - Branding & Value Prop */}
        <div className="hidden flex-col justify-between border-r border-zinc-200/50 bg-white/40 p-16 backdrop-blur-3xl lg:flex lg:w-1/2">
          <div className="flex flex-col gap-6 fade-in-up">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900">ChoresSync</span>
            </div>

            <div className="max-w-md mt-10">
              <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl">
                Votre foyer, <br/>
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">parfaitement synchronisé.</span>
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-zinc-600 font-medium">
                Gérez les requêtes du foyer sans friction. Suivez qui a fait quoi, organisez vos récurrences et ne laissez plus jamais la charge s'accumuler.
              </p>
            </div>
          </div>

          <div className="text-sm font-bold text-zinc-400">
            © 2026 ChoresSync. Tous droits réservés.
          </div>
        </div>

        {/* Right column - Auth Form */}
        <div className="flex flex-1 items-center justify-center p-8 sm:p-12 lg:p-16">
      {/* Login Card */}
      <div className="w-full max-w-md rounded-[2.5rem] glass-card p-8 sm:p-12 relative z-10 mx-4 fade-in-up stagger-1">
            {/* Header */}
            <div className="mb-8 border-b border-zinc-100 pb-6">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                {isSignup ? "Créer un compte" : "Bon retour"}
              </h2>
              <p className="mt-2 text-sm font-medium text-zinc-500">
                {isSignup ? "Rejoignez ChoresSync en quelques secondes." : "Saisissez vos identifiants pour accéder à votre espace."}
              </p>
            </div>

            {resolveSearchParams.error && (
              <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
                {resolveSearchParams.error}
              </div>
            )}

            <form className="space-y-5">
              {isSignup && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-bold text-zinc-700">Votre nom</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={isSignup}
                    className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                    placeholder="Ex: Alex"
                  />
                </div>
              )}
              
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-bold text-zinc-700">Adresse email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                  placeholder="votre@email.com"
                />
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="password" className="text-sm font-bold text-zinc-700">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="flex h-12 w-full rounded-xl border border-zinc-200/80 bg-white px-4 py-2 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex flex-col gap-3 pt-6">
                <button
                  formAction={isSignup ? async (formData) => { "use server"; await signup(formData); } : async (formData) => { "use server"; await login(formData); }}
                  className="group relative flex h-12 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:bg-blue-500 hover:shadow-[0_0_40px_-5px_rgba(37,99,235,0.6)] focus:outline-none"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isSignup ? "S'inscrire" : "Se connecter"}
                  </span>
                </button>
                
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/90 px-4 font-bold rounded-full text-zinc-500 border border-zinc-100">
                      {isSignup ? "Déjà un compte ?" : "Nouveau ici ?"}
                    </span>
                  </div>
                </div>

                <Link
                  href={isSignup ? "/login?view=login" : "/login?view=signup"}
                  className="flex h-12 items-center justify-center rounded-xl border border-zinc-200/80 bg-white text-sm font-bold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 focus:outline-none active:scale-[0.98]"
                >
                  {isSignup ? "Me connecter" : "Créer un compte"}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
