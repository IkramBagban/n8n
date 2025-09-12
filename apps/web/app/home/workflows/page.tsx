import { WelcomeSection } from "@/components/welcome-section"



export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        <WelcomeSection />
      </div>
    </div>
  )
}