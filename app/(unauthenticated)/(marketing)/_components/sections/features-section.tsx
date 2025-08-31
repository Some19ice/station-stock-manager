"use client"

import { motion } from "framer-motion"
import {
  BarChart,
  Code2,
  CreditCard,
  Database,
  Palette,
  Shield
} from "lucide-react"
import { SectionWrapper } from "./section-wrapper"
import { useStaggerAnimation } from "@/hooks/use-gsap"
import { useEffect } from "react"

const features = [
  {
    name: "Real-time Fuel Monitoring",
    description:
      "Track fuel levels across all tanks with automated alerts when inventory drops below minimum thresholds.",
    icon: BarChart
  },
  {
    name: "Supplier Management",
    description:
      "Manage supplier relationships, track deliveries, and automate purchase orders for seamless restocking.",
    icon: Database
  },
  {
    name: "Multi-Station Dashboard",
    description:
      "Oversee multiple locations from a single dashboard with role-based access for staff and managers.",
    icon: Shield
  },
  {
    name: "Lubricant Inventory",
    description:
      "Complete tracking for motor oils, filters, and automotive products with detailed specifications.",
    icon: Palette
  },
  {
    name: "Compliance Reporting",
    description:
      "Generate regulatory reports for environmental compliance, tax reporting, and audit requirements.",
    icon: Code2
  },
  {
    name: "Sales Analytics",
    description:
      "Detailed sales reports, profit margins, and performance metrics to optimize your operations.",
    icon: CreditCard
  }
]

export function FeaturesSection() {
  useStaggerAnimation("#features-grid", ".feature-item")

  return (
    <SectionWrapper className="relative" id="features">
      <div className="bg-[radial-gradient(45%_45%_at_50%_50%,theme(colors.brand-primary/20),transparent)] absolute inset-0 -z-10 opacity-20 dark:opacity-40" />

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            id="features-heading"
            className="text-primary text-base leading-7 font-semibold"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Everything Included
          </motion.h2>
          <motion.p
            className="text-foreground mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Complete Gas Station Management
          </motion.p>
          <motion.p
            className="text-muted-foreground mt-6 text-lg leading-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Everything you need to manage fuel inventory, track sales, and optimize operations.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl id="features-grid" className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.name}
                className="feature-item group relative flex flex-col"
              >
                <motion.div
                  className="bg-card ring-border w-fit rounded-lg p-2 ring-1"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <feature.icon
                    className="text-primary h-6 w-6"
                    aria-hidden="true"
                  />
                </motion.div>

                <dt className="text-foreground mt-4 flex items-center gap-x-3 text-base leading-7 font-semibold">
                  {feature.name}
                </dt>

                <dd className="text-muted-foreground mt-4 flex flex-auto flex-col text-base leading-7">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </SectionWrapper>
  )
}
