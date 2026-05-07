'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Mail, Lock, Eye, EyeOff, ArrowRight, Share, Network, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { loginAction } from '@/lib/backend/actions/auth/login'
import { registerAction } from '@/lib/backend/actions/auth/register'
import { useSearchParams } from 'next/navigation'

export function AuthView({ defaultTab = 'login' }: { defaultTab?: 'login' | 'register' }) {
  const searchParams = useSearchParams()
  const nextPath = searchParams.get('next') ?? '/dashboard'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    
    if (activeTab === 'login') {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      }
    } else {
      const result = await registerAction(formData)
      if (result?.error) {
        setError(result.error)
        setIsPending(false)
      } else if (result?.success) {
        setSuccess(result.message)
        setIsPending(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col relative overflow-hidden font-sans">
      {/* Background glow & Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03]" 
        style={{
          backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1A6CF6]/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Content */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 p-6 lg:p-12 relative z-10">
        
        {/* Left Column (Marketing) */}
        <div className="flex-1 hidden lg:flex flex-col justify-center max-w-2xl">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1A6CF6] to-[#00D4FF] flex items-center justify-center shadow-[0_0_20px_rgba(26,108,246,0.3)]">
              <Database className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FluxSQL</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1E2A45] bg-[#111827]/50 w-fit mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
            <span className="text-xs font-medium text-[#E2E8F0]">Diseña. Visualiza. Optimiza.</span>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Crea diagramas de <br />
            <span className="text-[#1A6CF6]">bases de datos</span> <br />
            de forma profesional
          </h1>

          <p className="text-[#94A3B8] text-lg max-w-md mb-12 leading-relaxed">
            FluxSQL te ayuda a modelar, visualizar y compartir tus bases de datos de manera rápida y eficiente.
          </p>

          {/* Stylized Diagram Illustration */}
          <div className="relative w-full max-w-md h-64 border border-[#1E2A45] rounded-2xl bg-[#0A0F1E]/50 overflow-hidden mb-12">
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.4))' }}>
              <path d="M 120 80 C 180 80, 180 140, 240 140" fill="none" stroke="#00D4FF" strokeWidth="2" />
              <path d="M 120 120 C 160 120, 160 180, 200 180" fill="none" stroke="#1A6CF6" strokeWidth="2" opacity="0.6" />
              <circle cx="240" cy="140" r="4" fill="#00D4FF" />
              <circle cx="200" cy="180" r="4" fill="#1A6CF6" />
            </svg>
            
            {/* Table Nodes */}
            <div className="absolute top-8 left-8 w-32 rounded-lg bg-[#111827] border border-[#1E2A45] shadow-lg overflow-hidden">
              <div className="h-6 bg-[#1A6CF6]/20 border-b border-[#1A6CF6]/30 flex items-center px-2">
                <div className="w-12 h-1.5 rounded-full bg-[#1A6CF6]" />
              </div>
              <div className="p-3 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-[#334155]" />
                <div className="w-3/4 h-1.5 rounded-full bg-[#334155]" />
                <div className="w-4/5 h-1.5 rounded-full bg-[#334155]" />
              </div>
            </div>

            <div className="absolute top-24 right-12 w-28 rounded-lg bg-[#111827] border border-[#1E2A45] shadow-lg overflow-hidden opacity-80">
              <div className="h-5 bg-[#334155]/20 border-b border-[#334155]/30 flex items-center px-2">
                <div className="w-10 h-1.5 rounded-full bg-[#64748B]" />
              </div>
              <div className="p-2 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-[#334155]" />
                <div className="w-2/3 h-1.5 rounded-full bg-[#334155]" />
              </div>
            </div>
            
            <div className="absolute bottom-8 left-36 w-32 rounded-lg bg-[#111827] border border-[#1E2A45] shadow-lg overflow-hidden opacity-90">
              <div className="h-5 bg-[#334155]/20 border-b border-[#334155]/30 flex items-center px-2">
                <div className="w-14 h-1.5 rounded-full bg-[#64748B]" />
              </div>
              <div className="p-2 space-y-2">
                <div className="w-full h-1.5 rounded-full bg-[#334155]" />
                <div className="w-5/6 h-1.5 rounded-full bg-[#334155]" />
              </div>
            </div>
          </div>

          {/* Features Bar */}
          <div className="flex items-center gap-8 text-sm font-medium text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-[#1A6CF6]" />
              <span>Modela sin límites</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1A6CF6]" />
              <span>Colabora en tiempo real</span>
            </div>
            <div className="flex items-center gap-2">
              <Share className="w-4 h-4 text-[#1A6CF6]" />
              <span>Exporta y comparte</span>
            </div>
          </div>
        </div>

        {/* Right Column (Form Panel) */}
        <div className="flex-1 w-full max-w-[460px] flex justify-center">
          <div className="w-full bg-[#111827]/80 backdrop-blur-xl border border-[#1E2A45] rounded-[24px] p-8 shadow-2xl">
            
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-[#1E2A45] mb-8 relative">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null); setSuccess(null) }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'login' ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setError(null); setSuccess(null) }}
                className={`flex-1 pb-3 text-sm font-semibold transition-colors ${activeTab === 'register' ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
              >
                Crear cuenta
              </button>
              
              {/* Tab Indicator */}
              <div 
                className="absolute bottom-0 h-0.5 bg-[#1A6CF6] rounded-t-full transition-all duration-300 ease-out"
                style={{ width: '50%', left: activeTab === 'login' ? '0%' : '50%' }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {activeTab === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
                  </h2>
                  <p className="text-[#94A3B8] text-sm">
                    {activeTab === 'login' ? 'Ingresa a tu cuenta para continuar' : 'Comienza a diseñar tus diagramas hoy mismo'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input type="hidden" name="next" value={nextPath} />
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#E2E8F0]">Correo electrónico</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        required 
                        placeholder="ejemplo@correo.com"
                        className="pl-10 bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] text-white h-11 rounded-xl"
                        disabled={isPending}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#E2E8F0]">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                      <Input 
                        id="password" 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        placeholder="••••••••••••"
                        className="pl-10 pr-10 bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] text-white h-11 rounded-xl"
                        disabled={isPending}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-white transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {activeTab === 'login' && (
                      <div className="flex justify-end pt-1">
                        <a href="#" className="text-xs text-[#1A6CF6] hover:text-[#00D4FF] transition-colors">
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="text-red-400 text-sm font-medium text-center bg-red-400/10 py-2 rounded-lg border border-red-400/20">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-emerald-300 text-sm font-medium text-center bg-emerald-400/10 py-2 rounded-lg border border-emerald-400/20">
                      {success}
                    </div>
                  )}

                  {activeTab === 'login' && (
                    <div className="flex items-center space-x-2 pt-1">
                      <Checkbox id="remember" className="border-[#64748B] data-[state=checked]:bg-[#1A6CF6]" />
                      <label
                        htmlFor="remember"
                        className="text-sm font-medium leading-none text-[#94A3B8] peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Recordarme
                      </label>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={isPending}
                    className="w-full bg-[#1A6CF6] hover:bg-[#1A6CF6]/90 text-white h-11 rounded-xl text-base font-semibold mt-2 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isPending 
                      ? (activeTab === 'login' ? 'Iniciando...' : 'Registrando...') 
                      : (activeTab === 'login' ? 'Iniciar sesión' : 'Crear cuenta')
                    }
                    {!isPending && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>

                {/* Social Login */}
                <div className="hidden">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#1E2A45]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#111827] px-3 text-[#64748B]">o continúa con</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Button variant="outline" type="button" className="bg-[#0A0F1E] border-[#1E2A45] text-white hover:bg-[#1E2A45] hover:text-white h-11 rounded-xl">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" className="bg-[#0A0F1E] border-[#1E2A45] text-white hover:bg-[#1E2A45] hover:text-white h-11 rounded-xl">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.699-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm">
                  <span className="text-[#64748B]">
                    {activeTab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setError(null); setSuccess(null) }}
                    className="text-[#1A6CF6] font-medium hover:text-[#00D4FF] transition-colors"
                  >
                    {activeTab === 'login' ? 'Crear cuenta' : 'Iniciar sesión'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Global Footer */}
      <div className="w-full text-center py-6 text-xs text-[#64748B] relative z-10">
        © 2024 FluxSQL. Todos los derechos reservados.
      </div>
    </div>
  )
}
