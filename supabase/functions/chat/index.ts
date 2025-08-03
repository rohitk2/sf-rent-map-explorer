import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Chat function called with method:', req.method)
    const { message, messages } = await req.json()
    console.log('Received message:', message)
    console.log('Received messages count:', messages?.length)
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    console.log('GEMINI_API_KEY exists:', !!GEMINI_API_KEY)
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables')
      throw new Error('GEMINI_API_KEY not found in environment variables')
    }

    // Build conversation context
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }))

    // Add current message
    conversationHistory.push({
      role: 'user',
      parts: [{ text: message }]
    })

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: conversationHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          systemInstruction: {
            parts: [{
              text: "You are a helpful assistant for HopeSF, a platform that helps people in San Francisco find essential resources like food distribution centers, shelters, hospitals, restrooms, and laundromats. Be friendly, empathetic, and provide practical guidance. Keep responses concise but helpful."
            }]
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

    return new Response(
      JSON.stringify({ response: reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})