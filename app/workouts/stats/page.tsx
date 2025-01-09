"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { Activity, TrendingUp, Weight, Timer } from "lucide-react"

export default function WorkoutStats() {
  const { data: session } = useSession()
  const [weeklyStats, setWeeklyStats] = useState<any[]>([])
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [avgDuration, setAvgDuration] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const startDate = startOfWeek(new Date())
      const endDate = endOfWeek(new Date())

      // Fetch weekly workout data
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            sets,
            reps,
            weight
          )
        `)
        .eq('user_id', session.user.id)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())

      if (!error && workouts) {
        // Process workout data for statistics
        const dailyStats = workouts.reduce((acc: any, workout: any) => {
          const day = format(new Date(workout.start_time), 'EEE')
          if (!acc[day]) {
            acc[day] = { name: day, workouts: 0, totalWeight: 0 }
          }
          acc[day].workouts++
          
          // Calculate total weight lifted
          workout.workout_exercises.forEach((exercise: any) => {
            acc[day].totalWeight += (exercise.sets * exercise.reps * exercise.weight) || 0
          })
          
          return acc
        }, {})

        setWeeklyStats(Object.values(dailyStats))
        setTotalWorkouts(workouts.length)
        
        // Calculate average duration
        const totalDuration = workouts.reduce((sum: number, workout: any) => {
          if (workout.end_time) {
            return sum + (new Date(workout.end_time).getTime() - new Date(workout.start_time).getTime())
          }
          return sum
        }, 0)
        setAvgDuration(totalDuration / (workouts.length * 60000)) // Convert to minutes

        // Calculate total weight lifted
        const totalWeightLifted = workouts.reduce((sum: number, workout: any) => {
          return sum + workout.workout_exercises.reduce((exerciseSum: number, exercise: any) => {
            return exerciseSum + ((exercise.sets * exercise.reps * exercise.weight) || 0)
          }, 0)
        }, 0)
        setTotalWeight(totalWeightLifted)
      }
      
      setIsLoading(false)
    }

    fetchStats()
  }, [session])

  if (isLoading) {
    return <div>Loading statistics...</div>
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Workout Statistics</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Duration</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDuration.toFixed(0)} min</div>
            <p className="text-xs text-muted-foreground">per workout</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
            <Weight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWeight.toLocaleString()} kg</div>
            <p className="text-xs text-muted-foreground">total lifted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{((totalWorkouts / 7) * 100).toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">of weekly goal</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="workouts" fill="hsl(var(--primary))" name="Workouts" />
                <Bar yAxisId="right" dataKey="totalWeight" fill="hsl(var(--chart-2))" name="Weight (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}