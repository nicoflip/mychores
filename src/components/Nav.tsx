import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Home, ShoppingCart, Shirt, PlusCircle, Settings2 } from 'lucide-react'

export async function Nav() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      {/* Desktop Floating Pill Nav */}
      <div className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center w-full px-4 items-center pointer-events-none">
        <nav className="pointer-events-auto flex h-16 w-full max-w-5xl items-center justify-between rounded-[2rem] border border-white/60 bg-white/70 px-6 sm:px-8 shadow-[0_8px_40px_-5px_rgb(0,0,0,0.08)] backdrop-blur-2xl transition-all">
          <Link href="/dashboard" className="flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group">
             <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
               <Home className="h-5 w-5" />
             </div>
             <span className="text-xl font-black tracking-tighter text-zinc-900">ChoresSync</span>
          </Link>
          
          {user ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="group flex items-center gap-2 text-sm font-bold text-zinc-600 transition-colors hover:text-blue-600">
                <Home className="h-4 w-4 transition-transform group-hover:scale-110" /> Accueil
              </Link>
              <Link href="/shopping" className="group flex items-center gap-2 text-sm font-bold text-zinc-600 transition-colors hover:text-blue-600">
                <ShoppingCart className="h-4 w-4 transition-transform group-hover:scale-110" /> Courses
              </Link>
              <Link href="/laundry" className="group flex items-center gap-2 text-sm font-bold text-zinc-600 transition-colors hover:text-blue-600">
                <Shirt className="h-4 w-4 transition-transform group-hover:scale-110" /> Linge
              </Link>
              <div className="w-px h-6 bg-zinc-200/80 mx-2" />
              <Link href="/add" className="group flex items-center gap-2 text-sm font-bold text-zinc-600 transition-colors hover:text-blue-600">
                <PlusCircle className="h-4 w-4 transition-transform group-hover:scale-110" /> Ajouter
              </Link>
              <Link href="/manage" className="group flex items-center gap-2 text-sm font-bold text-zinc-600 transition-colors hover:text-blue-600">
                <Settings2 className="h-4 w-4 transition-transform group-hover:scale-110" /> Gérer
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-zinc-900 transition-colors hover:text-blue-600">
                Connexion
              </Link>
            </div>
          )}
        </nav>
      </div>

      {user && (
        <div className="fixed bottom-6 left-5 right-5 z-50 flex h-[4.5rem] items-center justify-around rounded-[2rem] border border-white/60 bg-white/85 px-2 shadow-[0_20px_50px_-5px_rgb(0,0,0,0.15)] backdrop-blur-3xl md:hidden">
           <Link href="/dashboard" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-blue-600 active:text-blue-600 transition-colors">
             <Home className="h-6 w-6 stroke-[2.5]" />
             <span className="text-[9px] font-black tracking-widest uppercase">Accueil</span>
           </Link>
           <Link href="/shopping" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-blue-600 active:text-blue-600 transition-colors">
             <ShoppingCart className="h-6 w-6 stroke-[2.5]" />
             <span className="text-[9px] font-black tracking-widest uppercase">Courses</span>
           </Link>
           <Link href="/add" className="relative -top-6 flex flex-col items-center gap-1 text-zinc-500 hover:text-blue-600 active:text-blue-600 group">
             <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_10px_20px_rgb(37,99,235,0.4)] group-hover:scale-105 group-active:scale-95 transition-all border-4 border-white/50">
               <PlusCircle className="h-7 w-7 stroke-[2]" />
             </div>
             <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 drop-shadow-sm">Nouveau</span>
           </Link>
           <Link href="/laundry" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-blue-600 active:text-blue-600 transition-colors">
             <Shirt className="h-6 w-6 stroke-[2.5]" />
             <span className="text-[9px] font-black tracking-widest uppercase">Linge</span>
           </Link>
           <Link href="/manage" className="flex flex-col items-center gap-1 p-2 text-zinc-400 hover:text-blue-600 active:text-blue-600 transition-colors">
             <Settings2 className="h-6 w-6 stroke-[2.5]" />
             <span className="text-[9px] font-black tracking-widest uppercase">Gérer</span>
           </Link>
        </div>
      )}
    </>
  )
}
