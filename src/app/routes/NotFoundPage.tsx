import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950 items-center justify-center p-6 text-zinc-100 font-sans">
      <div className="max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center shadow-xl">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
        <h2 className="text-xl font-bold text-white mb-2">원하시는 경로를 찾을 수 없습니다</h2>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          요청하신 주소 또는 채널 맵핑 타겟이 올바르지 않거나 변경되어 서버 링크를 소환할 수 없습니다.
        </p>
        <Link 
          to="/" 
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all inline-block shadow-lg shadow-indigo-600/15"
        >
          원격 작업공간 홈으로 이동
        </Link>
      </div>
    </div>
  );
}
