// ============================================================
// Recruiter AI v0.1 — TypeScript Type Definitions
// ============================================================

// --- Enums & Status Types ---

export type CandidateStatus =
  | 'new'
  | 'ai_analyzing'
  | 'needs_clarification'
  | 'screening_done'
  | 'interview_scheduled'
  | 'interview_done'
  | 'final_interview'
  | 'recommended'
  | 'needs_hr_decision'
  | 'postponed'
  | 'rejected';

export type CandidateDecision =
  | 'recommend_hire'
  | 'invite_final_interview'
  | 'request_info'
  | 'postpone'
  | 'reject';

export type VacancyStatus =
  | 'active'
  | 'paused'
  | 'draft'
  | 'closed'
  | 'completed';

export type AIActivityStatus =
  | 'completed'
  | 'in_progress'
  | 'waiting'
  | 'needs_hr'
  | 'needs_clarification'
  | 'error';

export type RecruitmentStage =
  | 'vacancy_analyzed'
  | 'criteria_formed'
  | 'candidates_received'
  | 'resumes_processed'
  | 'screening_in_progress'
  | 'interviews_done'
  | 'shortlist_forming';

export type IntegrationStatus =
  | 'planned'
  | 'demo'
  | 'unavailable';

export type WorkFormat = 'office' | 'remote' | 'hybrid';

export type InterviewFormat = 'text' | 'voice' | 'video';

export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export type ActivityEventType =
  | 'candidate_received'
  | 'resume_processed'
  | 'analysis_formed'
  | 'missing_info_detected'
  | 'question_prepared'
  | 'question_sent'
  | 'response_received'
  | 'screening_completed'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'report_formed'
  | 'hr_decision_needed'
  | 'hr_decision_recorded'
  | 'task_paused'
  | 'task_resumed';

// --- Core Interfaces ---

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  city: string;
  logo?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar?: string;
  company: Company;
}

export interface Vacancy {
  id: string;
  title: string;
  status: VacancyStatus;
  department: string;
  workFormat: WorkFormat;
  city: string;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  experience: string;
  headcount: number;
  createdAt: string;
  updatedAt: string;
  responsiblePerson: string;
  candidatesTotal: number;
  candidatesProcessed: number;
  candidatesShortlisted: number;
  currentStage: RecruitmentStage;
  lastAIAction: string;
  aiProfile?: AIProfile;
}

export interface AIProfile {
  keyExperience: string[];
  requiredCriteria: string[];
  preferredCompetencies: string[];
  screeningQuestions: string[];
  infoToVerify: string[];
  hrHandoffCriteria: string[];
}

export interface Candidate {
  id: string;
  name: string;
  currentPosition: string;
  experience: string;
  city: string;
  source: string;
  vacancyId: string;
  vacancyTitle: string;
  status: CandidateStatus;
  stage: RecruitmentStage;
  aiSummary: string;
  lastAction: string;
  updatedAt: string;
  desiredSalary?: number;
  phone: string;
  email: string;
  resume: CandidateResume;
  aiAnalysis: AIAnalysis;
  messages: Message[];
  files: CandidateFile[];
  history: HistoryEvent[];
  hrDecision?: HRDecisionRecord;
}

export interface CandidateResume {
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: string[];
  additional: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  period: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

export interface AIAnalysis {
  professionalSummary: string;
  confirmedRequirements: string[];
  partialMatch: string[];
  missingRequirements: string[];
  strengths: string[];
  risks: string[];
  toVerify: string[];
  interviewQuestions: string[];
  recommendation: string;
  evidenceFromResume: string[];
  humanDecisionNote: string;
}

export interface AIRecommendation {
  text: string;
  type: 'consider' | 'clarify' | 'risk' | 'verified' | 'insufficient_data';
}

export interface Message {
  id: string;
  sender: 'ai' | 'candidate' | 'system' | 'hr_required';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface CandidateFile {
  id: string;
  name: string;
  type: string;
  size: string;
  addedAt: string;
  source: string;
}

export interface HistoryEvent {
  id: string;
  event: string;
  description: string;
  timestamp: string;
  type: ActivityEventType;
}

export interface HRDecisionRecord {
  id: string;
  decision: CandidateDecision;
  label: string;
  comment: string;
  decidedAt: string;
  decidedBy: string;
}

export interface InterviewReport {
  summary: string;
  strengths: string[];
  risks: string[];
  topicsToVerify: string[];
  recommendation: string;
  completedAt: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  vacancyId: string;
  vacancyTitle: string;
  date: string;
  format: InterviewFormat;
  status: InterviewStatus;
  questionsCount: number;
  responsiblePerson: string;
  shortResult: string;
  questions: InterviewQuestion[];
  report?: InterviewReport;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  answer: string;
  analysis: string;
  keyFacts: string[];
  topicsToVerify: string[];
}

export interface AIActivity {
  id: string;
  type: ActivityEventType;
  title: string;
  description: string;
  timestamp: string;
  vacancyId?: string;
  vacancyTitle?: string;
  candidateId?: string;
  candidateName?: string;
  status: AIActivityStatus;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: IntegrationStatus;
  icon: string;
  category: string;
}

export interface AnalyticsData {
  candidatesByStage: { stage: string; count: number }[];
  processingSpeed: { date: string; count: number }[];
  screeningsCompleted: number;
  interviewsCompleted: number;
  candidatesPassedToHR: number;
  vacanciesInProgress: number;
  timeSaved: string;
  activityByVacancy: { vacancy: string; count: number }[];
  hrDecisions: number;
  sourceDistribution: { source: string; count: number }[];
  funnelData: { stage: string; count: number }[];
}

// --- Form Types ---

export interface VacancyFormData {
  title: string;
  department: string;
  headcount: number;
  city: string;
  workFormat: WorkFormat;
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  responsibilities: string;
  additionalComments: string;
  requiredSkills: string;
  preferredSkills: string;
  experience: string;
  professionalSkills: string;
  aiGoal: string;
  aiQuestions: string;
  hrConfirmations: string;
  screeningFormat: string;
}

// --- App State ---

export interface AppState {
  vacancies: Vacancy[];
  candidates: Candidate[];
  interviews: Interview[];
  activities: AIActivity[];
  user: UserProfile;
  company: Company;
}