import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

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
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Check if user is admin
      if (data.user.role !== 'admin') {
        setError('You do not have admin privileges');
        setIsLoading(false);
        return;
      }

      // Store JWT token and admin status
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('isAdmin', 'true');
      
      // Redirect to admin panel
      navigate('/admin');
    } catch (err) {
      console.error('Admin login error:', err);
      setError('Network error. Please check if the server is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            <a href="/">Code<span className="text-red-500">Arena</span></a>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="bg-red-500/10 text-red-400 text-sm px-3 py-1 rounded-full font-medium">
              🔴 ADMIN PORTAL
            </span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-red-500/30">
          <h2 className="text-2xl font-semibold text-white mb-2">Admin Login</h2>
          <p className="text-gray-400 text-sm mb-6">Restricted access for authorized personnel only</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Admin Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@codearena.com"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition"
              />
            </div>
            
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-400 transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-400 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? '⏳ Logging in...' : '🔐 Access Admin Panel'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center mb-4">Not an administrator?</p>
            <Link 
              to="/login" 
              className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 rounded-lg transition text-center"
            >
              ← Back to Student Login
            </Link>
          </div>

          <div className="mt-6 bg-yellow-400/5 border border-yellow-400/20 rounded-lg p-3">
            <p className="text-xs text-yellow-400/80 text-center">
              🔒 This area is monitored. Unauthorized access attempts will be logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;