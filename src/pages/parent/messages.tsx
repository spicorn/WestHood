import { useLocation } from 'react-router-dom'
import { MessagesInbox } from '@/components/shared/messages-inbox'

export default function ParentMessagesPage() {
  const location = useLocation()
  const threadId = (location.state as { threadId?: string } | null)?.threadId

  return (
    <MessagesInbox
      title="Messages"
      description="Replies to school notices and direct messages with teachers."
      initialThreadId={threadId}
    />
  )
}
