import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreatePostPage from './pages/CreatePostPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute'; 
import HomePage from './layouts/HomePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="newsfeed" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
