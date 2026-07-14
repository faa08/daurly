import { getChatReceiptStatus, type ChatReceiptFields } from "@/lib/chatReadReceipts";

export default function ChatReadReceipt({
  message,
  onLight = false,
}: {
  message: ChatReceiptFields;
  /** Pesan di bubble berwarna gelap (mis. biru/oranye) */
  onLight?: boolean;
}) {
  const status = getChatReceiptStatus(message);

  const gray = onLight ? "rgba(255,255,255,0.75)" : "#9CA3AF";
  const blue = onLight ? "#BFDBFE" : "#4ADE80";
  const color = status === "read" ? blue : gray;

  if (status === "sent") {
    return (
      <span
        className="material-symbols-outlined leading-none select-none"
        style={{ fontSize: 14, color, fontVariationSettings: "'FILL' 0, 'wght' 600" }}
        title="Terkirim"
        aria-label="Terkirim"
      >
        done
      </span>
    );
  }

  return (
    <span
      className="material-symbols-outlined leading-none select-none"
      style={{ fontSize: 14, color, fontVariationSettings: "'FILL' 0, 'wght' 600" }}
      title={status === "read" ? "Dibaca" : "Terkirim"}
      aria-label={status === "read" ? "Dibaca" : "Terkirim"}
    >
      done_all
    </span>
  );
}
