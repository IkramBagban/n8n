import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function LandingCTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="relative rounded-3xl bg-[var(--chart-1)] px-6 py-16 md:px-16 md:py-24 overflow-hidden text-center">
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white opacity-10 blur-[80px]"></div>
          <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-white opacity-10 blur-[80px]"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to automate your future?
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10">
            Join thousands of developers and businesses who are saving time and scaling operations with Nodeflow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base gap-2">
                Get Started for Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
