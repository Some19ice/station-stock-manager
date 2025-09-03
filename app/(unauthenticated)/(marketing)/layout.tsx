import { RedirectToast } from "@/components/payments/redirect-toast"
import { CursorWrapper } from "@/components/ui/cursor-wrapper"
import { Footer } from "./_components/footer"
import { HeaderWrapper } from "./_components/header-wrapper"
import { ScrollIndicator } from "./_components/scroll-indicator"
import { SiteBanner } from "./_components/site-banner"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Custom cursor for enhanced interactivity */}
      <CursorWrapper size={24} className="hidden lg:block" />

      <SiteBanner />
      <HeaderWrapper />

      {/* Main content wrapper with smooth transitions */}
      <main className="relative min-h-screen">{children}</main>

      <Footer />

      {/* Enhanced scroll indicators */}
      <ScrollIndicator
        showProgress={true}
        showBackToTop={true}
        showButton={true}
        showFade={true}
      />

      <RedirectToast />
    </>
  )
}
