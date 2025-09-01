import { currentUser } from "@clerk/nextjs/server"
import { HeroSection } from "./_components/sections/hero-section"
import { FeaturesSection } from "./_components/sections/features-section"
import { DemoSection } from "./_components/sections/demo-section"
// import { PricingSection } from "./_components/sections/pricing-section"

export default async function MarketingPage() {
  const user = await currentUser()
  const userRole = user?.publicMetadata?.role as string

  return (
    <>
      <HeroSection isAuthenticated={!!user} userRole={userRole} />
      <FeaturesSection />
      <DemoSection />
      {/* <PricingSection /> */}
    </>
  )
}
