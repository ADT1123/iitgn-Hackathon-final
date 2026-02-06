import { useState, useEffect } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Slider } from '../components/ui/slider';
import {
  Settings,
  User,
  Shield,
  Bell,
  CreditCard,
  Users,
  Zap,
  CheckCircle2,
  Save,
  Key,
  Mail,
  Building,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface SettingsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function SettingsPage({ navigate, onLogout }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    company: 'Acme Inc.',
    phone: '+1 234 567 8900'
  });

  // Assessment settings
  const [assessmentSettings, setAssessmentSettings] = useState({
    passingThreshold: [70],
    antiCheatEnabled: true,
    plagiarismThreshold: [85],
    timeTracking: true,
    randomizeQuestions: true,
    disableCopyPaste: true
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailOnSubmission: true,
    emailOnQualified: true,
    weeklyReports: true,
    candidateMessages: false
  });

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving settings...', { profileData, assessmentSettings, notifications });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'assessment', label: 'Assessment', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ];

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="settings">
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-slate-600">Manage your account and assessment preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-6">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-600 font-medium'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-slate-200 p-8">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Information</h2>
                      <p className="text-slate-600">Update your personal details</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">First Name</label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Last Name</label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Company</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          value={profileData.company}
                          onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">Phone</label>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Assessment Tab */}
                {activeTab === 'assessment' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Assessment Configuration</h2>
                      <p className="text-slate-600">Set default assessment parameters</p>
                    </div>

                    {/* Passing Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-slate-700">
                          Passing Threshold
                        </label>
                        <span className="text-lg font-bold text-indigo-600">
                          {assessmentSettings.passingThreshold[0]}%
                        </span>
                      </div>
                      <Slider
                        value={assessmentSettings.passingThreshold}
                        onValueChange={(value) =>
                          setAssessmentSettings({ ...assessmentSettings, passingThreshold: value })
                        }
                        min={50}
                        max={90}
                        step={5}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Candidates scoring below this will be auto-rejected
                      </p>
                    </div>

                    {/* Plagiarism Threshold */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium text-slate-700">
                          Plagiarism Detection Sensitivity
                        </label>
                        <span className="text-lg font-bold text-red-600">
                          {assessmentSettings.plagiarismThreshold[0]}%
                        </span>
                      </div>
                      <Slider
                        value={assessmentSettings.plagiarismThreshold}
                        onValueChange={(value) =>
                          setAssessmentSettings({ ...assessmentSettings, plagiarismThreshold: value })
                        }
                        min={70}
                        max={95}
                        step={5}
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Flag submissions with similarity above this threshold
                      </p>
                    </div>

                    {/* Anti-Cheat Options */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <h3 className="font-semibold text-slate-900">Anti-Cheat Measures</h3>
                      
                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-indigo-600" />
                          <div>
                            <div className="font-medium text-slate-900">Enable Anti-Cheat AI</div>
                            <div className="text-sm text-slate-600">Detect suspicious behavior patterns</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={assessmentSettings.antiCheatEnabled}
                          onChange={(e) =>
                            setAssessmentSettings({ ...assessmentSettings, antiCheatEnabled: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <div>
                            <div className="font-medium text-slate-900">Track Time per Question</div>
                            <div className="text-sm text-slate-600">Monitor answer submission times</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={assessmentSettings.timeTracking}
                          onChange={(e) =>
                            setAssessmentSettings({ ...assessmentSettings, timeTracking: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-purple-600" />
                          <div>
                            <div className="font-medium text-slate-900">Randomize Questions</div>
                            <div className="text-sm text-slate-600">Different order for each candidate</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={assessmentSettings.randomizeQuestions}
                          onChange={(e) =>
                            setAssessmentSettings({ ...assessmentSettings, randomizeQuestions: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>

                      <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                          <div>
                            <div className="font-medium text-slate-900">Disable Copy/Paste</div>
                            <div className="text-sm text-slate-600">Prevent copying from external sources</div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={assessmentSettings.disableCopyPaste}
                          onChange={(e) =>
                            setAssessmentSettings({ ...assessmentSettings, disableCopyPaste: e.target.checked })
                          }
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Security Settings</h2>
                      <p className="text-slate-600">Manage passwords and authentication</p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">Password</h3>
                          <p className="text-sm text-slate-600 mb-4">Last changed 30 days ago</p>
                          <Button variant="outline">
                            <Key className="w-4 h-4 mr-2" />
                            Change Password
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                      <h3 className="font-semibold text-slate-900 mb-2">Two-Factor Authentication</h3>
                      <p className="text-sm text-slate-600 mb-4">Add an extra layer of security to your account</p>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Shield className="w-4 h-4 mr-2" />
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Notification Preferences</h2>
                      <p className="text-slate-600">Choose what you want to be notified about</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'emailOnSubmission', label: 'New Assessment Submission', desc: 'Get notified when a candidate completes assessment' },
                        { key: 'emailOnQualified', label: 'Qualified Candidate', desc: 'Alert when a candidate passes threshold' },
                        { key: 'weeklyReports', label: 'Weekly Summary Reports', desc: 'Receive weekly hiring analytics via email' },
                        { key: 'candidateMessages', label: 'Candidate Messages', desc: 'Notifications for candidate inquiries' }
                      ].map((notif) => (
                        <label key={notif.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                          <div>
                            <div className="font-medium text-slate-900">{notif.label}</div>
                            <div className="text-sm text-slate-600">{notif.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[notif.key as keyof typeof notifications]}
                            onChange={(e) =>
                              setNotifications({ ...notifications, [notif.key]: e.target.checked })
                            }
                            className="w-5 h-5 rounded border-slate-300"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Team Members</h2>
                        <p className="text-slate-600">Manage who has access to your workspace</p>
                      </div>
                      <Button className="bg-indigo-600 hover:bg-indigo-700">
                        <Users className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active' },
                        { name: 'Jane Smith', email: 'jane@company.com', role: 'Recruiter', status: 'Active' },
                        { name: 'Mike Johnson', email: 'mike@company.com', role: 'Viewer', status: 'Pending' }
                      ].map((member, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="font-semibold text-indigo-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{member.name}</div>
                              <div className="text-sm text-slate-600">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{member.role}</Badge>
                            <Badge className={member.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Billing Tab */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-2">Billing & Subscription</h2>
                      <p className="text-slate-600">Manage your plan and payment methods</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-8 text-white">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-2xl font-bold mb-2">Pro Plan</h3>
                          <p className="text-white/90">Unlimited assessments & candidates</p>
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
                      </div>
                      <div className="flex items-end gap-2 mb-6">
                        <span className="text-5xl font-bold">$99</span>
                        <span className="text-white/90 mb-2">/month</span>
                      </div>
                      <Button className="bg-white text-indigo-600 hover:bg-slate-100">
                        Upgrade Plan
                      </Button>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                      <h3 className="font-semibold text-slate-900 mb-4">Payment Method</h3>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900">•••• •••• •••• 4242</div>
                            <div className="text-sm text-slate-600">Expires 12/2027</div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Update</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RecruiterLayout>
  );
}
