export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1e1e1e] text-[#cccccc] font-sans">
      <div className="w-full max-w-md rounded-xl bg-[#252526] p-10 shadow-2xl border border-[#3e3e42]">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-[#007acc] rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg">F</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="mt-2 text-[#858585] text-sm tracking-wide">Join Flowdeck for collaborative coding</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-xs font-bold text-[#858585] uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full rounded-md bg-[#1e1e1e] border border-[#3e3e42] p-3 text-sm text-white focus:border-[#007acc] outline-none transition-all placeholder:text-[#333333]"
              placeholder="John Doe" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#858585] uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full rounded-md bg-[#1e1e1e] border border-[#3e3e42] p-3 text-sm text-white focus:border-[#007acc] outline-none transition-all placeholder:text-[#333333]"
              placeholder="name@company.com" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#858585] uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full rounded-md bg-[#1e1e1e] border border-[#3e3e42] p-3 text-sm text-white focus:border-[#007acc] outline-none transition-all placeholder:text-[#333333]"
              placeholder="••••••••" 
            />
          </div>
          <button className="w-full rounded-md bg-[#007acc] p-3.5 font-bold text-white hover:bg-[#006bb3] transition-all shadow-lg active:scale-95 mt-2">
            Create Account
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-[#858585]">
          Already have an account? <a href="/login" className="text-[#007acc] hover:text-[#006bb3] font-bold transition-colors ml-1">Sign in instead</a>
        </p>
      </div>
    </div>
  )
}