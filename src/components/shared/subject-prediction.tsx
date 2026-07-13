import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/card'
import type { SubjectPrediction } from '@/lib/results-prediction'
import { PREDICTION_DISCLAIMER } from '@/lib/results-prediction'
import { cn } from '@/lib/utils'

const confidenceVariant = {
  high: 'success' as const,
  medium: 'warning' as const,
  low: 'outline' as const,
}

export function PredictionDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn('rounded-md border border-dashed border-gold-400/50 bg-gold-50 px-3 py-2 text-xs text-gold-900', className)}>
      {PREDICTION_DISCLAIMER}
    </p>
  )
}

export function SubjectPredictionCard({
  prediction,
  subjectName,
}: {
  prediction: SubjectPrediction
  subjectName: string
}) {
  const chartData = [
    ...prediction.pastPoints.map((p) => ({
      label: p.term.replace(' 2026', ''),
      actual: p.mark,
      projected: null as number | null,
    })),
    {
      label: 'Next (proj.)',
      actual: null as number | null,
      projected: prediction.projectedMark,
    },
  ]
  // Bridge: last actual also appears as start of projected dotted line
  if (chartData.length >= 2) {
    const lastActualIdx = chartData.length - 2
    chartData[lastActualIdx] = {
      ...chartData[lastActualIdx],
      projected: prediction.pastPoints[prediction.pastPoints.length - 1]?.mark ?? null,
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-soft">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h4 className="font-display text-lg font-semibold text-navy-800">{subjectName}</h4>
        <Badge variant={confidenceVariant[prediction.confidence]}>
          {prediction.confidence} confidence
        </Badge>
        <Badge
          variant={
            prediction.trend === 'improving' ? 'success' : prediction.trend === 'declining' ? 'danger' : 'secondary'
          }
        >
          {prediction.trend}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Projected band: <span className="font-semibold text-foreground">{prediction.gradeBand}</span>
        {' '}({prediction.projectedLow}–{prediction.projectedHigh}%)
      </p>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="Actual"
              stroke="#1e3a5f"
              strokeWidth={2}
              connectNulls={false}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="projected"
              name="Projected"
              stroke="#d4a017"
              strokeWidth={2}
              strokeDasharray="6 4"
              connectNulls
              dot={{ r: 4, fill: '#d4a017' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <PredictionDisclaimer className="mt-3" />
    </div>
  )
}
