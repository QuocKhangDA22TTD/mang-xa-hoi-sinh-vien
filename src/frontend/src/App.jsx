import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreatePostPage from './pages/CreatePostPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
      </Routes>
    </Router>
  );
}

export default App;
