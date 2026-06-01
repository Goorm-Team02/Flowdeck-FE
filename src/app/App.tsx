// src/app/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  // AuthProvider가 상위인 AppProviders 내부에 이미 선언되어 있으므로 여기서는 라우터만 출력합니다.
  return <RouterProvider router={router} />;
}