import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import AuditLogPage from './pages/AuditLogPage'
import DashboardPage from './pages/DashboardPage'
import HandoverPage from './pages/HandoverPage'
import IntegrationsPage from './pages/IntegrationsPage'
import MembersPage from './pages/MembersPage'
import OffboardingPage from './pages/OffboardingPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="offboarding" element={<OffboardingPage />} />
        <Route path="handover" element={<HandoverPage />} />
        <Route path="integrations" element={<IntegrationsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="members" element={<MembersPage />} />
      </Route>
    </Routes>
  )
}
