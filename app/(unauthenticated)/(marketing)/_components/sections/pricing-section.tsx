"use client"

import { PricingButton } from "@/components/payments/pricing-button"
import { Button } from "@/components/ui/button"
import { Check, CreditCard, Zap, Gift } from "lucide-react"
import { SectionWrapper } from "./section-wrapper"

const pricing = [
  {
    name: "Single Station",
    price: "\u20A625,000",
    period: "/month",
    description: "Perfect for independent gas stations",
    features: [
      "1 station location",
      "Real-time inventory tracking",
      "Basic reporting",
      "Email support",
      "Mobile app access",
      "Supplier management"
    ],
    planKey: "SINGLE_STATION" as const,
    icon: CreditCard,
    highlight: false
  },
  {
    name: "Multi-Station Chain",
    price: "\u20A675,000",
    period: "/month",
    description: "Best for chains - up to 10 locations",
    features: [
      "Up to 10 stations",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
      "API access",
      "Compliance reporting",
      "Dedicated account manager"
    ],
    planKey: "MULTI_STATION" as const,
    icon: Zap,
    highlight: true
  }
]

export function PricingSection() {
  return (
    <SectionWrapper id="pricing">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="pricing-title text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="pricing-subtitle text-muted-foreground mt-4 text-lg leading-8">
            Choose the plan that fits your needs. Cancel anytime.
          </p>
        </div>

        {/* Pilot Offer Banner */}
        <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-green-500/30 bg-green-500/10 p-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-700">
              Pilot Offer: {"\u20A6"}15,000/mo for your first 3 months!
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Limited time offer for early adopters.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
          {pricing.map((tier, index) => (
            <div
              key={tier.name}
              className={`pricing-card relative rounded-3xl p-8 ring-1 ${
                tier.highlight
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-card-foreground ring-border"
              }`}
            >
              {tier.highlight && (
                <div className="pricing-badge absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full px-4 py-1 text-xs font-semibold">
                    BEST VALUE
                  </span>
                </div>
              )}

              <div className="flex items-center gap-4">
                <tier.icon
                  className={`h-8 w-8 ${
                    tier.highlight ? "text-primary-foreground" : "text-primary"
                  }`}
                />
                <h3
                  className={`text-lg leading-8 font-semibold ${
                    tier.highlight
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {tier.name}
                </h3>
              </div>

              <p
                className={`mt-4 text-sm leading-6 ${
                  tier.highlight
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {tier.description}
              </p>

              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    tier.highlight
                      ? "text-primary-foreground"
                      : "text-foreground"
                  }`}
                >
                  {tier.price}
                </span>
                <span
                  className={`text-sm leading-6 font-semibold ${
                    tier.highlight
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {tier.period}
                </span>
              </p>

              <ul
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  tier.highlight
                    ? "text-primary-foreground/80"
                    : "text-muted-foreground"
                }`}
              >
                {tier.features.map(feature => (
                  <li key={feature} className="flex gap-x-3">
                    <Check
                      className={`h-6 w-5 flex-none ${
                        tier.highlight
                          ? "text-primary-foreground"
                          : "text-primary"
                      }`}
                      aria-hidden="true"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <PricingButton
                planKey={tier.planKey}
                className={`mt-8 w-full ${
                  tier.highlight
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    : ""
                }`}
                variant={tier.highlight ? "default" : "outline"}
              >
                Get started
              </PricingButton>
            </div>
          ))}
        </div>

        <div className="pricing-footer mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </SectionWrapper>
  )
}
