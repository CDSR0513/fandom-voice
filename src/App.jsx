import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import WritePage from './pages/WritePage'
import PostDetailPage from './pages/PostDetailPage'
import AgencyDashboard from './pages/AgencyDashboard'

function CommunityShell() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/write" element={<WritePage />} />
      </Routes>
    </Layout>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agency" element={<Layout><AgencyDashboard /></Layout>} />
        <Route path="/*" element={<CommunityShell />} />
      </Routes>
    </BrowserRouter>
  )
}