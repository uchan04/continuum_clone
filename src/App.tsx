import { Route, Routes } from 'react-router-dom'
import AppLayout from './layout/AppLayout'
import AgentPage from './pages/AgentPage'
import AiCostPage from './pages/AiCostPage'
import AssetSurveyPage from './pages/AssetSurveyPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import MembersPage from './pages/MembersPage'
import SubscriptionsPage from './pages/SubscriptionsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="subscriptions" element={<SubscriptionsPage />} />
        <Route path="devices" element={<DevicesPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="agent" element={<AgentPage />} />
        <Route path="asset-survey" element={<AssetSurveyPage />} />
        <Route path="ai-cost" element={<AiCostPage />} />
      </Route>
    </Routes>
  )
}
