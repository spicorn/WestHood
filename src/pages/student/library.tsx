import { useMemo } from 'react'
import { toast } from 'sonner'
import { BookMarked, Library as LibraryIcon } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { useCurrentStudent } from '@/hooks/use-current-student'
import { PageHeader, EmptyState } from '@/components/shared/empty-state'
import { DataTable, type Column } from '@/components/shared/data-table'
import { Badge } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { LibraryBook } from '@/data/types'

const statusVariant: Record<LibraryBook['status'], 'success' | 'secondary' | 'danger' | 'outline'> = {
  available: 'success',
  issued: 'secondary',
  overdue: 'danger',
  returned: 'outline',
}

export default function StudentLibraryPage() {
  const student = useCurrentStudent()
  const books = useAppStore((s) => s.libraryBooks)
  const requestLibraryBook = useAppStore((s) => s.requestLibraryBook)

  const issuedToMe = useMemo(() => books.filter((b) => b.issuedTo === student.id), [books, student.id])

  const requestBook = (book: LibraryBook) => {
    requestLibraryBook(book.id, student.id)
    toast.success(`Requested "${book.title}"`, { description: 'The librarian will notify you once it is ready for collection.' })
  }

  const catalogColumns: Column<LibraryBook>[] = [
    { key: 'title', header: 'Title', render: (r) => <span className="font-medium">{r.title}</span> },
    { key: 'author', header: 'Author', render: (r) => r.author },
    { key: 'category', header: 'Category', render: (r) => <Badge variant="outline">{r.category}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant={statusVariant[r.status]}>{r.status}</Badge> },
    {
      key: 'action',
      header: '',
      render: (r) =>
        r.status === 'available' ? (
          <Button size="sm" variant="outline" onClick={() => requestBook(r)}>
            Request
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ]

  return (
    <div>
      <PageHeader title="Library" description="Browse the catalog and keep track of books issued to you." />

      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-navy-900">
          <BookMarked className="h-4 w-4" /> My issued books
        </h3>
        {issuedToMe.length === 0 ? (
          <EmptyState icon={LibraryIcon} title="No books issued" description="You don't have any library books checked out right now." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {issuedToMe.map((b) => (
              <div key={b.id} className="rounded-lg border bg-card p-4 shadow-soft">
                <p className="font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.author}</p>
                {b.dueDate && <p className="mt-2 text-xs text-muted-foreground">Due back {formatDate(b.dueDate)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 className="mb-3 font-display text-lg font-semibold text-navy-900">Catalog</h3>
      <DataTable data={books} columns={catalogColumns} searchKeys={['title', 'author', 'category']} searchPlaceholder="Search catalog…" />
    </div>
  )
}
