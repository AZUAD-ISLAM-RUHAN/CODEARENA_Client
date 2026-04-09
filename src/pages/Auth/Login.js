import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white"><a href="/">Code<span className="text-yellow-400">Arena</span></a></h1>
          <p className="text-gray-400 mt-2">Compete. Learn. Dominate.</p>
        </div>
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome Back</h2>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">University Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@university.edu"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition" />
            </div>
            <div className="text-right">
              <a href="#" className="text-yellow-400 text-sm hover:underline">Forgot password?</a>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 text-gray-950 font-bold py-3 rounded-lg transition duration-200">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="text-gray-400 text-sm text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-yellow-400 hover:underline font-medium">Register here</Link>
          </p>

          <p className="text-gray-500 text-sm text-center mt-4 pt-4 border-t border-gray-800">
            Are you an administrator?{' '}
            <Link to="/admin-login" className="text-red-400 hover:underline font-medium">Admin Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;