import { Navigate, Route, Routes, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/console/Dashboard'
import Batches from './pages/console/Batches'
import Receive from './pages/console/Receive'
import Alerts from './pages/console/Alerts'
import Explorer from './pages/console/Explorer'
import ConsumerPortal from './pages/ConsumerPortal'
import Home from './pages/Home'
import HomeConcept1 from './pages/HomeConcept1'
import HomeConcept2 from './pages/HomeConcept2'
import FarmerDashboard from './pages/farmer/FarmerDashboard'
import TransportPortal from './pages/transport/TransportPortal'
import LabPortal from './pages/lab/LabPortal'
import PackagingPortal from './pages/packaging/PackagingPortal'
import AdminPortal from './pages/admin/AdminPortal'
import CustomerHome from './pages/customer/CustomerHome'

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-honey-cream px-6 text-center">
      <p className="text-6xl font-black text-honey-dark">404</p>
      <p className="text-stone-600">This page drifted off the comb.</p>
      <Link
        to="/console"
        className="rounded-full bg-honey px-5 py-2 text-sm font-semibold text-white hover:bg-honey-dark"
      >
        Back to console
      </Link>
    </div>
  )
}

export default function App() {
  const concept = import.meta.env.VITE_CONCEPT
  const RootHome = concept === '2' ? HomeConcept2 : concept === '1' ? HomeConcept1 : Home
  return (
    <Routes>
      <Route path="/" element={<RootHome />} />
      <Route path="/concept1" element={<HomeConcept1 />} />
      <Route path="/concept2" element={<HomeConcept2 />} />
      <Route path="/verify/:batchId" element={<ConsumerPortal />} />
      <Route path="/customer" element={<CustomerHome />} />
      <Route path="/customer/report" element={<CustomerHome />} />
      <Route path="/farmer/*" element={<FarmerDashboard />} />
      <Route path="/transport/*" element={<TransportPortal />} />
      <Route path="/lab/*" element={<LabPortal />} />
      <Route path="/packaging/*" element={<PackagingPortal />} />
      <Route path="/admin/*" element={<AdminPortal />} />
      <Route path="/console" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="batches" element={<Batches />} />
        <Route path="receive" element={<Receive />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="explorer" element={<Explorer />} />
      </Route>
      <Route path="/b/:batchId" element={<ConsumerPortal />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
