import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { HeroSection } from "./_components/sections/hero-section"
import { FeaturesSection } from "./_components/sections/features-section"
import { CompaniesSection } from "./_components/sections/companies-section"
import { SocialProofSection } from "./_components/sections/social-proof-section"
import { PricingSection } from "./_components/sections/pricing-section"
import { CTASection } from "./_components/sections/cta-section"

export default async function MarketingPage() {
  const user = await currentUser()
  
  // If user is already authenticated, redirect to appropriate dashboard
  if (user) {
    const userRole = user.publicMetadata?.role as string
    if (userRole === 'manager') {
      redirect('/dashboard')
    } else {
      redirect('/staff')
    }
  }
  
  return (
    <>
      <HeroSection />
      <CompaniesSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
    </>
  )
}
