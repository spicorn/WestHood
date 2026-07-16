import { MessagesInbox } from '@/components/shared/messages-inbox'

export default function StudentMessagesPage() {
  return (
    <MessagesInbox
      title="Messages"
      description="Messages from the school office and your teachers."
      allowCompose
      composeRecipients={[
        { id: 'u-admin', name: 'School Office' },
        { id: 'u-staff', name: 'My Class Teacher' },
      ]}
    />
  )
}
