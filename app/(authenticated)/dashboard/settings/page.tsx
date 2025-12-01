"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ThemeSettings } from "@/components/dashboard/theme-settings"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Settings,
  Truck,
  Layers,
  ChevronRight,
  Building2,
  Shield,
  Bell,
  Sparkles,
  User,
  MapPin
} from "lucide-react"
import Link from "next/link"
import { getCurrentUserProfile } from "@/actions/auth"

const settingsLinks = [
  {
    title: "Suppliers",
    description: "Manage fuel and product suppliers",
    href: "/dashboard/settings/suppliers",
    icon: Truck,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-l-blue-500"
  },
  {
    title: "Categories",
    description: "View product categories and usage",
    href: "/dashboard/settings/categories",
    icon: Layers,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-l-purple-500"
  }
]

interface UserProfile {
  user: {
    id: string
    username: string
    role: "staff" | "manager" | "director"
  }
  station: {
    id: string
    name: string
    address?: string | null
  }
}

export default function SettingsPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadProfile()

    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
    }
  }, [])

  useEffect(() => {
    if (cardsRef.current && mounted) {
      const cards = cardsRef.current.querySelectorAll(".settings-card")
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          delay: 0.3
        }
      )

      cards.forEach(card => {
        const element = card as HTMLElement
        const enterHandler = () => {
          gsap.to(element, {
            y: -4,
            scale: 1.02,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
          })
        }
        const leaveHandler = () => {
          gsap.to(element, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
          })
        }
        element.addEventListener("mouseenter", enterHandler)
        element.addEventListener("mouseleave", leaveHandler)
      })
    }
  }, [mounted])

  const loadProfile = async () => {
    try {
      const result = await getCurrentUserProfile()
      if (result.isSuccess && result.data) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={pageRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage your station preferences and configurations
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="hidden sm:flex">
          {mounted ? new Date().toLocaleDateString() : ""}
        </Badge>
      </div>

      {/* Quick Navigation Cards */}
      <div ref={cardsRef} className="grid gap-4 md:grid-cols-2">
        {settingsLinks.map(link => (
          <Link key={link.href} href={link.href}>
            <Card
              className={`settings-card cursor-pointer border-l-4 ${link.borderColor} transition-all hover:border-l-8`}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${link.bgColor}`}
                  >
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{link.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Separator />

      {/* Theme Settings & Station Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ThemeSettings />

        {/* Station Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Station Information
            </CardTitle>
            <CardDescription>
              Your station details and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : profile ? (
              <>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        Station
                      </div>
                      <span className="font-medium">{profile.station.name}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Username
                      </div>
                      <span className="font-medium">{profile.user.username}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="h-4 w-4" />
                        Role
                      </div>
                      <Badge className="capitalize">{profile.user.role}</Badge>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/account">
                    <User className="mr-2 h-4 w-4" />
                    Manage Account
                  </Link>
                </Button>
              </>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Failed to load profile
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Settings - Coming Soon */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-muted-foreground">
          Coming Soon
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="settings-card border-l-4 border-l-amber-500 opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <Bell className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-xs text-muted-foreground">
                    Configure alerts & reminders
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="settings-card border-l-4 border-l-green-500 opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Security</h4>
                  <p className="text-xs text-muted-foreground">
                    Password & 2FA settings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="settings-card border-l-4 border-l-pink-500 opacity-75">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100">
                  <Sparkles className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <h4 className="font-medium">Integrations</h4>
                  <p className="text-xs text-muted-foreground">
                    Connect external services
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
