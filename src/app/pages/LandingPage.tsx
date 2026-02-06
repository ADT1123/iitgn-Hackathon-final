import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Sparkles,
  Shield,
  Zap,
  Brain,
  ChevronRight,
  CheckCircle2,
  Play,
  Users,
  TrendingUp,
  FileText,
  Code,
  BarChart3,
  Target,
  Clock,
  Search,
  MessageSquare,
  Award,
  Globe,
  Lock,
  Rocket,
  Star,
  ArrowRight,
  Menu,
  X
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HireAI
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Reviews
              </a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" onClick={() => onNavigate('login')}>
                Sign In
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => onNavigate('signup')}
              >
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-slate-600" />
              ) : (
                <Menu className="w-6 h-6 text-slate-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-3 border-t border-slate-200 mt-4 space-y-3">
              <a href="#features" className="block text-sm font-medium text-slate-600 hover:text-slate-900">
                Features
              </a>
              <a href="#how-it-works" className="block text-sm font-medium text-slate-600 hover:text-slate-900">
                How It Works
              </a>
              <a href="#pricing" className="block text-sm font-medium text-slate-600 hover:text-slate-900">
                Pricing
              </a>
              <div className="pt-3 space-y-2">
                <Button variant="outline" className="w-full" onClick={() => onNavigate('login')}>
                  Sign In
                </Button>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700" onClick={() => onNavigate('signup')}>
                  Get Started
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center">
          <Badge className="mb-6 bg-indigo-100 text-indigo-700 border-indigo-200 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Powered by Advanced AI • Trusted by 500+ Companies
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Hire Based on{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Skills
            </span>
            ,<br />
            Not Noise.
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            AI-powered hiring platform that parses job descriptions, generates custom assessments, 
            and ranks candidates based on <strong>actual performance</strong>. No bias. No fakes. Just skills.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate('signup')}
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Free Trial
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 w-full sm:w-auto"
              onClick={() => onNavigate('login')}
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Anti-Cheating AI</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>Real-time Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>60+ Languages</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Demo */}
        <div className="mt-16 rounded-2xl border-4 border-slate-200 overflow-hidden shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-1">
            <div className="bg-white rounded-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                  <FileText className="w-10 h-10 text-indigo-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Upload JD</h3>
                  <p className="text-sm text-slate-600">AI parses skills & requirements</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                  <Sparkles className="w-10 h-10 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Generate Tests</h3>
                  <p className="text-sm text-slate-600">Custom MCQs & coding challenges</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-6 border border-emerald-200">
                  <Award className="w-10 h-10 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-2">Rank Candidates</h3>
                  <p className="text-sm text-slate-600">Real-time leaderboard & insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
              <div className="text-slate-400">Companies</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50K+</div>
              <div className="text-slate-400">Assessments</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-slate-400">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10Min</div>
              <div className="text-slate-400">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700 border-indigo-200">
            <Target className="w-4 h-4 mr-2" />
            20+ Advanced Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Powered by Advanced AI
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to hire the best talent, backed by cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Brain,
              title: 'AI JD Parser',
              description: 'Auto-extracts skills, experience, and technologies from any job description in seconds',
              color: 'indigo',
              gradient: 'from-indigo-500 to-purple-500'
            },
            {
              icon: Sparkles,
              title: 'Smart Question Generation',
              description: 'Creates MCQs, subjective questions, and coding challenges based on your JD',
              color: 'purple',
              gradient: 'from-purple-500 to-pink-500'
            },
            {
              icon: Code,
              title: 'Live Code Execution',
              description: 'Run and evaluate code in 60+ programming languages with instant feedback',
              color: 'emerald',
              gradient: 'from-emerald-500 to-teal-500'
            },
            {
              icon: Shield,
              title: 'Anti-Cheat Detection',
              description: 'AI detects plagiarism, code copying, and suspicious behavior patterns',
              color: 'red',
              gradient: 'from-red-500 to-orange-500'
            },
            {
              icon: TrendingUp,
              title: 'Smart Rankings',
              description: 'Real-time leaderboards with skill-weighted scoring algorithms',
              color: 'amber',
              gradient: 'from-amber-500 to-orange-500'
            },
            {
              icon: BarChart3,
              title: 'Deep Analytics',
              description: 'Comprehensive insights with skill gap analysis and AI explanations',
              color: 'blue',
              gradient: 'from-blue-500 to-cyan-500'
            },
            {
              icon: FileText,
              title: 'Resume Verification',
              description: 'Automatically flags inconsistencies between claims and actual performance',
              color: 'slate',
              gradient: 'from-slate-500 to-gray-500'
            },
            {
              icon: Clock,
              title: 'Time Proctoring',
              description: 'Tracks time per question and flags suspicious patterns automatically',
              color: 'indigo',
              gradient: 'from-indigo-500 to-blue-500'
            },
            {
              icon: MessageSquare,
              title: 'AI Subjective Grading',
              description: 'Uses NLP to evaluate text responses with human-like understanding',
              color: 'green',
              gradient: 'from-green-500 to-emerald-500'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="group bg-white rounded-2xl border-2 border-slate-200 p-8 hover:border-indigo-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-gradient-to-br from-slate-50 to-indigo-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-slate-600">From JD to hire in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Lines */}
            <div className="hidden md:block absolute top-1/4 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300"></div>

            {[
              {
                step: '1',
                title: 'Upload Job Description',
                description: 'Simply paste or upload your JD. Our AI extracts all required skills, experience levels, and technologies in seconds.',
                icon: FileText,
                color: 'indigo'
              },
              {
                step: '2',
                title: 'AI Generates Assessment',
                description: 'Custom MCQs, coding challenges, and subjective questions are created instantly based on your requirements.',
                icon: Sparkles,
                color: 'purple'
              },
              {
                step: '3',
                title: 'Get Ranked Candidates',
                description: 'Real-time leaderboard with detailed analytics, AI insights, and hiring recommendations.',
                icon: Users,
                color: 'emerald'
              }
            ].map((step, i) => (
              <div key={i} className="relative z-10">
                <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:shadow-xl transition-all">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${step.color}-600 to-${step.color}-700 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg`}>
                    {step.step}
                  </div>
                  <step.icon className={`w-10 h-10 text-${step.color}-600 mb-4`} />
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Loved by Hiring Teams
          </h2>
          <p className="text-xl text-slate-600">See what recruiters are saying</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Priya Sharma',
              role: 'Head of Talent @ TechCorp',
              avatar: 'PS',
              text: 'HireAI reduced our hiring time by 60%. The AI-generated questions are spot-on and the anti-cheat system is foolproof.',
              rating: 5
            },
            {
              name: 'Rajesh Kumar',
              role: 'CTO @ StartupX',
              avatar: 'RK',
              text: 'Finally, a hiring platform that actually tests skills. The resume verification feature saved us from multiple bad hires.',
              rating: 5
            },
            {
              name: 'Sarah Chen',
              role: 'Recruiter @ MegaCorp',
              avatar: 'SC',
              text: 'The AI insights are incredibly accurate. We hired 3 developers last month, all top performers. Game changer!',
              rating: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400">Choose the plan that fits your hiring needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '49',
                description: 'Perfect for small teams',
                features: [
                  'Up to 50 assessments/month',
                  'AI JD Parser',
                  'Basic question generation',
                  'Email support',
                  'Standard analytics'
                ]
              },
              {
                name: 'Pro',
                price: '99',
                description: 'Most popular for growing companies',
                features: [
                  'Unlimited assessments',
                  'Advanced AI features',
                  'Live code execution',
                  'Anti-cheat detection',
                  'Priority support',
                  'Advanced analytics',
                  'API access'
                ],
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large organizations',
                features: [
                  'Everything in Pro',
                  'Custom integrations',
                  'Dedicated account manager',
                  'SLA guarantee',
                  'On-premise deployment',
                  'Custom AI training'
                ]
              }
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 ${
                  plan.popular ? 'border-indigo-400 scale-105' : 'border-white/10'
                } hover:border-indigo-400 transition-all relative`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white border-0">
                    Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-slate-400 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-slate-400">/month</span>}
                </div>
                <Button
                  className={`w-full mb-6 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                  onClick={() => onNavigate('signup')}
                >
                  Get Started
                </Button>
                <ul className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join 500+ companies using HireAI to find the best talent. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6 w-full sm:w-auto"
                onClick={() => onNavigate('signup')}
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6 w-full sm:w-auto"
                onClick={() => onNavigate('login')}
              >
                Schedule Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  HireAI
                </span>
              </div>
              <p className="text-slate-600 mb-4 leading-relaxed">
                AI-powered hiring platform that helps companies find and assess the best talent based on actual skills, not just resumes.
              </p>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  SOC 2 Certified
                </Badge>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <Shield className="w-3 h-3 mr-1" />
                  GDPR Compliant
                </Badge>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-indigo-600">Features</a></li>
                <li><a href="#pricing" className="hover:text-indigo-600">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600">Security</a></li>
                <li><a href="#" className="hover:text-indigo-600">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-600">API Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-indigo-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600">GDPR</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 text-center md:text-left">
              © 2026 HireAI. All rights reserved. Made with ❤️ in India 🇮🇳
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
