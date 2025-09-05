"use client"

import { useState, useRef, useEffect } from "react"
import { gsap } from "gsap"
import {
  BarChart3,
  Fuel,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Users,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Package
} from "lucide-react"
import { SectionWrapper } from "./section-wrapper"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { FloatingElements } from "@/components/ui/floating-elements"

const demoTabs = [
  {
    id: "dashboard",
    name: "Manager Dashboard",
    icon: BarChart3,
    description: "Complete overview of your station operations"
  },
  {
    id: "inventory",
    name: "Inventory Tracking",
    icon: Package,
    description: "Real-time fuel and product monitoring"
  },
  {
    id: "sales",
    name: "Sales Interface",
    icon: DollarSign,
    description: "Quick transaction processing for staff"
  },
  {
    id: "alerts",
    name: "Smart Alerts",
    icon: AlertTriangle,
    description: "Automated notifications and warnings"
  }
]

const mockData = {
  dashboard: {
    title: "Manager Dashboard",
    metrics: [
      { label: "Today's Sales", value: "$12,450", change: "+8.2%" },
      { label: "Fuel Inventory", value: "85%", change: "-2.1%" },
      { label: "Active Staff", value: "12", change: "+1" },
      { label: "Transactions", value: "234", change: "+15%" }
    ]
  },
  inventory: {
    title: "Inventory Management",
    items: [
      { name: "Premium Gasoline", level: 85, status: "good" },
      { name: "Regular Gasoline", level: 45, status: "low" },
      { name: "Diesel", level: 92, status: "good" },
      { name: "Motor Oil", level: 23, status: "critical" }
    ]
  },
  sales: {
    title: "Sales Interface",
    recentSales: [
      { time: "2:45 PM", product: "Premium Gas", amount: "$45.20" },
      { time: "2:42 PM", product: "Regular Gas", amount: "$32.15" },
      { time: "2:38 PM", product: "Diesel", amount: "$67.80" },
      { time: "2:35 PM", product: "Snacks", amount: "$8.50" }
    ]
  },
  alerts: {
    title: "Smart Alerts",
    notifications: [
      { type: "warning", message: "Regular gasoline below 50% capacity" },
      { type: "info", message: "Delivery scheduled for tomorrow 9 AM" },
      { type: "critical", message: "Motor oil critically low - reorder needed" },
      { type: "success", message: "Daily sales target achieved" }
    ]
  }
}

export function DemoSection() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !sectionRef.current) return

    // Section entrance animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true
      }
    })

    tl.from(".demo-title", {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out"
    })
    .from(".demo-tab", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    }, "-=0.4")
    .from(".demo-content", {
      opacity: 0,
      scale: 0.95,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.2")
  }, [mounted])

  const handleTabChange = (tabId: string) => {
    if (tabId === activeTab) return

    // Animate tab transition
    if (contentRef.current) {
      gsap.to(contentRef.current, {
        opacity: 0,
        y: 10,
        duration: 0.2,
        onComplete: () => {
          setActiveTab(tabId)
          gsap.to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.3,
            ease: "power2.out"
          })
        }
      })
    } else {
      setActiveTab(tabId)
    }
  }

  if (!mounted) {
    return (
      <SectionWrapper id="demo" className="relative overflow-hidden py-20 sm:py-32">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              See It In Action
            </h2>
            <p className="text-foreground/75 mt-6 text-lg leading-8">
              Experience the power of modern gas station management
            </p>
          </div>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper id="demo" className="relative overflow-hidden py-20 sm:py-32">
      <AnimatedBackground variant="features" particleCount={30} />
      <FloatingElements variant="features" density="low" animated />

      <div
        ref={sectionRef}
        className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="demo-title text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            See It In Action
          </h2>
          <p className="demo-subtitle text-foreground/75 mt-6 text-lg leading-8">
            Experience the power of modern gas station management with our
            intuitive interface designed for both managers and staff.
          </p>
        </div>

        {/* Demo Tabs */}
        <div
          ref={tabsRef}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {demoTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`demo-tab group relative rounded-2xl p-6 text-left transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card hover:bg-card/80 border border-border hover:border-primary/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-foreground/20"
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}
                  >
                    <tab.icon
                      className={`h-6 w-6 ${
                        activeTab === tab.id
                          ? "text-primary-foreground"
                          : "text-primary"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold ${
                        activeTab === tab.id
                          ? "text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {tab.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        activeTab === tab.id
                          ? "text-primary-foreground/80"
                          : "text-foreground/60"
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div
          ref={contentRef}
          className="demo-content mx-auto mt-16 max-w-6xl"
        >
          <div className="bg-card rounded-3xl border border-border p-8 shadow-2xl">
            <DemoContent activeTab={activeTab} data={mockData[activeTab as keyof typeof mockData]} />
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}

function DemoContent({ activeTab, data }: { 
  activeTab: string; 
  data: {
    title: string;
    metrics?: Array<{ label: string; value: string; change: string }>;
    items?: Array<{ name: string; level: number; status: string }>;
    recentSales?: Array<{ time: string; product: string; amount: string }>;
    notifications?: Array<{ type: string; message: string }>;
  }
}) {
  switch (activeTab) {
    case "dashboard":
      return (
        <div>
          <h3 className="text-foreground mb-6 text-2xl font-bold">{data.title}</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.metrics?.map((metric, index: number) => (
              <div key={index} className="bg-muted/50 rounded-xl p-4">
                <div className="text-foreground/60 text-sm font-medium">{metric.label}</div>
                <div className="text-foreground mt-2 text-2xl font-bold">{metric.value}</div>
                <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case "inventory":
      return (
        <div>
          <h3 className="text-foreground mb-6 text-2xl font-bold">{data.title}</h3>
          <div className="space-y-4">
            {data.items?.map((item, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-primary" />
                  <span className="text-foreground font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-muted h-2 w-32 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'good' ? 'bg-green-500' :
                        item.status === 'low' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.level}%` }}
                    />
                  </div>
                  <span className="text-foreground/60 text-sm">{item.level}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    case "sales":
      return (
        <div>
          <h3 className="text-foreground mb-6 text-2xl font-bold">{data.title}</h3>
          <div className="space-y-3">
            {data.recentSales?.map((sale, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-foreground/60" />
                  <span className="text-foreground/60 text-sm">{sale.time}</span>
                  <span className="text-foreground font-medium">{sale.product}</span>
                </div>
                <span className="text-primary font-semibold">{sale.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )
    case "alerts":
      return (
        <div>
          <h3 className="text-foreground mb-6 text-2xl font-bold">{data.title}</h3>
          <div className="space-y-3">
            {data.notifications?.map((alert, index: number) => (
              <div key={index} className={`flex items-start gap-3 rounded-lg border p-4 ${
                alert.type === 'critical' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                alert.type === 'success' ? 'border-green-200 bg-green-50' :
                'border-blue-200 bg-blue-50'
              }`}>
                {alert.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {alert.type === 'info' && <BarChart3 className="h-5 w-5 text-blue-600" />}
                <span className="text-foreground text-sm">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      )
    default:
      return null
  }
}
