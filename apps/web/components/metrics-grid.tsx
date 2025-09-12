interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  variant?: 'default' | 'percentage' | 'time'
}

export function MetricCard({ title, value, subtitle, variant = 'default' }: MetricCardProps) {
  const formatValue = () => {
    if (variant === 'percentage') {
      return `${value}%`
    }
    if (variant === 'time') {
      return `${value}s`
    }
    return value
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{subtitle}</p>
        <div className="text-2xl font-semibold text-gray-900">
          {formatValue()}
        </div>
      </div>
    </div>
  )
}

interface MetricsGridProps {
  metrics: Array<{
    title: string
    value: string | number
    subtitle: string
    variant?: 'default' | 'percentage' | 'time'
  }>
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}