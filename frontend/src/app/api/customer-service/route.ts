import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { CUSTOMER_SERVICE_SYSTEM_PROMPT } from "@/data/customerServiceKnowledge";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function mapApiError(err: unknown, isGroq: boolean): string {
  const e = err as { status?: number; message?: string };
  const status = e?.status;
  const msg = e?.message || "";

  if (status === 401 || status === 403 || msg.includes("API key") || msg.includes("invalid") || msg.includes("Unauthorized")) {
    return isGroq
      ? "API key Groq tidak valid. Periksa GROQ_API_KEY di .env.local lalu restart server."
      : "API key Gemini tidak valid. Periksa GEMINI_API_KEY di .env.local lalu restart server.";
  }
  if (status === 429 || msg.includes("quota") || msg.includes("limit") || msg.includes("RESOURCE_EXHAUSTED")) {
    return isGroq
      ? "Kuota/Limit panggilan API Groq terlampaui. Tunggu sesaat dan coba lagi."
      : "Kuota Gemini habis untuk sementara. Tunggu ~1 menit lalu coba lagi.";
  }
  return `Gagal menghubungi AI (${isGroq ? "Groq" : "Gemini"}). Coba lagi sebentar.`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const groqKey = process.env.GROQ_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();

  if (!groqKey && !geminiKey) {
    return NextResponse.json(
      { error: "Customer Service AI belum dikonfigurasi. Tambahkan GROQ_API_KEY atau GEMINI_API_KEY di .env.local" },
      { status: 503 }
    );
  }

  const isGroq = !!groqKey;

  try {
    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];

    if (!messages.length || messages[messages.length - 1]?.role !== "user") {
      return NextResponse.json({ error: "Pesan tidak valid" }, { status: 400 });
    }

    if (isGroq) {
      const modelName = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      
      const groqMessages = [
        { role: "system", content: CUSTOMER_SERVICE_SYSTEM_PROMPT },
        ...messages.map((msg) => ({
          role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
          content: msg.text,
        })),
      ];

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: groqMessages,
        }),
      });

      const groqData = await groqRes.json();
      if (!groqRes.ok) {
        throw {
          status: groqRes.status,
          message: groqData.error?.message || "Groq API error",
        };
      }

      const reply =
        groqData.choices?.[0]?.message?.content?.trim() ||
        "Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi.";

      return NextResponse.json({ reply });
    } else {
      const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const genAI = new GoogleGenerativeAI(geminiKey!);
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: CUSTOMER_SERVICE_SYSTEM_PROMPT,
      });

      const history = messages.slice(0, -1).map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.text }],
      }));

      const lastUserText = messages[messages.length - 1].text;
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUserText);
      const reply =
        result.response
          .text()
          ?.trim() ||
        "Maaf, saya tidak dapat memproses permintaan Anda saat ini. Silakan coba lagi.";

      return NextResponse.json({ reply });
    }
  } catch (err) {
    console.error("Customer service API error:", err);
    return NextResponse.json({ error: mapApiError(err, isGroq) }, { status: 502 });
  }
}
