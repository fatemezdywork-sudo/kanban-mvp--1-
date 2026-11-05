"use client";
import dynamic from "next/dynamic";
const Board = dynamic(() => import("../components/Board"), {
  ssr: false,
  loading: () => <div className="loading">در حال آماده‌سازی تخته…</div>,
});
export default function Page() {
  return <Board />;
}
