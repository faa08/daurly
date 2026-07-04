import { useCallback, useEffect, useState } from "react";

const POLL_MS = 4000;

export function useChatPolling<T>(
  chatId: string | null,
  fetchMessages: (id: string) => Promise<T[]>
) {
  const [messages, setMessages] = useState<T[]>([]);

  const refresh = useCallback(async () => {
    if (!chatId) return;
    const msgs = await fetchMessages(chatId);
    setMessages(msgs);
  }, [chatId, fetchMessages]);

  useEffect(() => {
    if (!chatId) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    return () => clearInterval(timer);
  }, [chatId, refresh]);

  return { messages, setMessages, refresh };
}
