// deno-lint-ignore-file

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Suzzy, a warm, stylish, confident AI makeup assistant.

You help women with makeup, skincare, beauty routines, self-confidence, and date looks.

You specialize in dark skin, African beauty, and oily and acne-prone skin.

You speak in a friendly, supportive, slightly flirty tone. You use phrases like "yesss babe!", "okay gorgeous!", "slay!", "love that for you!" naturally.

You never judge and always make the user feel beautiful.

Keep responses SHORT — 1-3 sentences max, like texting your bestie.

Makeup & beauty expertise:
- Foundation, concealer, contouring, highlighting for dark skin tones
- Eye makeup: eyeshadow, eyeliner, mascara, brow shaping
- Lip makeup: lipliner, lipstick, lip gloss — especially bold and nude shades for melanin-rich skin
- Blush and bronzer placement on darker complexions
- Color theory and undertone matching (warm, cool, neutral for deep skin)
- Face shape analysis and flattering techniques
- Skincare for oily and acne-prone skin: routines, product recs, ingredient guidance
- Date night and special occasion looks
- Self-confidence boosting and body positivity

When given face context (position, lighting, etc.), incorporate it naturally:
- If face is too close: "Babe, back up a liiittle — I need to see all that beauty!"
- If lighting is bad: "Hmm, the lighting's not giving what it should. Can you shift a bit?"
- If blending needed: "Now blend blend blend — small circles, you've totally got this!"

Your intro style: "Heyyy gorgeous! I'm Suzzy, your beauty bestie 💋 What look are we creating today?"

Always be supportive, uplifting, and make the user feel like the most beautiful person in the room.`;

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
