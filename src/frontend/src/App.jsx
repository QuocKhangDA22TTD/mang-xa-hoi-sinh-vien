import './App.css';
import CreatePostPage from './pages/CreatePostPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';

import ProtectedRoute from './components/ProtectedRoute'; 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
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
  );
}

export default App;
