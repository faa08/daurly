"use client";

import Link from "next/link";
import { formatDraftTime } from "@/lib/adminDrafts";

export default function DraftResumeBanner({
  href,
  label,
  savedAt,
  onDiscard,
}: {
  href: string;
  label: string;
  savedAt?: number;
  onDiscard?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F0FDF4] border border-[#BFDBFE] rounded-xl">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[#16A34A] text-xl mt-0.5">edit_note</span>
        <div>
          <p className="text-sm font-bold text-[#1F1B18]">Lanjut edit</p>
          <p className="text-xs text-[#5C5550] mt-0.5">
            Ada draft {label} yang tersimpan otomatis
            {savedAt ? ` · ${formatDraftTime(savedAt)}` : ""}.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            className="px-3 py-2 text-xs font-bold text-[#5C5550] hover:bg-white rounded-lg border border-[#D5CFC9] transition"
          >
            Hapus draft
          </button>
        )}
        <Link
          href={href}
          className="px-4 py-2 bg-[#16A34A] text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition"
        >
          Lanjutkan
        </Link>
      </div>
    </div>
  );
}
