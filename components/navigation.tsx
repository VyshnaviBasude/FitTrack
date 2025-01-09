"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dumbbell, Home, Apple, MessageSquare, User } from 'lucide-react'

export default function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workouts', href: '/workouts', icon: Dumbbell },
    { name: 'Nutrition', href: '/nutrition', icon: Apple },
    { name: 'AI Coach', href: '/chat', icon: MessageSquare },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <nav className="bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">FitTrack</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={pathname === item.href ? "default" : "ghost"}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}