import { PageHeader } from '@/components/shared/empty-state'
import ProfilePage from '@/pages/shared/profile-page'

export default function AdminProfile() {
  return (
    <div>
      <PageHeader title="My Profile" description="Manage your administrator account details." />
      <ProfilePage title="Administrator Details" />
    </div>
  )
}
