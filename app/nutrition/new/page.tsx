"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { createClient } from '@supabase/supabase-js'
import { Apple } from "lucide-react"

export default function NewMeal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [foods, setFoods] = useState([{ name: "", servingSize: "", calories: "", protein: "", carbs: "", fat: "" }])

  const addFood = () => {
    setFoods([...foods, { name: "", servingSize: "", calories: "", protein: "", carbs: "", fat: "" }])
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const mealData = {
      user_id: session?.user?.id,
      name: formData.get("name"),
      meal_type: formData.get("type") || searchParams.get("type") || "snack",
      notes: formData.get("notes"),
      date: new Date().toISOString().split('T')[0],
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    try {
      const { data: meal, error: mealError } = await supabase
        .from('meals')
        .insert([mealData])
        .select()
        .single()

      if (mealError) throw mealError

      // Add foods
      const foodPromises = foods.map(async (food) => {
        const { data: foodData, error: foodError } = await supabase
          .from('food_items')
          .insert([{
            name: food.name,
            calories: parseInt(food.calories),
            protein: parseFloat(food.protein),
            carbs: parseFloat(food.carbs),
            fat: parseFloat(food.fat),
          }])
          .select()
          .single()

        if (foodError) throw foodError

        return supabase
          .from('meal_foods')
          .insert([{
            meal_id: meal.id,
            food_id: foodData.id,
            serving_size: parseFloat(food.servingSize),
          }])
      })

      await Promise.all(foodPromises)

      toast({
        title: "Success",
        description: "Meal logged successfully!",
      })
      router.push("/nutrition")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
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
            <Apple className="h-6 w-6" />
            <span>Log New Meal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Meal Name</Label>
              <Input
                id="name"
                name="name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Meal Type</Label>
              <select
                id="type"
                name="type"
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                defaultValue={searchParams.get("type") || "snack"}
                required
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Foods</Label>
                <Button type="button" variant="outline" onClick={addFood}>
                  Add Food
                </Button>
              </div>
              
              {foods.map((food, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`food-${index}`}>Food Name</Label>
                        <Input
                          id={`food-${index}`}
                          value={food.name}
                          onChange={(e) => {
                            const newFoods = [...foods]
                            newFoods[index].name = e.target.value
                            setFoods(newFoods)
                          }}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`serving-${index}`}>Serving Size (g)</Label>
                          <Input
                            id={`serving-${index}`}
                            type="number"
                            step="0.1"
                            value={food.servingSize}
                            onChange={(e) => {
                              const newFoods = [...foods]
                              newFoods[index].servingSize = e.target.value
                              setFoods(newFoods)
                            }}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`calories-${index}`}>Calories</Label>
                          <Input
                            id={`calories-${index}`}
                            type="number"
                            value={food.calories}
                            onChange={(e) => {
                              const newFoods = [...foods]
                              newFoods[index].calories = e.target.value
                              setFoods(newFoods)
                            }}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor={`protein-${index}`}>Protein (g)</Label>
                          <Input
                            id={`protein-${index}`}
                            type="number"
                            step="0.1"
                            value={food.protein}
                            onChange={(e) => {
                              const newFoods = [...foods]
                              newFoods[index].protein = e.target.value
                              setFoods(newFoods)
                            }}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`carbs-${index}`}>Carbs (g)</Label>
                          <Input
                            id={`carbs-${index}`}
                            type="number"
                            step="0.1"
                            value={food.carbs}
                            onChange={(e) => {
                              const newFoods = [...foods]
                              newFoods[index].carbs = e.target.value
                              setFoods(newFoods)
                            }}
                            required
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor={`fat-${index}`}>Fat (g)</Label>
                          <Input
                            id={`fat-${index}`}
                            type="number"
                            step="0.1"
                            value={food.fat}
                            onChange={(e) => {
                              const newFoods = [...foods]
                              newFoods[index].fat = e.target.value
                              setFoods(newFoods)
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
                placeholder="Add any notes about your meal..."
              />
            </div>

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Log Meal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}