/** Client-side CSV / printable board-pack helpers (no backend). */

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function printBoardPack(title: string, htmlSections: string[]) {
  const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Mulish, system-ui, sans-serif; color: #0f1d30; padding: 24px; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      h2 { font-size: 16px; margin: 24px 0 8px; border-bottom: 1px solid #d4a017; padding-bottom: 4px; }
      .tag { color: #5c6b7a; font-size: 12px; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 8px; }
      th, td { border: 1px solid #dfe5eb; padding: 6px 8px; text-align: left; }
      th { background: #eef2f7; }
      .kpi { display: inline-block; margin-right: 16px; margin-bottom: 8px; padding: 8px 12px; background: #f8f6f1; border-radius: 6px; }
      .kpi b { display: block; font-size: 18px; }
    </style></head><body>
    <h1>Westwood College</h1>
    <div class="tag">${title} · Visus Manifestus. · Generated ${new Date().toLocaleString()}</div>
    ${htmlSections.join('\n')}
    <script>window.onload=()=>{window.print()}</script>
    </body></html>`)
  w.document.close()
}
