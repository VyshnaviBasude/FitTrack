"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@supabase/supabase-js'
import { format } from "date-fns"
import { Dumbbell, Clock } from "lucide-react"

interface WorkoutExercise {
  exercise: {
    name: string
    category: string
  }
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  type: string
  start_time: string
  end_time: string | null
  notes: string | null
  workout_exercises: WorkoutExercise[]
}

export default function WorkoutDetails() {
  const params = useParams()
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchWorkout = async () => {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_exercises (
            sets,
            reps,
            weight,
            exercise (
              name,
              category
            )
          )
        `)
        .eq('id', params.id)
        .single()

      if (!error && data) {
        setWorkout(data)
      }
      setIsLoading(false)
    }

    fetchWorkout()
  }, [params.id])

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!workout) {
    return <div>Workout not found</div>
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Dumbbell className="h-6 w-6" />
              <span>{workout.type} Workout</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{format(new Date(workout.start_time), "PPp")}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {workout.workout_exercises.map((exercise, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">{exercise.exercise.name}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Sets:</span>
                      <span className="ml-2 font-medium">{exercise.sets}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reps:</span>
                      <span className="ml-2 font-medium">{exercise.reps}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Weight:</span>
                      <span className="ml-2 font-medium">{exercise.weight}kg</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {workout.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold">Notes</h3>
              <p className="text-sm text-muted-foreground">{workout.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}