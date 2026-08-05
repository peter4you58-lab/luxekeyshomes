import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import PerspectiveBar from './components/PerspectiveBar'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import ListProperty from './pages/ListProperty'
import TenantRegister from './pages/TenantRegister'
import Contact from './pages/Contact'
import About from './pages/About'
import Pricing from './pages/Pricing'
import Admin from './pages/Admin'
import TenantDashboard from './pages/TenantDashboard'
import LandlordDashboard from './pages/LandlordDashboard'
import AgentDashboard from './pages/AgentDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <PerspectiveBar />}
      {!isAdmin && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/list" element={<ListProperty />} />
          <Route path="/register" element={<TenantRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard/tenant" element={<TenantDashboard />} />
          <Route path="/dashboard/landlord" element={<LandlordDashboard />} />
          <Route path="/dashboard/agent" element={<AgentDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
    </>
  )
}
