"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@supabase/supabase-js'
import { Clock, Dumbbell } from "lucide-react"

export default function NewWorkout() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [exercises, setExercises] = useState([{ name: "", sets: "", reps: "", weight: "" }])

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }])
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const workoutData = {
      user_id: session?.user?.id,
      type: formData.get("type"),
      notes: formData.get("notes"),
      start_time: new Date().toISOString(),
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert([workoutData])
        .select()
        .single()

      if (workoutError) throw workoutError

      // Add exercises
      const exercisePromises = exercises.map(async (exercise) => {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select()
          .eq('name', exercise.name)
          .single()

        let exerciseId
        if (!exerciseData) {
          const { data: newExercise, error: newExerciseError } = await supabase
            .from('exercises')
            .insert([{ name: exercise.name, category: workoutData.type }])
            .select()
            .single()
          
          if (newExerciseError) throw newExerciseError
          exerciseId = newExercise.id
        } else {
          exerciseId = exerciseData.id
        }

        return supabase
          .from('workout_exercises')
          .insert([{
            workout_id: workout.id,
            exercise_id: exerciseId,
            sets: parseInt(exercise.sets),
            reps: parseInt(exercise.reps),
            weight: parseFloat(exercise.weight),
          }])
      })

      await Promise.all(exercisePromises)

      toast({
        title: "Success",
        description: "Workout saved successfully!",
      })
      router.push("/workouts")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6" />
            <span>New Workout</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="type">Workout Type</Label>
              <select
                id="type"
                name="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                required
              >
                <option value="strength">Strength Training</option>
                <option value="cardio">Cardio</option>
                <option value="hiit">HIIT</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Exercises</Label>
                <Button type="button" variant="outline" onClick={addExercise}>
                  Add Exercise
                </Button>
              </div>
              
              {exercises.map((exercise, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`exercise-${index}`}>Exercise Name</Label>
                        <Input
                          id={`exercise-${index}`}
                          value={exercise.name}
                          onChange={(e) => {
                            const newExercises = [...exercises]
                            newExercises[index].name = e.target.value
                            setExercises(newExercises)
                          }}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`sets-${index}`}>Sets</Label>
                          <Input
                            id={`sets-${index}`}
                            type="number"
                            value={exercise.sets}
                            onChange={(e) => {
                              const newExercises = [...exercises]
                              newExercises[index].sets = e.target.value
                              setExercises(newExercises)
                            }}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`reps-${index}`}>Reps</Label>
                          <Input
                            id={`reps-${index}`}
                            type="number"
                            value={exercise.reps}
                            onChange={(e) => {
                              const newExercises = [...exercises]
                              newExercises[index].reps = e.target.value
                              setExercises(newExercises)
                            }}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`weight-${index}`}>Weight (kg)</Label>
                          <Input
                            id={`weight-${index}`}
                            type="number"
                            step="0.5"
                            value={exercise.weight}
                            onChange={(e) => {
                              const newExercises = [...exercises]
                              newExercises[index].weight = e.target.value
                              setExercises(newExercises)
                            }}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any notes about your workout..."
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Workout"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}