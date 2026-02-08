import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { candidatesAPI } from '@/services/api';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Award,
    CheckCircle,
    Clock,
    ChevronLeft,
    Save,
    Loader2,
    Trash2,
    Zap
} from 'lucide-react';
import { toast } from '@/components/ui/toaster';

export const CandidateProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);

    useEffect(() => {
        if (id) {
            loadCandidate();
        }
    }, [id]);

    const loadCandidate = async () => {
        try {
            setLoading(true);
            const response = await candidatesAPI.getCandidateById(id!);
            setCandidate(response.data.data);
            setFormData(response.data.data);
        } catch (error) {
            console.error('Failed to load candidate:', error);
            toast.error('Failed to load candidate profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await candidatesAPI.updateCandidate(id!, formData);
            setCandidate(formData);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-500 mt-4 font-medium">Loading profile...</p>
            </div>
        );
    }

    if (!candidate) return <div className="p-8 text-center text-slate-500 font-medium">Candidate not found</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/candidates')}
                    className="text-slate-500 hover:text-slate-900 -ml-2"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Pool
                </Button>
                <div className="flex gap-3">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={() => { setIsEditing(false); setFormData(candidate); }}>Cancel</Button>
                            <Button onClick={handleSave} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                Save Changes
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Briefcase className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Basic Info */}
                <div className="space-y-6">
                    <Card className="p-6 border-slate-200 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center font-black text-slate-300 text-3xl border-2 border-slate-200 mb-4">
                                {candidate.userId?.profile?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('') || 'C'}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{candidate.userId?.profile?.name || 'Talent Profile'}</h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">{candidate.resume?.parsedData?.domain || 'Applicant'}</p>

                            <div className="w-full mt-6 space-y-3 text-left border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-3 text-slate-600">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    <span className="text-sm font-medium">{candidate.userId?.email}</span>
                                </div>
                                {candidate.userId?.profile?.phone && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">{candidate.userId.profile.phone}</span>
                                    </div>
                                )}
                                {candidate.userId?.profile?.location && (
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <MapPin className="w-4 h-4 text-slate-400" />
                                        <span className="text-sm font-medium">{candidate.userId.profile.location}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* AI Insights Card (Sarvam integration byproduct) */}
                    <Card className="p-6 border-slate-200 shadow-sm bg-blue-50/30">
                        <div className="flex items-center gap-2 text-blue-600 mb-4">
                            <Zap className="w-4 h-4 fill-current" />
                            <h3 className="font-black text-xs uppercase tracking-widest">AI Candidate Insights</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-white/60 p-3 rounded-lg border border-blue-100/50">
                                <p className="text-xs font-bold text-slate-700 leading-relaxed italic">
                                    "{candidate.aiInsights?.summary || 'Candidate displays strong technical aptitude in core domains. Recommended for technical interview rounds.'}"
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter mb-1">Key Strength</p>
                                    <p className="text-xs font-black text-emerald-900">{candidate.aiInsights?.strengths?.[0] || 'Technical depth'}</p>
                                </div>
                                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-[10px] font-bold text-amber-700 uppercase tracking-tighter mb-1">Growth Area</p>
                                    <p className="text-xs font-black text-amber-900">{candidate.aiInsights?.improvements?.[0] || 'Domain specifics'}</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Experience, Skills, Education */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Skills */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-blue-600" />
                                <h3 className="font-bold text-slate-900 uppercase tracking-tight">Core Competencies</h3>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {candidate.resume?.parsedData?.skills?.map((skill: string, i: number) => (
                                <Badge key={i} variant="info" className="bg-slate-50 border-slate-200 text-slate-700 font-bold px-3 py-1 text-[11px] rounded-full uppercase tracking-tight">
                                    {skill}
                                </Badge>
                            )) || <p className="text-slate-400 text-sm italic">No skills listed</p>}
                        </div>
                    </Card>

                    {/* Education */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                            <GraduationCap className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 uppercase tracking-tight">Education Background</h3>
                        </div>
                        <div className="space-y-6">
                            {candidate.resume?.parsedData?.education?.map((edu: any, i: number) => (
                                <div key={i} className="flex gap-4 group">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]"></div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{edu.degree}</h4>
                                        <p className="text-slate-600 text-xs font-bold mt-0.5">{edu.institution}</p>
                                        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">{edu.year}</p>
                                    </div>
                                </div>
                            )) || <p className="text-slate-400 text-sm italic">No education history available</p>}
                        </div>
                    </Card>

                    {/* Experience */}
                    <Card className="p-6 border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
                            <Briefcase className="w-5 h-5 text-blue-600" />
                            <h3 className="font-bold text-slate-900 uppercase tracking-tight">Professional Journey</h3>
                        </div>
                        <div className="space-y-8">
                            {candidate.resume?.parsedData?.experience?.map((exp: any, i: number) => (
                                <div key={i} className="relative pl-6 border-l border-slate-100 pb-2 last:border-0 last:pb-0">
                                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-white border-2 border-blue-500"></div>
                                    <div className="group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <h4 className="font-black text-slate-900 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{exp.role}</h4>
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-widest">{exp.duration}</span>
                                        </div>
                                        <p className="text-blue-600 text-xs font-black mt-1 uppercase tracking-tight">{exp.company}</p>
                                        <div className="mt-3 flex flex-wrap gap-1.5">
                                            {exp.technologies?.map((tech: string, j: number) => (
                                                <span key={j} className="text-[10px] font-bold text-slate-500 bg-slate-100/50 px-2 py-0.5 rounded uppercase tracking-tighter border border-slate-200/50">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )) || <p className="text-slate-400 text-sm italic">No professional experience listed</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
