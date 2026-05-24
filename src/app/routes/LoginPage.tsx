export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary font-sans">
      <div className="w-full max-w-md rounded-xl bg-bg-secondary p-10 shadow-2xl border border-border">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">F</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-text-muted text-sm tracking-wide">Enter your credentials to access Flowdeck</p>
        </div>
        
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="••••••••" 
            />
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-white transition-colors font-medium">
              <input type="checkbox" className="rounded border-border bg-bg-primary text-accent focus:ring-accent accent-accent" />
              Remember me
            </label>
            <a href="#" className="text-accent hover:text-accent-hover font-bold tracking-tight">Forgot password?</a>
          </div>

          <button className="w-full rounded-md bg-accent p-3.5 font-bold text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95 transform">
            Sign In
          </button>
        </form>
        
        <div className="mt-8 flex items-center gap-4 text-text-muted text-xs font-bold uppercase tracking-widest before:content-[''] before:flex-1 before:h-[1px] before:bg-border after:content-[''] after:flex-1 after:h-[1px] after:bg-border">
          OR
        </div>

        <p className="mt-8 text-center text-sm text-text-muted">
          New to Flowdeck? <a href="/signup" className="text-accent hover:text-accent-hover font-bold transition-colors ml-1">Create an account</a>
        </p>
      </div>
    </div>
  )
}
