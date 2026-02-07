export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  role: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  experience: string;
  location: string;
  status: 'draft' | 'active' | 'closed';
  createdAt: string;
  applicantsCount: number;
  assessmentId?: string;
}

export interface Assessment {
  _id: string;
  jobId: string;
  title: string;
  duration: number;
  questions: Question[];
  config: {
    objectiveWeight: number;
    subjectiveWeight: number;
    codingWeight: number;
    passingScore: number;
  };
  status: 'draft' | 'published';
}

export interface Question {
  _id: string;
  type: 'objective' | 'subjective' | 'coding';
  text: string;
  skill: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  points: number;
  options?: string[];
  correctAnswer?: string;
}

export interface Application {
  _id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  status: 'pending' | 'completed' | 'shortlisted' | 'rejected';
  totalScore: number;
  rank?: number;
  percentile?: number;
  submittedAt?: string;
}

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  completedApplications: number;
  avgScore: number;
  recentApplications: Application[];
}
