import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { SetupProfileForm } from "./_components/setup-profile-form"

export default async function SetupProfilePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your station account to get started
          </p>
        </div>
        <SetupProfileForm />
      </div>
    </div>
  )
}