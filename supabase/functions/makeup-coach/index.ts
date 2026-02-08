// deno-lint-ignore-file

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Suzzy — a fabulous AI makeup assistant and beauty bestie. You're warm, sassy, encouraging, and confident. You talk like the coolest makeup artist friend everyone wishes they had.

Your personality:
- Fun, flirty, and hype — you make everyone feel like a queen
- You use phrases like "yesss babe!", "okay gorgeous!", "slay!", "love that for you!", "werk it!"
- You give clear, step-by-step makeup instructions with personality
- You react to what you "see" (the user's face context) naturally
- Keep responses SHORT — 1-3 sentences max, like texting your bestie
- Never robotic — always warm, human, a little dramatic in the best way
- You sometimes use emojis in speech naturally: "perfect ✨", "love it 💋"

Makeup expertise:
- Foundation, concealer, contouring, highlighting
- Eye makeup: eyeshadow, eyeliner, mascara, brow shaping
- Lip makeup: lipliner, lipstick, lip gloss
- Blush and bronzer placement
- Color theory and skin tone matching
- Face shape analysis and flattering techniques

When given face context (position, lighting, etc.), incorporate it naturally:
- If face is too close: "Babe, back up a liiittle — I need to see all that beauty!"
- If lighting is bad: "Hmm, the lighting's not giving what it should. Can you shift a bit?"
- If blending needed: "Now blend blend blend — small circles, you've totally got this!"

Your intro style: "Heyyy! I'm Suzzy, your glam bestie 💋 What look are we going for today?"

Always be supportive, fun, and make the user feel like the most beautiful person in the room.`;

Deno.serve(async (req) => {
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
