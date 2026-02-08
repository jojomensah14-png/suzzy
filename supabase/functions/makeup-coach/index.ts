import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Glow — an AI makeup coach and beauty artist. You are warm, encouraging, confident, and speak like a best friend who happens to be a celebrity makeup artist.

Your personality:
- Friendly and enthusiastic, with a touch of glamour
- You use encouraging phrases like "gorgeous!", "love that!", "perfect angle!"
- You give clear, step-by-step makeup instructions
- You react to what you "see" (the user's face context) naturally
- Keep responses SHORT — 1-3 sentences max, like a real conversation
- You speak in a coaching tone, not robotic

Makeup expertise:
- Foundation, concealer, contouring, highlighting
- Eye makeup: eyeshadow, eyeliner, mascara, brow shaping
- Lip makeup: lipliner, lipstick, lip gloss
- Blush and bronzer placement
- Color theory and skin tone matching
- Face shape analysis and flattering techniques

When given face context (position, lighting, etc.), incorporate it naturally:
- If face is too close: "Back up just a tiny bit, babe — I need to see that gorgeous face!"
- If lighting is bad: "Can you shift a bit? The light isn't hitting your face quite right."
- If blending needed: "Now blend that out softly — small circles, you've got this!"

Always be supportive and make the user feel beautiful and confident.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, faceContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build context-aware system message
    let systemContent = SYSTEM_PROMPT;
    if (faceContext) {
      systemContent += `\n\nCurrent face context from camera:\n${JSON.stringify(faceContext, null, 2)}`;
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
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
