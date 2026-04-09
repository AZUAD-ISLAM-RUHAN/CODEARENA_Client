import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Code2, Users, Trophy, Zap, BookOpen, Terminal, Target, ArrowRight } from 'lucide-react';

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleProtectedNavigation = (path) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  const features = [
    {
      icon: <Code2 className="w-6 h-6" />,
      title: "Algorithm Mastery",
      description: "Practice 3000+ coding problems from easy to hard. Master data structures and algorithms with hands-on experience."
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Mock Interviews",
      description: "Simulate real interview scenarios with timed challenges. Get feedback on your performance and improve."
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Weekly Contests",
      description: "Compete with developers worldwide. Win prizes, earn rankings, and showcase your skills."
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Feedback",
      description: "Run code against 100+ test cases instantly. Debug with detailed error messages and runtime analysis."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Curated Study Plans",
      description: "Follow structured learning paths for top companies. Prepare for FAANG with company-tagged problems."
    },
    {
      icon: <Terminal className="w-6 h-6" />,
      title: "Multi-Language Support",
      description: "Write solutions in Python, Java, C++, JavaScript, and more. Switch languages seamlessly."
    }
  ];

  const stats = [
    { value: "3,000+", label: "Coding Problems" },
    { value: "5M+", label: "Active Users" },
    { value: "100+", label: "Countries" },
    { value: "50+", label: "Hiring Partners" }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Code<span className="text-yellow-400">Arena</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <button onClick={() => handleProtectedNavigation('/contest')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Contests</button>
              <button onClick={() => handleProtectedNavigation('/problems')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Problems</button>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/admin-login')}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Admin Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-5 h-0.5 bg-gray-900 mb-1.5"></div>
              <div className="w-5 h-0.5 bg-gray-900 mb-1.5"></div>
              <div className="w-5 h-0.5 bg-gray-900"></div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-sm font-medium text-gray-600">Features</a>
              <a href="#contests" className="block text-sm font-medium text-gray-600">Contests</a>
              <a href="#problems" className="block text-sm font-medium text-gray-600">Problems</a>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full text-left text-sm font-medium text-gray-600"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigate('/admin-login')}
                  className="w-full text-left text-sm font-medium text-gray-600"
                >
                  Admin Login
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 rounded-full">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-yellow-700">Now with AI-powered hints</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900">
                Level up your <br />
                <span className="text-yellow-500">coding skills</span> today
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                The world's leading platform for coding practice. Master algorithms, prepare for interviews, and join a community of millions of developers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/register')}
                  className="group px-8 py-4 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => handleProtectedNavigation('/problems')}
                  className="px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  View Problems
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p>Join <span className="font-semibold text-gray-900">5 million+</span> developers</p>
              </div>
            </div>

            {/* Right Content - Code Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-yellow-100 to-gray-100 rounded-3xl blur-2xl opacity-70"></div>
              <div className="relative bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
                {/* Window Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-800 border-b border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-gray-400 font-mono">solution.py</span>
                  </div>
                </div>
                
                {/* Code Content */}
                <div className="p-6 font-mono text-sm leading-relaxed">
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">1</div>
                    <div><span className="text-purple-400">class</span> <span className="text-yellow-300">Solution</span>:</div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">2</div>
                    <div className="pl-4"><span className="text-purple-400">def</span> <span className="text-blue-400">twoSum</span>(<span className="text-orange-300">self</span>, nums, target):</div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">3</div>
                    <div className="pl-8"><span className="text-gray-400"># Create hash map for O(1) lookup</span></div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">4</div>
                    <div className="pl-8">seen = {}</div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">5</div>
                    <div className="pl-8"><span className="text-purple-400">for</span> i, num <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span>(nums):</div>
                  </div>
                  <div className="flex">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none">6</div>
                    <div className="pl-12">complement = target - num</div>
                  </div>
                  <div className="flex mt-4 pt-4 border-t border-gray-700">
                    <div className="text-gray-500 w-8 text-right pr-4 select-none"></div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 text-xs">✓ Accepted</span>
                      <span className="text-gray-500 text-xs">|</span>
                      <span className="text-gray-400 text-xs">Runtime: 56 ms</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border border-gray-200 animate-bounce" style={{animationDuration: '3s'}}>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-gray-900">Easy</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border border-gray-200 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-gray-900">JS</div>
                  <span className="text-sm font-semibold text-gray-900">+50 XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to ace coding interviews
            </h2>
            <p className="text-lg text-gray-600">
              Comprehensive tools and resources designed by engineers who've been through the interview process at top tech companies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-yellow-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-900 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to start your coding journey?
          </h2>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Join millions of developers who practice on CodeArena. It's free to start, and you can upgrade anytime for premium features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-300 transition-all flex items-center justify-center gap-2"
            >
              Start Coding Now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => handleProtectedNavigation('/problems')}
              className="px-8 py-4 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
            >
              Explore Problems
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            No credit card required for free tier
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Code2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Code<span className="text-yellow-400">Arena</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 max-w-xs">
                Empowering developers worldwide to master coding skills and land their dream jobs.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => handleProtectedNavigation('/problems')} className="hover:text-gray-900">Problems</button></li>
                <li><button onClick={() => handleProtectedNavigation('/contest')} className="hover:text-gray-900">Contests</button></li>
                <li><button onClick={() => handleProtectedNavigation('/battle')} className="hover:text-gray-900">Battle Arena</button></li>
                <li><button onClick={() => handleProtectedNavigation('/leaderboard')} className="hover:text-gray-900">Leaderboard</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><button onClick={() => navigate('/login')} className="hover:text-gray-900">Sign In</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-gray-900">Register</button></li>
                <li><button onClick={() => handleProtectedNavigation('/profile')} className="hover:text-gray-900">Profile</button></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2026 CodeArena. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-gray-900">Privacy</a>
              <a href="/terms" className="hover:text-gray-900">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;