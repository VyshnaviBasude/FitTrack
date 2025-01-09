"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@supabase/supabase-js'

export default function ProfileSetup() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const profileData = {
      id: session?.user?.id,
      full_name: formData.get("fullName"),
      height: parseFloat(formData.get("height") as string),
      weight: parseFloat(formData.get("weight") as string),
      goal_weight: parseFloat(formData.get("goalWeight") as string),
      fitness_level: formData.get("fitnessLevel"),
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase
      .from('user_profiles')
      .insert([profileData])

    setIsLoading(false)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Profile created successfully!",
    })
    router.push("/workouts")
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>Tell us about yourself to get personalized recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Current Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalWeight">Goal Weight (kg)</Label>
              <Input
                id="goalWeight"
                name="goalWeight"
                type="number"
                step="0.1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fitnessLevel">Fitness Level</Label>
              <Select name="fitnessLevel" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select your fitness level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}