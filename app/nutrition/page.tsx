"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Apple, Utensils, Coffee, Pizza } from "lucide-react"

const mealTypes = [
  {
    title: "Breakfast",
    description: "Start your day right",
    icon: Coffee,
    time: "6:00 AM - 10:00 AM"
  },
  {
    title: "Lunch",
    description: "Midday fuel",
    icon: Utensils,
    time: "11:00 AM - 2:00 PM"
  },
  {
    title: "Dinner",
    description: "Evening nourishment",
    icon: Pizza,
    time: "6:00 PM - 9:00 PM"
  },
  {
    title: "Snacks",
    description: "Between meals",
    icon: Apple,
    time: "Any time"
  }
]

export default function NutritionPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily nutrition intake</p>
        </div>
        <Link href="/nutrition/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Meal
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mealTypes.map((type) => {
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
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Typical time: {type.time}
                  </div>
                  <Link href={`/nutrition/new?type=${type.title.toLowerCase()}`}>
                    <Button className="w-full" variant="outline">
                      Add {type.title}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}