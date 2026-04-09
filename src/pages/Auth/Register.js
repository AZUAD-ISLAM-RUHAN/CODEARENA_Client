import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function Register() {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call real backend API
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.email.split('@')[0],
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Store JWT token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('isAdmin', 'false');
      
      // Give localStorage a moment to persist before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      setError('Network error. Please check if the server is running.');
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-10 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className={`text-4xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <a href="/">Code<span className="text-yellow-400">Arena</span></a>
          </h1>
          <p className={`mt-2 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Compete. Learn. Dominate.</p>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 shadow-xl border transition-colors duration-300 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-semibold mb-6 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>

          {error && (
            <div className={`px-4 py-3 rounded-lg mb-4 text-sm transition-colors ${isDark ? 'bg-red-500/10 border border-red-500 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">

            {/* First Name */}
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Your first name"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Last Name */}
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Your last name"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Email */}
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Password */}
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className={`text-sm mb-1 block transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400 transition duration-200 ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'}`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 text-gray-950 font-bold py-3 rounded-lg transition duration-200"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className={`text-sm text-center mt-6 transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Already have an account?{' '}
            <Link to="/" className="text-yellow-400 hover:underline font-medium">
              Login here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Register;