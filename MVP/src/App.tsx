import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AssessmentProvider } from '@/context/AssessmentContext'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/HomePage'
import { FarmStep1Page } from '@/pages/FarmStep1Page'
import { FarmStep2Page } from '@/pages/FarmStep2Page'
import { FarmStep3Page } from '@/pages/FarmStep3Page'
import { AnalyzingPage } from '@/pages/AnalyzingPage'
import { GuidanceResultPage } from '@/pages/GuidanceResultPage'
import { WeatherSnapshotPage } from '@/pages/WeatherSnapshotPage'
import { SourceDetailsPage } from '@/pages/SourceDetailsPage'
import { AssumptionsPage } from '@/pages/AssumptionsPage'
import { ExpertSupportPage } from '@/pages/ExpertSupportPage'

export default function App() {
  return (
    <AssessmentProvider>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/assessment/step-1" element={<FarmStep1Page />} />
            <Route path="/assessment/step-2" element={<FarmStep2Page />} />
            <Route path="/assessment/step-3" element={<FarmStep3Page />} />
            <Route path="/assessment/location" element={<Navigate to="/assessment/step-1" replace />} />
            <Route path="/assessment/rice" element={<Navigate to="/assessment/step-1" replace />} />
            <Route path="/assessment/field" element={<Navigate to="/assessment/step-2" replace />} />
            <Route path="/assessment/summary" element={<Navigate to="/assessment/step-3" replace />} />
            <Route path="/analyzing" element={<AnalyzingPage />} />
            <Route path="/guidance" element={<GuidanceResultPage />} />
            <Route path="/insufficient-information" element={<Navigate to="/guidance" replace />} />
            <Route path="/weather" element={<WeatherSnapshotPage />} />
            <Route path="/sources" element={<SourceDetailsPage />} />
            <Route path="/assumptions" element={<AssumptionsPage />} />
            <Route path="/expert-support" element={<ExpertSupportPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </HashRouter>
    </AssessmentProvider>
  )
}
