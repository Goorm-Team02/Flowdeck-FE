export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary font-sans">
      <div className="w-full max-w-md rounded-xl bg-bg-secondary p-10 shadow-2xl border border-border">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-accent rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">F</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-text-muted text-sm tracking-wide">Join Flowdeck for collaborative coding</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full rounded-md bg-bg-primary border border-border p-3 text-sm text-white focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-bg-tertiary"
              placeholder="John Doe" 
            />
          </div>
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
          <button className="w-full rounded-md bg-accent p-3.5 font-bold text-white hover:bg-accent-hover transition-all shadow-lg active:scale-95 transform mt-2">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-text-muted">
          Already have an account? <a href="/login" className="text-accent hover:text-accent-hover font-bold transition-colors ml-1">Sign in instead</a>
        </p>
      </div>
    </div>
  )
}
