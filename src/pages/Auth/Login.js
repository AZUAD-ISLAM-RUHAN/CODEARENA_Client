import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Login() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedEmail = email.trim().toLowerCase();
      // Call real backend API
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail, password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store JWT token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('isAdmin', data.user.role === 'admin' ? 'true' : 'false');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check if the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className={`text-4xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}><a href="/">Code<span className="text-yellow-400">Arena</span></a></h1>
          <p className={`mt-2 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compete. Learn. Dominate.</p>
        </div>
        <div className={`rounded-2xl p-8 shadow-xl border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-semibold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome Back</h2>
          {error && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm transition-colors ${isDark ? 'bg-red-500/10 border border-red-500 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>University Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`} />
            </div>
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`} />
            </div>
            <div className="text-right">
              <a href="#" className="text-yellow-400 text-sm hover:underline">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 text-gray-950 font-bold py-3 rounded-lg transition duration-200">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className={`text-sm text-center mt-6 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:underline font-medium">Register here</Link>
          </p>

          <p className={`text-sm text-center mt-4 pt-4 border-t transition-colors ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-500 border-gray-200'}`}>
            Are you an administrator?{' '}
            <Link to="/admin-login" className="text-red-400 hover:underline font-medium">Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;