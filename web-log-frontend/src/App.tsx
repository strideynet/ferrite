import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { Dashboard } from '@/pages/dashboard'
import { Log } from '@/pages/log'
import { Contacts } from '@/pages/contacts'
import { Login } from '@/pages/login'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login route without Layout (no header) */}
        <Route path="/login" element={<Login />} />

        {/* Main app routes with Layout (includes header) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="log" element={<Log />} />
          <Route path="contacts" element={<Contacts />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
