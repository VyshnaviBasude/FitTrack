"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dumbbell, Plus, Calendar, TrendingUp, BarChart } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const workoutTypes = [
  {
    title: "Strength Training",
    description: "Build muscle and increase strength",
    icon: Dumbbell,
  },
  {
    title: "Cardio",
    description: "Improve endurance and burn calories",
    icon: TrendingUp,
  },
  {
    title: "HIIT",
    description: "High-intensity interval training",
    icon: Calendar,
  },
]

export default function WorkoutsPage() {
  const { data: session } = useSession()
  const [recentWorkouts, setRecentWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      if (!session?.user?.id) return

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('start_time', { ascending: false })
        .limit(5)

      setRecentWorkouts(data || [])
      setIsLoading(false)
    }

    fetchRecentWorkouts()
  }, [session])

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Track and manage your workouts</p>
        </div>
        <div className="space-x-4">
          <Link href="/workouts/stats">
            <Button variant="outline">
              <BarChart className="mr-2 h-4 w-4" />
              Statistics
            </Button>
          </Link>
          <Link href="/workouts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workoutTypes.map((type) => {
          const Icon = type.icon
          return (
            <Card key={type.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{type.title}</CardTitle>
                    <CardDescription>{type.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/workouts/new?type=${type.title.toLowerCase().replace(' ', '-')}`}>
                  <Button className="w-full" variant="outline">
                    Start Workout
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!isLoading && recentWorkouts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-4">Recent Workouts</h2>
          <div className="grid gap-4">
            {recentWorkouts.map((workout: any) => (
              <Link href={`/workouts/${workout.id}`} key={workout.id}>
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Dumbbell className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{workout.type} Workout</CardTitle>
                          <CardDescription>
                            {new Date(workout.start_time).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}