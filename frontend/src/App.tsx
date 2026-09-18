import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import { Route, Routes } from 'react-router-dom'

import Dashboard from './pages/Dashboard'
import NewProject from './pages/NewProject'

function Home() {
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
        {/* temporary link until we build real nav */}
        <a href="/dashboard">Go to dashboard</a>
      </SignedIn>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/new" element={<NewProject/>} />
      <Route path="/dashboard/edit/:id" element={<NewProject />} />
    </Routes>
  )
}

export default App