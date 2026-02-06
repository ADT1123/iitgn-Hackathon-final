import { Button } from '../components/ui/button';
import { 
  Target, 
  Shield, 
  Brain, 
  CheckCircle2, 
  TrendingUp, 
  FileSearch, 
  UserCheck,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  navigate: (page: string) => void;
}

export default function LandingPage({ navigate }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">HireRight AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('login')}>
              Log In
            </Button>
            <Button onClick={() => navigate('signup')} className="bg-indigo-600 hover:bg-indigo-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Skill Assessment Platform
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            Hire Based on Skills,<br />
            <span className="text-indigo-600">Not Noise.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Evaluate candidates strictly on job requirements with AI-powered assessments. 
            Fair, transparent, and bias-free hiring decisions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8"
              onClick={() => navigate('signup')}
            >
              Create Assessment
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
            >
              View Demo
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 justify-center">
            <Shield className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-600">Secure & Private</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-600">Fair & Unbiased</span>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <Brain className="w-5 h-5 text-emerald-600" />
            <span className="text-slate-600">Explainable AI</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white py-20 border-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Everything You Need for Smart Hiring
            </h2>
            <p className="text-lg text-slate-600">
              Powered by AI, designed for recruiters and candidates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                AI Job Description Parsing
              </h3>
              <p className="text-slate-600">
                Upload any JD and our AI extracts skills, experience levels, and requirements 
                automatically. No manual tagging needed.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Anti-Fake Detection
              </h3>
              <p className="text-slate-600">
                Advanced monitoring detects resume mismatches, unusual patterns, and ensures 
                authentic candidate responses.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                Skill-Based Scoring
              </h3>
              <p className="text-slate-600">
                Candidates are ranked purely on job-relevant skills. Get detailed analytics 
                on strengths and weaknesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-600">
              Four simple steps to smarter hiring
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Upload Job Description
              </h3>
              <p className="text-slate-600 text-sm">
                Paste or upload your JD. AI parses skills and requirements.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                AI Generates Assessment
              </h3>
              <p className="text-slate-600 text-sm">
                Customized questions based on your exact requirements.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Candidates Take Test
              </h3>
              <p className="text-slate-600 text-sm">
                Clean, focused interface with anti-cheat monitoring.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Review Rankings
              </h3>
              <p className="text-slate-600 text-sm">
                Get skill-based scores with AI explanations and insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Hiring?
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            Join hundreds of companies making fair, skill-based hiring decisions
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8"
              onClick={() => navigate('signup')}
            >
              Get Started Free
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-white border-white hover:bg-indigo-700 text-lg px-8"
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-semibold">HireRight AI</span>
              </div>
              <p className="text-sm">
                AI-powered hiring platform for skill-based assessments
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>© 2026 HireRight AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
