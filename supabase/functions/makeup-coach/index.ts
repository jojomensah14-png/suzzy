// deno-lint-ignore-file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://id-preview--a01209dc-1008-4f6d-a54e-cd6213dcda8f.lovable.app",
  "http://localhost:8080",
  "http://localhost:5173",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const SYSTEM_PROMPT = `You are Suzzy — a warm, stylish, confident AI makeup bestie.

STYLE RULES (follow strictly):
- Keep answers SHORT: 1–3 sentences max. Never write essays.
- Never repeat or paraphrase what the user just said.
- Never over-explain. Get straight to the point.
- Sound like a chic best friend texting, not a teacher lecturing.
- Use natural flair: "yesss babe!", "okay gorgeous!", "slay!", "love that for you!" — but don't overdo it.
- Be warm, supportive, slightly flirty. Never judge.
- If you don't know something, say so cutely and move on.

EXPERTISE:
- Foundation, concealer, contouring, highlighting for dark skin tones
- Eye makeup, brow shaping, lip looks — bold and nude shades for melanin-rich skin
- Blush and bronzer placement on darker complexions
- Color theory and undertone matching (warm, cool, neutral for deep skin)
- Skincare for oily and acne-prone skin
- Date night and special occasion looks
- Self-confidence and feeling gorgeous

CAMERA CONTEXT (when provided):
- Face too close → "Back up a tiny bit babe, I need to see all that beauty!"
- Bad lighting → "The lighting's not giving… can you shift a little?"
- Blending needed → "Blend blend blend — small circles, you got this!"

INTRO: "Heyyy gorgeous! I'm Suzzy, your beauty bestie 💋 What look are we creating today?"`;

// Simple validation helpers
function validateMessages(messages: unknown): { valid: boolean; data?: Array<{ role: string; content: string }> } {
  if (!Array.isArray(messages)) return { valid: false };
  if (messages.length < 1 || messages.length > 20) return { valid: false };
  
  for (const msg of messages) {
    if (typeof msg !== "object" || msg === null) return { valid: false };
    if (msg.role !== "user" && msg.role !== "assistant") return { valid: false };
    if (typeof msg.content !== "string") return { valid: false };
    if (msg.content.length < 1 || msg.content.length > 2000) return { valid: false };
  }
  
  return { valid: true, data: messages as Array<{ role: string; content: string }> };
}

function validateFaceContext(ctx: unknown): { valid: boolean; data?: Record<string, unknown> } {
  if (ctx === undefined || ctx === null) return { valid: true, data: undefined };
  if (typeof ctx !== "object") return { valid: false };
  // Allow face context but limit its serialized size
  const serialized = JSON.stringify(ctx);
  if (serialized.length > 1000) return { valid: false };
  return { valid: true, data: ctx as Record<string, unknown> };
}

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // --- Authentication ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Input Validation ---
    const body = await req.json();

    const messagesResult = validateMessages(body.messages);
    if (!messagesResult.valid) {
      return new Response(
        JSON.stringify({ error: "Invalid messages: must be 1-20 messages, each with role (user/assistant) and content (1-2000 chars)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const faceContextResult = validateFaceContext(body.faceContext);
    if (!faceContextResult.valid) {
      return new Response(
        JSON.stringify({ error: "Invalid face context data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messages = messagesResult.data!;
    const faceContext = faceContextResult.data;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system message
    let systemContent = SYSTEM_PROMPT;
    if (faceContext) {
      systemContent += `\n\nCurrent face context from camera:\n${JSON.stringify(faceContext)}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Take a breather and try again in a moment! 💅" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue your glam session!" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("makeup-coach error:", e);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
