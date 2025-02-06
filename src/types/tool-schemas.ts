export interface SetupInterviewArgs {
  userProfile: {
    experience: string;
    skills: string[];
    education: string;
    targetRole: string;
    preferredCompany?: string;
  };
  interviewType: "technical" | "behavioral" | "system_design";
  duration?: number; // Interview duration in minutes
  difficultyLevel?: "entry" | "intermediate" | "senior" | "principal";
}

export interface ConductInterviewArgs {
  interviewId: string;
  candidateResponse?: string;
  currentQuestion?: number;
}

export interface ProvideFeedbackArgs {
  interviewId: string;
  interviewTranscript: string;
  evaluationCriteria: {
    technicalSkills?: boolean;
    problemSolving?: boolean;
    communication?: boolean;
    systemDesign?: boolean;
    behavioral?: boolean;
  };
}

export interface GetInterviewArgs {
  interviewId: string;
}

export interface ListInterviewsArgs {
  candidateId: string;
  status?: "scheduled" | "completed" | "in_progress";
  maxResults?: number;
}

export interface SaveInterviewArgs {
  interviewId: string;
  transcript: string;
  feedback?: string;
}

export interface ConfigureInterviewArgs {
  title: string; // Job title
  description: string; // Job description
  cv: string; // CV resource URI
  notes?: string; // Additional context/notes
}

export interface SummarizeCVArgs {
  cv: string;
}

export interface CVSummary {
  personalInfo: {
    name?: string;
    email?: string;
    location?: string;
    phoneNumber?: string;
    linkedIn?: string;
    portfolio?: string;
  };
  professionalSummary: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages?: string[];
  };
  workExperience: Array<{
    company: string;
    position: string;
    duration: {
      start: string;
      end: string;
    };
    highlights: string[];
    technologies: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
    relevantCourses?: string[];
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
    url?: string;
  }>;
  metadata: {
    yearsOfExperience: number;
    seniorityLevel: string;
    primaryDomain: string;
    keyTechnologies: string[];
    lastUpdated?: string;
  };
}
