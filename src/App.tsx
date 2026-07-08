import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './components/auth/RequireAuth'
import { AdminPage } from './pages/AdminPage'
import { ConfirmEmailPage } from './pages/ConfirmEmailPage'
import { DisplayPage } from './pages/DisplayPage'
import { GetStartedPage } from './pages/GetStartedPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { ProfilePage } from './pages/ProfilePage'
import { SignupPage } from './pages/SignupPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu/:slug" element={<MenuPage />} />
        <Route path="/display/:slug" element={<DisplayPage />} />
        <Route path="/admin/:restaurantId" element={<AdminPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/confirm-email" element={<ConfirmEmailPage />} />
        <Route
          path="/get-started"
          element={
            <RequireAuth>
              <GetStartedPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
