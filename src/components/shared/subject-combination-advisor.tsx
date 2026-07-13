import { ADVISOR_DISCLAIMER, STREAM_LABELS, type StreamAdvice } from '@/lib/alevel-advisor'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const strengthBar = {
  strong: 'bg-forest-500 w-full',
  adequate: 'bg-gold-500 w-2/3',
  developing: 'bg-red-400 w-1/3',
}

export function SubjectCombinationAdvisor({
  advice,
  selectedStream,
  onSelectStream,
  showPicker = false,
}: {
  advice: StreamAdvice[]
  selectedStream?: string
  onSelectStream?: (stream: StreamAdvice['stream']) => void
  showPicker?: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Subject Combination Advisor</CardTitle>
        <p className="text-sm text-muted-foreground">
          Lower Sixth stream fitness based on recent and projected marks.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {advice.map((a) => (
            <button
              key={a.stream}
              type="button"
              disabled={!showPicker}
              onClick={() => onSelectStream?.(a.stream)}
              className={cn(
                'rounded-lg border p-4 text-left transition-all',
                a.viable ? 'border-forest-200 bg-forest-50/40' : 'border-border bg-muted/30',
                showPicker && 'hover:border-gold-500 cursor-pointer',
                selectedStream === a.stream && 'ring-2 ring-gold-500 border-gold-500',
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h4 className="font-display text-lg font-semibold text-navy-800">
                  {STREAM_LABELS[a.stream]}
                </h4>
                <Badge variant={a.viable ? 'success' : 'outline'}>{a.score}%</Badge>
              </div>
              <p className="mb-3 text-xs text-muted-foreground">{a.rationale}</p>
              <ul className="space-y-2">
                {a.subjects.map((s) => (
                  <li key={s.subjectId}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="font-medium">{s.subjectName}</span>
                      <span className="text-muted-foreground capitalize">{s.strength}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className={cn('h-full rounded-full', strengthBar[s.strength])} />
                    </div>
                  </li>
                ))}
              </ul>
              {showPicker && selectedStream === a.stream && (
                <p className="mt-3 text-xs font-semibold text-gold-800">Selected for promotion</p>
              )}
            </button>
          ))}
        </div>
        <p className="mt-4 rounded-md border border-dashed border-gold-400/50 bg-gold-50 px-3 py-2 text-xs text-gold-900">
          {ADVISOR_DISCLAIMER}
        </p>
      </CardContent>
    </Card>
  )
}
