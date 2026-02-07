// src/pages/candidate/CandidateProfile.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { authAPI } from '@/services/api';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Save,
  Loader2,
  Upload,
  FileText,
  Award,
  Calendar
} from 'lucide-react';

export const CandidateProfile: React.FC = () => {
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    skills: [] as string[],
    experience: '',
    education: '',
    resume: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        skills: user.skills || [],
        experience: user.experience || '',
        education: user.education || '',
        resume: user.resume || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await authAPI.updateProfile(profile);
      
      // Update localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, ...profile }));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter(s => s !== skill)
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">Manage your personal information and skills</p>
        </div>
        <Button 
          variant="primary"
          onClick={handleSave}
          loading={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* Profile Picture */}
      <Card>
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {profile.firstName?.[0]}{profile.lastName?.[0]}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {profile.firstName} {profile.lastName}
            </h3>
            <p className="text-slate-600 mb-3">{profile.email}</p>
            <Button variant="secondary" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
          </div>
        </div>
      </Card>

      {/* Personal Information */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Personal Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            placeholder="John"
          />
          <Input
            label="Last Name"
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            placeholder="Doe"
          />
          <Input
            label="Email"
            type="email"
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="john@example.com"
            disabled
          />
          <Input
            label="Phone"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="+91 9876543210"
          />
          <div className="md:col-span-2">
            <Input
              label="Location"
              value={profile.location}
              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
              placeholder="Mumbai, India"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
          </div>
        </div>
      </Card>

      {/* Skills */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Skills
        </h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill (e.g., JavaScript, React)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
            />
            <Button variant="secondary" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.length === 0 ? (
              <p className="text-slate-500 text-sm">No skills added yet</p>
            ) : (
              profile.skills.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveSkill(skill)}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="info"
                    className="cursor-pointer hover:bg-red-100 hover:text-red-700"
                  >
                    {skill} ×
                  </Badge>
                </button>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Experience */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Experience
        </h2>
        
        <textarea
          value={profile.experience}
          onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          placeholder="Describe your work experience..."
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
        />
      </Card>

      {/* Education */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Education
        </h2>
        
        <textarea
          value={profile.education}
          onChange={(e) => setProfile({ ...profile, education: e.target.value })}
          placeholder="Describe your education background..."
          className="w-full p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
        />
      </Card>

      {/* Resume */}
      <Card>
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Resume
        </h2>
        
        <div className="space-y-4">
          {profile.resume ? (
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">Resume.pdf</p>
                  <p className="text-sm text-slate-600">Uploaded</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Replace
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Upload your resume (PDF, DOC, DOCX)</p>
              <Button variant="secondary">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button (Bottom) */}
      <div className="flex justify-end pt-6 border-t border-slate-200">
        <Button 
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={saving}
        >
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};
