import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import AuthPage from './pages/AuthPage';
import Connections from './pages/Connections';
import Explore from './pages/Explore';
import Feed from './pages/Feed';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import Notifications from './pages/Notifications';
import PostDetail from './pages/PostDetail';
import Profile from './pages/Profile';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<AuthPage mode="login" />}
        />

        <Route
          path="/register"
          element={<AuthPage mode="register" />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Feed />} />

          <Route
            path="explore"
            element={<Explore />}
          />

          <Route
            path="search"
            element={<Explore searchOnly />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="post/:id"
            element={<PostDetail />}
          />

          <Route
            path="profile/:username/connections/:type"
            element={<Connections />}
          />

          <Route
            path="profile/:username"
            element={<Profile />}
          />
        </Route>

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}