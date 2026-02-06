import { useState } from 'react';
import RecruiterLayout from '../components/RecruiterLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Settings as SettingsIcon,
  Shield,
  Users,
  Bell,
  Key,
  Save,
  Sparkles,
  Target
} from 'lucide-react';

interface SettingsPageProps {
  navigate: (page: string) => void;
  onLogout: () => void;
}

export default function SettingsPage({ navigate, onLogout }: SettingsPageProps) {
  const [qualificationThreshold, setQualificationThreshold] = useState([75]);
  const [antiBotSensitivity, setAntiBotSensitivity] = useState([70]);

  const teamMembers = [
    { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'Recruiter', status: 'Active' },
    { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Viewer', status: 'Active' },
  ];

  return (
    <RecruiterLayout navigate={navigate} onLogout={onLogout} currentPage="settings">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your platform configuration and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assessment" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1">
            <TabsTrigger value="assessment">Assessment</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="team">Team & Access</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          {/* Assessment Settings */}
          <TabsContent value="assessment" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Default Assessment Settings</h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                  <Input
                    id="default-duration"
                    type="number"
                    defaultValue={90}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Qualification Threshold (%)</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={qualificationThreshold}
                      onValueChange={setQualificationThreshold}
                      max={100}
                      step={5}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {qualificationThreshold[0]}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Candidates scoring above this threshold will be marked as "Qualified"
                  </p>
                </div>
                <div>
                  <Label>Default Section Weights</Label>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <Input type="number" placeholder="Objective %" defaultValue={40} />
                      <p className="text-xs text-slate-500 mt-1">Objective</p>
                    </div>
                    <div>
                      <Input type="number" placeholder="Subjective %" defaultValue={30} />
                      <p className="text-xs text-slate-500 mt-1">Subjective</p>
                    </div>
                    <div>
                      <Input type="number" placeholder="Coding %" defaultValue={30} />
                      <p className="text-xs text-slate-500 mt-1">Coding</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Assessment Options</Label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Randomize question order</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Show progress indicator to candidates</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Allow candidates to review answers before submission</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Scoring Settings */}
          <TabsContent value="scoring" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Scoring Configuration</h3>
                  <p className="text-sm text-slate-600">Customize how assessments are evaluated</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Partial Credit for Multiple Choice</Label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mt-2">
                    <option>No partial credit</option>
                    <option>50% for close answers</option>
                    <option>Custom scoring matrix</option>
                  </select>
                </div>
                <div>
                  <Label>Subjective Answer Evaluation</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center gap-3">
                      <input type="radio" name="subjective" className="border-slate-300" defaultChecked />
                      <span className="text-sm text-slate-700">AI-assisted evaluation with manual review</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="subjective" className="border-slate-300" />
                      <span className="text-sm text-slate-700">Fully manual evaluation</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="radio" name="subjective" className="border-slate-300" />
                      <span className="text-sm text-slate-700">Fully automated AI evaluation</span>
                    </label>
                  </div>
                </div>
                <div>
                  <Label>Coding Question Evaluation</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                      <span className="text-sm text-slate-700">Test case pass rate</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                      <span className="text-sm text-slate-700">Code quality and style</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                      <span className="text-sm text-slate-700">Time complexity analysis</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span className="text-sm text-slate-700">Best practices adherence</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Anti-Cheat & Security</h3>
                  <p className="text-sm text-slate-600">Configure monitoring and fraud detection</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label>Anti-Bot Sensitivity</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      value={antiBotSensitivity}
                      onValueChange={setAntiBotSensitivity}
                      max={100}
                      step={10}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-slate-900 w-12 text-right">
                      {antiBotSensitivity[0]}%
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    Higher sensitivity means stricter detection but may flag more false positives
                  </p>
                </div>

                <div className="space-y-3">
                  <Label>Monitoring Features</Label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Track time spent on each question</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Detect tab switching</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Disable copy/paste in code editor</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" />
                    <span className="text-sm text-slate-700">Require webcam monitoring</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    <span className="text-sm text-slate-700">Flag unusual answer patterns</span>
                  </label>
                </div>

                <div>
                  <Label>Resume Verification</Label>
                  <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mt-2">
                    <option>Always compare performance vs resume</option>
                    <option>Flag only significant mismatches</option>
                    <option>Disable resume verification</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Team & Access */}
          <TabsContent value="team" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Team Members</h3>
                    <p className="text-sm text-slate-600">Manage access and roles</p>
                  </div>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Users className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Role</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{member.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{member.email}</td>
                        <td className="px-4 py-3">
                          <select className="text-sm px-2 py-1 border border-slate-300 rounded">
                            <option>{member.role}</option>
                            <option>Admin</option>
                            <option>Recruiter</option>
                            <option>Viewer</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-sm text-emerald-700">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-3">Role Permissions</h4>
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700"><strong>Admin:</strong> Full access to all features including settings</p>
                  <p className="text-slate-700"><strong>Recruiter:</strong> Create assessments, view candidates, generate reports</p>
                  <p className="text-slate-700"><strong>Viewer:</strong> View assessments and candidates only (no editing)</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Notification Preferences</h3>
                  <p className="text-sm text-slate-600">Choose what updates you want to receive</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">New candidate submission</span>
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Assessment completion</span>
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Flagged candidates</span>
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Weekly summary report</span>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-900 mb-3">In-App Notifications</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Candidate activity updates</span>
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">System updates and features</span>
                      <input type="checkbox" className="rounded border-slate-300" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Team member activity</span>
                      <input type="checkbox" className="rounded border-slate-300" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">API & Integrations</h3>
                  <p className="text-sm text-slate-600">Manage external connections and API keys</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900">API Key</h4>
                    <Button variant="outline" size="sm">Regenerate</Button>
                  </div>
                  <div className="bg-slate-50 rounded p-3 font-mono text-sm text-slate-600">
                    hireright_api_•••••••••••••••••••••••••••8a3f
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <h4 className="font-medium text-slate-900 mb-3">Webhook URL</h4>
                  <Input
                    placeholder="https://your-domain.com/webhook"
                    className="mb-2"
                  />
                  <p className="text-xs text-slate-500">
                    Receive real-time updates when candidates complete assessments
                  </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-indigo-900 mb-1">API Documentation</h4>
                      <p className="text-sm text-indigo-800 mb-3">
                        Access our API docs to build custom integrations and automate your hiring workflow
                      </p>
                      <Button variant="outline" size="sm" className="bg-white">
                        View Documentation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
          <Button variant="outline">Cancel</Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </RecruiterLayout>
  );
}
