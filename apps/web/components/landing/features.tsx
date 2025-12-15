import { Zap, Shield, BarChart, Layers, GitBranch, Globe } from "lucide-react"

const features = [
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Visual Workflow Builder",
    description: "Drag and drop nodes to create complex logic without writing a single line of code."
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-time Execution",
    description: "Watch your workflows run in real-time with detailed execution logs and debugging tools."
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: "Advanced Branching",
    description: "Create sophisticated logic with conditional branching, loops, and parallel execution."
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Enterprise Security",
    description: "Bank-grade encryption for your credentials and data. SOC2 compliant infrastructure."
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Any API Integration",
    description: "Connect to any service with a REST or GraphQL API using our generic HTTP request node."
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Detailed Analytics",
    description: "Track usage, success rates, and performance metrics for all your workflows."
  }
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to scale</h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for developers and business users alike. 
            Build faster, scale better.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="p-6 rounded-2xl bg-background border hover:border-primary/50 transition-colors duration-300 group"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
