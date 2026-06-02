// src/app/routes/SignupPage.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/features/auth/api/customApi";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const res = await authService.signup({ email, name, password });
      setSuccess(res.message || "성공적으로 회원 가입이 완료되었습니다!");
      
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "회원 가입에 실패하였습니다. 비밀번호 강도(8자 이상) 및 글자 수 조건을 확인해 주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signup_page_container" className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans p-4">
      <div id="signup_card" className="w-full max-w-md rounded-xl bg-zinc-900 p-8 shadow-2xl border border-zinc-800">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-indigo-600/20">F</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Flowdeck 계정 생성</h1>
          <p className="mt-2 text-zinc-400 text-sm tracking-wide">실시간 개발 협업 플랫폼의 일원이 되어보세요</p>
        </div>

        {error && (
          <div id="signup_error" className="mb-6 p-4 rounded-md bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div id="signup_success" className="mb-6 p-4 rounded-md bg-green-950/40 border border-green-900/50 text-green-400 text-xs font-semibold">
            {success} 로그인 화면으로 이동 중...
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">이름 (실명)</label>
            <input 
              id="signup_name_input"
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="홍길동" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">이메일 주소</label>
            <input 
              id="signup_email_input"
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="yourname@domain.com" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">비밀번호</label>
            <input 
              id="signup_password_input"
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-zinc-600"
              placeholder="••••••••" 
            />
          </div>

          <button 
            id="signup_submit_btn"
            type="submit"
            disabled={isLoading || !!success}
            className="w-full rounded-md bg-indigo-600 p-3.5 font-bold text-white hover:bg-indigo-500 transition-all shadow-lg active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
          >
            {isLoading ? "가입 승인 중..." : "새 계정 만들기"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-400">
          이미 Flowdeck 계정이 있으신가요? 
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1">
            로그인하기
          </Link>
        </p>
      </div>
    </div>
  );
}