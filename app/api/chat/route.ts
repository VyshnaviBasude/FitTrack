import { NextResponse } from "next/server"
import { ChatOpenAI } from "langchain/chat_models/openai"
import { HumanMessage, SystemMessage, AIMessage } from "langchain/schema"
import { createClient } from '@supabase/supabase-js'

const SYSTEM_PROMPT = `You are an AI fitness coach with expertise in exercise, nutrition, and overall wellness. 
Your role is to provide personalized advice based on the user's fitness level, goals, and any health considerations.

Guidelines:
1. Always prioritize safety and proper form
2. Provide evidence-based recommendations
3. Encourage sustainable habits over quick fixes
4. Be motivating and supportive
5. When discussing nutrition, focus on balanced, whole foods
6. Adapt advice based on user's fitness level and goals

Remember to:
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Explain the reasoning behind recommendations
- Encourage gradual progress
- Stay within your scope of expertise

Do not:
- Provide medical diagnoses
- Recommend extreme diets or dangerous exercises
- Make promises about specific results
- Give advice about injuries or medical conditions`

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json()

    // Initialize chat model
    const chat = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    })

    // Get user profile if available
    let userContext = ""
    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profile) {
        userContext = `
          User Profile:
          - Fitness Level: ${profile.fitness_level}
          - Current Weight: ${profile.weight}kg
          - Goal Weight: ${profile.goal_weight}kg
          - Height: ${profile.height}cm
          
          Tailor your response based on this information.
        `
      }
    }

    const response = await chat.call([
      new SystemMessage(SYSTEM_PROMPT + "\n" + userContext),
      new HumanMessage(message)
    ])

    return NextResponse.json({ message: response.content })
  } catch (error) {
    console.error("Chat API Error:", error)
    return NextResponse.json(
      { error: "Failed to process your request" },
      { status: 500 }
    )
  }
}