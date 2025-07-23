import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './layouts/HomePage';
import ChatPage from './pages/ChatPage';
import FriendsPage from './pages/FriendsPage';
import CreateAPersonalProfile from './pages/CreateAPersonalProfile';
import UpdateProfile from './pages/UpdateProfile';
import PersonalProfile from './pages/PersonalProfile';
import CreatePostPage from './pages/CreatePostPage';

import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route
                path="/create-profile"
                element={<CreateAPersonalProfile />}
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <PersonalProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/persona-profile/:userId?"
                element={<PersonalProfile />}
              />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/friends"
                element={
                  <ProtectedRoute>
                    <FriendsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-post"
                element={
                  <ProtectedRoute>
                    <CreatePostPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
