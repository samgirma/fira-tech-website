import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err: any) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden relative bg-[#f8fafc]">
      {/* Left Illustration Section */}
      <section className="hidden lg:flex lg:w-[46%] xl:w-[48%] flex-col justify-between p-8 xl:p-12 relative bg-[#fbfcfe]"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 102, 255, 0.08) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
        }}
      >
        {/* Top Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 block leading-tight">
              Fira<span className="text-brand-500">.</span>
            </span>
            <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">Tech Solutions</span>
          </div>
        </div>

        {/* Workspace Illustration */}
        <div className="my-auto flex flex-col items-center justify-center relative py-12 px-6">
          <div className="w-full max-w-lg aspect-[4/3] relative flex items-center justify-center">
            <svg className="w-full h-full drop-shadow-sm select-none" fill="none" viewBox="0 0 600 450" xmlns="http://www.w3.org/2000/svg">
              {/* Background Board */}
              <rect fill="#F1F5F9" height="260" opacity="0.8" rx="14" width="280" x="130" y="80" />
              <circle cx="160" cy="110" fill="#3B82F6" fillOpacity="0.2" r="16" />
              <circle cx="160" cy="110" fill="#0066FF" r="8" />
              <circle cx="340" cy="70" fill="#E2E8F0" r="14" />
              <path d="M340 64V70L345 74" stroke="#94A3B8" strokeLinecap="round" strokeWidth="2" />

              {/* Data Grid Lines */}
              <path d="M140 150H200 M140 165H220 M140 180H190 M140 195H230 M140 210H180" stroke="#CBD5E1" strokeDasharray="1 6" strokeLinecap="round" strokeWidth="3.5" />

              {/* Floating UI Screen */}
              <g filter="drop-shadow(0 12px 24px rgba(0, 102, 255, 0.12))">
                <rect fill="#60A5FA" height="135" rx="10" width="220" x="230" y="125" />
                <rect fill="#2563EB" fillOpacity="0.85" height="135" rx="10" width="220" x="230" y="125" />
                <rect fill="#EFF6FF" fillOpacity="0.95" height="98" rx="6" width="160" x="260" y="145" />
                <text fill="#1E40AF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="9" fontWeight="700" textAnchor="middle" x="340" y="162">Sign In</text>
                <rect fill="#FFFFFF" height="13" rx="3" stroke="#BFDBFE" strokeWidth="1" width="130" x="275" y="172" />
                <rect fill="#FFFFFF" height="13" rx="3" stroke="#BFDBFE" strokeWidth="1" width="130" x="275" y="190" />
                <rect fill="#0066FF" height="15" rx="4" width="130" x="275" y="210" />
                <text fill="#FFFFFF" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="8" fontWeight="600" textAnchor="middle" x="340" y="221">Login</text>
              </g>

              {/* Bookshelf */}
              <rect fill="#F8FAFC" height="75" rx="4" stroke="#E2E8F0" strokeWidth="2" width="140" x="255" y="280" />
              <rect fill="#0066FF" height="42" rx="1.5" width="7" x="270" y="292" />
              <rect fill="#38BDF8" height="38" rx="1.5" width="7" x="281" y="296" />
              <rect fill="#2563EB" height="44" rx="1.5" width="7" x="292" y="290" />
              <rect fill="#93C5FD" height="40" rx="1.5" width="7" x="303" y="294" />
              <rect fill="#1D4ED8" height="36" rx="1.5" width="7" x="314" y="298" />

              {/* Plant */}
              <path d="M400 325H430L426 350H404L400 325Z" fill="#334155" />
              <path d="M415 325C415 315 410 295 422 290C428 305 423 318 415 325Z" fill="#0284C7" />
              <path d="M414 315C405 310 398 298 408 294C414 302 414 310 414 315Z" fill="#38BDF8" />

              {/* Desk */}
              <rect fill="#0066FF" height="8" rx="3" width="190" x="150" y="278" />
              <rect fill="#64748B" height="68" width="6" x="215" y="286" />
              <rect fill="#334155" height="6" rx="3" width="76" x="180" y="352" />

              {/* Monitor */}
              <rect fill="#64748B" height="34" rx="3" width="46" x="235" y="240" />
              <rect fill="#94A3B8" height="28" rx="2" width="40" x="238" y="243" />
              <rect fill="#475569" height="6" width="4" x="256" y="274" />

              {/* Chair */}
              <path d="M140 270C140 262 146 256 154 256H168V285H140V270Z" fill="#0066FF" />
              <rect fill="#0052CC" height="8" rx="4" width="48" x="150" y="282" />
              <rect fill="#334155" height="62" width="6" x="171" y="290" />
              <path d="M150 352H198L194 358H154L150 352Z" fill="#1E293B" />
              <circle cx="152" cy="360" fill="#0F172A" r="3.5" />
              <circle cx="196" cy="360" fill="#0F172A" r="3.5" />
              <circle cx="174" cy="360" fill="#0F172A" r="3.5" />

              {/* Developer Character */}
              <path d="M168 250L186 250L205 282L178 282Z" fill="#1E293B" />
              <path d="M182 250V272" stroke="#FFFFFF" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M180 282L228 316L246 348H234L216 322L178 296V282H180Z" fill="#60A5FA" />
              <path d="M244 348H260C260 352 255 356 248 356H240L244 348Z" fill="#0F172A" />
              <path d="M226 348H238C238 352 234 356 228 356H224L226 348Z" fill="#0F172A" />
              <path d="M186 262L220 276L238 276" stroke="#1E293B" strokeLinecap="round" strokeLinejoin="round" strokeWidth="6" />
              <circle cx="240" cy="276" fill="#78350F" r="3.5" />
              <circle cx="186" cy="232" fill="#78350F" r="10" />
              <path d="M178 226C180 219 188 218 194 220C198 221 200 226 198 230C196 230 193 226 186 226C182 226 180 228 178 226Z" fill="#0F172A" />
            </svg>
          </div>
          <div className="mt-4 text-center max-w-sm">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Enterprise Cloud Infrastructure</h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Continuous delivery, automated security operations, and unified management across all Fira Tech systems.
            </p>
          </div>
        </div>

        {/* Left Footer */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <p>© 2025 Fira Tech Solutions.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Support</a>
          </div>
        </div>
      </section>

      {/* Right Blue Section with Login Card */}
      <section className="flex-1 bg-brand-500 min-h-screen relative flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-12 lg:rounded-l-[44px] shadow-2xl overflow-hidden">
        {/* Decorative Concentric Circles */}
        <div className="absolute -bottom-32 -right-32 w-[520px] h-[520px] pointer-events-none select-none opacity-40 z-0">
          <svg className="w-full h-full stroke-white" fill="none" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
            <circle cx="450" cy="450" r="160" strokeWidth="2" />
            <circle cx="450" cy="450" r="260" strokeWidth="2" />
            <circle cx="450" cy="450" r="360" strokeWidth="2" />
            <circle cx="450" cy="450" r="460" strokeDasharray="8 8" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="absolute -top-40 -right-20 w-96 h-96 pointer-events-none select-none opacity-20 z-0">
          <div className="w-full h-full rounded-full border-[36px] border-white/40" />
        </div>

        {/* Floating Login Card */}
        <div className="w-full max-w-[440px] bg-white rounded-[28px] p-8 sm:p-10 relative z-10 border border-white/60"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 50, 150, 0.18), 0 10px 20px -5px rgba(0, 0, 0, 0.04)' }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-extrabold text-lg text-slate-900">Fira Command</span>
          </div>

          {/* Greeting Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Hello!</h1>
            <p className="text-slate-700 font-medium text-base sm:text-lg">Sign in to Fira Command</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                required
                autoComplete="email"
                className="block w-full pl-12 pr-5 py-3.5 sm:py-4 rounded-full border border-slate-200 text-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white hover:border-slate-300"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="block w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-full border border-slate-200 text-slate-800 text-sm sm:text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-white hover:border-slate-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1 pb-2 text-xs sm:text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500" />
                <span className="ml-2">Remember me</span>
              </label>
              <button type="button" className="font-medium text-slate-500 hover:text-brand-600 transition-colors">
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-full bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white font-semibold text-base shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs sm:text-sm text-slate-500">
              Fira Tech Solutions — Founder Command Center
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
