"use client"

import { SignIn } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { motion } from "framer-motion"
import { ArrowRight, BarChart3, Users, Package, TrendingUp } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"

export default function LoginPage() {
  const { theme } = useTheme()

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Left side - Station management benefits */}
        <motion.div
          className="hidden space-y-8 lg:block"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-4">
            <motion.div
              className="inline-block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                Welcome back!
              </span>
            </motion.div>
            <motion.h1
              className="text-4xl font-bold tracking-tight lg:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Manage your station
              <motion.span
                className="mt-2 block bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{
                  duration: 5,
                  ease: "linear",
                  repeat: Infinity
                }}
                style={{
                  backgroundSize: "200% 200%"
                }}
              >
                efficiently
              </motion.span>
            </motion.h1>
            <motion.p
              className="text-muted-foreground text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Continue managing your fuel inventory and sales operations.
            </motion.p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                desc: "Track sales & inventory",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10"
              },
              {
                icon: Package,
                title: "Inventory Control",
                desc: "Monitor fuel levels",
                color: "text-green-500",
                bgColor: "bg-green-500/10"
              },
              {
                icon: Users,
                title: "Staff Management",
                desc: "Role-based access",
                color: "text-purple-500",
                bgColor: "bg-purple-500/10"
              },
              {
                icon: TrendingUp,
                title: "Sales Tracking",
                desc: "Daily reports",
                color: "text-orange-500",
                bgColor: "bg-orange-500/10"
              }
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="bg-card group relative overflow-hidden rounded-lg border p-4 transition-all hover:shadow-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}
              >
                <motion.div
                  className={`${feature.bgColor} mb-2 inline-flex rounded-lg p-2`}
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.4 + i * 0.1
                  }}
                  whileHover={{ rotate: 10 }}
                >
                  <feature.icon className={`h-5 w-5 ${feature.color}`} />
                </motion.div>
                <p className="text-sm font-semibold">{feature.title}</p>
                <p className="text-muted-foreground text-xs">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Trust badge */}
          <motion.div
            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.2)"
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
            </motion.div>
            <div className="flex-1">
              <p className="text-sm font-medium">Trusted by Station Owners</p>
              <p className="text-muted-foreground text-xs">
                Secure inventory management system
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right side - Sign in form */}
        <motion.div
          className="mx-auto w-full max-w-md lg:mx-0"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="mb-8 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="mb-2 text-2xl font-semibold">
              Sign in to Station Stock Manager
            </h2>
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block"
              >
                <Link
                  href="/signup"
                  className="font-medium text-blue-600 transition-colors hover:underline"
                >
                  Contact your manager
                  <ArrowRight className="ml-1 inline h-3 w-3" />
                </Link>
              </motion.span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative"
          >
            <SignIn
              forceRedirectUrl="/dashboard"
              signUpUrl="/signup"
              appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
