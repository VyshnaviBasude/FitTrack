"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Brain, Send, User } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your AI fitness coach. I can help you with workout plans, nutrition advice, and answer any fitness-related questions. How can I assist you today?"
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          userId: session?.user?.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to get response")

      const data = await response.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.message }])
    } catch (error) {
      console.error("Error:", error)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request. Please try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card className="h-[800px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6" />
            <span>AI Fitness Coach</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-secondary"
                        : "bg-primary text-primary-foreground"
                    } rounded-lg p-3`}
                  >
                    {message.role === "assistant" && (
                      <Brain className="h-5 w-5 mt-1" />
                    )}
                    {message.role === "user" && (
                      <User className="h-5 w-5 mt-1" />
                    )}
                    <div className="space-y-2">
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about fitness..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}