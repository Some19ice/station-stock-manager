"use client"

import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Get Started</h1>
          <p className="text-muted-foreground mt-2">
            Create your Station Stock Manager account
          </p>
        </div>
        
        <div className="bg-card border rounded-lg shadow-lg p-1">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-background border-border hover:bg-accent",
                formButtonPrimary: "bg-primary hover:bg-primary/90",
                footerActionLink: "text-primary hover:text-primary/80"
              }
            }}
            redirectUrl="/setup-profile"
            signInUrl="/login"
          />
        </div>
      </div>
    </div>
  )
}
