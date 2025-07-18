import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreatePostPage from './pages/CreatePostPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './layouts/HomePage';
import ChatPage from './pages/ChatTestPage';

import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/newsfeed" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
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
  );
}

export default App;
