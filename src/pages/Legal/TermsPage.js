import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, AlertTriangle, Scale, ArrowLeft } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

function TermsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const pageClass = isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const navClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const cardClass = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200';
  const mutedTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const sectionTextClass = isDark ? 'text-gray-300' : 'text-gray-700';

  const sections = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />,
      title: '1. Acceptance of Terms',
      content:
        'By creating an account or using CodeArena, you agree to follow these Terms and all platform rules. If you do not agree, you should not use the platform.'
    },
    {
      icon: <FileText className="w-5 h-5 text-yellow-400" />,
      title: '2. Eligibility',
      content:
        'CodeArena is designed primarily for students, learners, educators, and coding enthusiasts. You must provide accurate account information and keep your login credentials secure.'
    },
    {
      icon: <Scale className="w-5 h-5 text-yellow-400" />,
      title: '3. Acceptable Use',
      content:
        'You may use CodeArena for coding practice, contests, battles, learning, and academic preparation. You must not misuse the system, attempt unauthorized access, exploit bugs, spam discussions, impersonate others, or disrupt platform functionality.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />,
      title: '4. Code Submissions and Content Ownership',
      content:
        'You retain ownership of the code, comments, discussion posts, and other content you submit. By using the platform, you grant CodeArena permission to store, process, and display that content inside the system for core features such as submissions, contest judging, profile activity, history, discussions, and moderation.'
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      title: '5. Academic Integrity',
      content:
        'Users are responsible for using CodeArena ethically. If the platform is used in coursework, labs, or institutional environments, users must follow their teacher, university, or competition rules. CodeArena is not responsible for academic misconduct committed by users.'
    },
    {
      icon: <Scale className="w-5 h-5 text-yellow-400" />,
      title: '6. Contests, Battles, and Rankings',
      content:
        'Contest scores, battle outcomes, XP, levels, and ratings are determined by platform logic and may change as features evolve. CodeArena reserves the right to correct ranking errors, remove unfair results, or reset data affected by abuse, cheating, or technical faults.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />,
      title: '7. Discussions and Community Rules',
      content:
        'Users may post questions, explanations, and replies in discussions. Offensive, abusive, hateful, harassing, plagiarized, or misleading content is prohibited. CodeArena may remove content or restrict accounts that violate community standards.'
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
      title: '8. Platform Availability',
      content:
        'We aim to keep CodeArena available and reliable, but uninterrupted service is not guaranteed. Features may be updated, paused, improved, or removed at any time for maintenance, security, academic needs, or product development.'
    },
    {
      icon: <Scale className="w-5 h-5 text-yellow-400" />,
      title: '9. Account Suspension or Termination',
      content:
        'CodeArena may suspend, restrict, or delete accounts involved in cheating, fraud, abuse, fake identity usage, harmful automation, platform attacks, or repeated policy violations.'
    },
    {
      icon: <FileText className="w-5 h-5 text-yellow-400" />,
      title: '10. Limitation of Responsibility',
      content:
        'CodeArena is provided as an educational and practice platform. While we try to maintain accuracy and fairness, we do not guarantee that all judging results, recommendations, or outputs will always be error-free. Users are responsible for verifying important academic or technical work.'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-yellow-400" />,
      title: '11. Changes to These Terms',
      content:
        'These Terms may be updated when platform features, policies, or academic requirements change. Continued use of CodeArena after updates means you accept the revised Terms.'
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
              <FileText className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className={`mt-1 ${mutedTextClass}`}>CodeArena platform usage terms</p>
            </div>
          </div>

          <p className={`leading-7 ${sectionTextClass}`}>
            These Terms of Service describe the rules for using CodeArena, including coding practice,
            contests, battles, submissions, discussions, rankings, and related learning features.
            They are written specifically for this project and platform workflow.
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
          <h2 className="text-xl font-semibold mb-3">Contact and Policy Review</h2>
          <p className={`leading-7 ${sectionTextClass}`}>
            If you use CodeArena publicly or for a real institution, it is wise to review these Terms
            before production release and align them with your university, organization, or deployment rules.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsPage;