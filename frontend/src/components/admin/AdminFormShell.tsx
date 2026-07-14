"use client";

import Link from "next/link";
import { formatDraftTime } from "@/lib/adminDrafts";

export default function AdminFormShell({
  title,
  subtitle,
  backHref,
  backLabel = "Kembali",
  onBack,
  draftSavedAt,
  children,
}: {
  title: string;
  subtitle?: string;
  backHref: string;
  backLabel?: string;
  onBack?: () => void;
  draftSavedAt?: number | null;
  children: React.ReactNode;
}) {
  const backClass =
    "inline-flex items-center gap-1.5 text-xs font-bold text-[#5C5550] hover:text-[#16A34A] w-fit transition";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        {onBack ? (
          <button type="button" onClick={onBack} className={backClass}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {backLabel}
          </button>
        ) : (
          <Link href={backHref} className={backClass}>
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            {backLabel}
          </Link>
        )}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-headline text-2xl font-bold text-[#1F1B18]">{title}</h2>
            {subtitle && <p className="text-sm text-[#5C5550] mt-1">{subtitle}</p>}
          </div>
          {draftSavedAt ? (
            <p className="text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              Draft tersimpan · {formatDraftTime(draftSavedAt)}
            </p>
          ) : null}
        </div>
      </div>
      <div className="bg-white border border-[#EAE5E0] rounded-xl shadow-sm overflow-hidden">
        {children}
      </div>
    </div>
  );
}
