import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, BarChart } from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--chart-1)] opacity-20 blur-[100px]"></div>
      
      <div className="container mx-auto px-4 text-center">
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Automate your workflow <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--chart-1)] to-[var(--chart-4)]">
            without the chaos
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Build powerful automation workflows visually. Connect your favorite apps, 
          automate repetitive tasks, and scale your operations with enterprise-grade reliability.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 text-base gap-2 bg-[var(--chart-1)] hover:bg-[var(--chart-1)]/90 text-white">
              Start Building Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-20 relative mx-auto max-w-5xl rounded-xl border bg-background shadow-2xl shadow-[var(--chart-1)]/10 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20 rounded-t-xl backdrop-blur-sm">
            <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <div className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="rounded-b-xl overflow-hidden bg-background aspect-video relative">
             <Image 
               src="/images/hero-image.png" 
               alt="Workflow Editor" 
               fill
               className="object-cover object-top"
               priority
             />
          </div>
        </div>
      </div>
    </section>
  )
}
