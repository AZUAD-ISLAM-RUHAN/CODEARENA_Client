import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Database, Eye, Bell, ArrowLeft, Shield } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function PrivacyPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const pageClass = isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const navClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const cardClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const sectionTextClass = isDark ? 'text-gray-300' : 'text-gray-700';

  const sections = [
    {
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      title: '1. Information We Collect',
      content:
        'CodeArena may collect account information such as username, email, first name, last name, profile data, submitted code, submission history, contest participation, battle activity, ratings, XP, levels, discussion posts, notifications, and other platform usage data needed for core features.'
    },
    {
      icon: <Shield className="w-5 h-5 text-yellow-400" />,
      title: '2. How We Use Your Information',
      content:
        'We use collected information to create and manage accounts, evaluate submissions, show performance history, power contests and battles, display leaderboards, maintain discussions, deliver notifications, improve user experience, detect abuse, and support educational use of the platform.'
    },
    {
      icon: <Eye className="w-5 h-5 text-yellow-400" />,
      title: '3. What May Be Visible to Others',
      content:
        'Some information may be visible inside the platform, such as username, ratings, leaderboard position, discussion posts, contest standings, and other public or shared activity. Sensitive account information such as login credentials is not intended to be publicly displayed.'
    },
    {
      icon: <Lock className="w-5 h-5 text-yellow-400" />,
      title: '4. Code and Submission Privacy',
      content:
        'Your submitted code is stored by the system to support judging, history, submission review, heatmaps, contest records, and profile activity. CodeArena may show your own submissions back to you, and platform visibility rules determine whether other users can access any related records.'
    },
    {
      icon: <Bell className="w-5 h-5 text-yellow-400" />,
      title: '5. Notifications and Activity Signals',
      content:
        'CodeArena may generate notifications for platform events such as discussion replies, contest actions, battle invites, or account-related updates. These are used only to improve the user experience inside the platform.'
    },
    {
      icon: <Database className="w-5 h-5 text-yellow-400" />,
      title: '6. Data Storage and Retention',
      content:
        'Platform data may be stored in application databases and related backend systems for operational purposes. Some notification or temporary activity data may expire automatically, while core academic or submission records may remain stored to preserve platform history and functionality.'
    },
    {
      icon: <Shield className="w-5 h-5 text-yellow-400" />,
      title: '7. Security',
      content:
        'We try to protect user data through authentication, access control, and secure handling of platform requests. However, no online service can guarantee absolute security, and users should also protect their own passwords and devices.'
    },
    {
      icon: <Eye className="w-5 h-5 text-yellow-400" />,
      title: '8. Data Sharing',
      content:
        'CodeArena does not aim to sell personal user data. Information may only be processed or exposed when needed for platform features, administration, moderation, educational workflows, or technical maintenance.'
    },
    {
      icon: <Lock className="w-5 h-5 text-yellow-400" />,
      title: '9. User Choices',
      content:
        'Users may update profile information inside the platform. Depending on the final system implementation, users may also request correction or deletion of certain account information, subject to academic, moderation, and platform record requirements.'
    },
    {
      icon: <Shield className="w-5 h-5 text-yellow-400" />,
      title: '10. Policy Updates',
      content:
        'This Privacy Policy may be revised when platform features, data flows, or project requirements change. Continued use of CodeArena after updates means the revised Privacy Policy applies.'
    }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageClass}`}>
      <nav className={`border-b px-6 py-4 transition-colors duration-300 ${navClass}`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="text-2xl font-bold cursor-pointer"
            onClick={() => navigate('/')}
          >
            Code<span className="text-yellow-400">Arena</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded-lg transition ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              Home
            </button>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/')}
          className={`mb-6 inline-flex items-center gap-2 text-sm transition ${mutedTextClass} hover:text-yellow-400`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Landing Page
        </button>

        <div className={`border rounded-2xl p-8 mb-8 ${cardClass}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-yellow-100'}`}>
              <Lock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className={`mt-1 ${mutedTextClass}`}>How CodeArena handles platform data</p>
            </div>
          </div>

          <p className={`leading-7 ${sectionTextClass}`}>
            This Privacy Policy explains what information CodeArena may collect, how it is used,
            what may be visible inside the platform, and how project data supports features like
            submissions, contests, battles, discussions, notifications, and profile analytics.
          </p>
        </div>

        <div className="space-y-5">
          {sections.map((section, index) => (
            <div key={index} className={`border rounded-2xl p-6 ${cardClass}`}>
              <div className="flex items-start gap-3 mb-3">
                {section.icon}
                <h2 className="text-xl font-semibold">{section.title}</h2>
              </div>
              <p className={`leading-7 ${sectionTextClass}`}>{section.content}</p>
            </div>
          ))}
        </div>

        <div className={`mt-8 border rounded-2xl p-6 ${cardClass}`}>
          <h2 className="text-xl font-semibold mb-3">Project Note</h2>
          <p className={`leading-7 ${sectionTextClass}`}>
            These privacy terms are tailored for your CodeArena project workflow and features.
            Before public deployment, you may still want a final policy review based on your hosting,
            institution, and actual production data flow.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPage;