import { JSONSchema7 } from "json-schema";

export const INTERVIEW_SETUP_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    interviewId: {
      type: "string",
      description: "Unique identifier for the interview session",
    },
    interviewPlan: {
      type: "object",
      properties: {
        format: {
          type: "string",
          description: "Interview format (e.g., 'technical coding', 'system design discussion')",
        },
        duration: {
          type: "number",
          description: "Expected duration in minutes",
        },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Section title (e.g., 'Algorithm Problem', 'System Design Question')",
              },
              duration: {
                type: "number",
                description: "Expected duration for this section in minutes",
              },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question: {
                      type: "string",
                      description: "The interview question",
                    },
                    type: {
                      type: "string",
                      description: "Question type (e.g., 'coding', 'design', 'behavioral')",
                    },
                    difficulty: {
                      type: "string",
                      enum: ["easy", "medium", "hard"],
                    },
                    expectedDuration: {
                      type: "number",
                      description: "Expected time for this question in minutes",
                    },
                    evaluationCriteria: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "List of criteria to evaluate the answer",
                    },
                    hints: {
                      type: "array",
                      items: {
                        type: "string",
                      },
                      description: "Optional hints to provide if candidate struggles",
                    },
                  },
                  required: ["question", "type", "difficulty", "evaluationCriteria"],
                },
              },
            },
            required: ["title", "questions"],
          },
        },
      },
      required: ["format", "duration", "sections"],
    },
  },
  required: ["interviewId", "interviewPlan"],
};

export const INTERVIEW_CONDUCT_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    interviewId: {
      type: "string",
      description: "Interview session identifier",
    },
    response: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["question", "feedback", "hint", "clarification", "conclusion"],
          description: "Type of interviewer response",
        },
        content: {
          type: "string",
          description: "The interviewer's response or next question",
        },
        currentQuestion: {
          type: "number",
          description: "Current question number in the interview",
        },
        hints: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Available hints for the current question",
        },
        evaluationNotes: {
          type: "string",
          description: "Private notes for evaluation (not shown to candidate)",
        },
      },
      required: ["type", "content"],
    },
  },
  required: ["interviewId", "response"],
};

export const INTERVIEW_FEEDBACK_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    interviewId: {
      type: "string",
      description: "Interview session identifier",
    },
    feedback: {
      type: "object",
      properties: {
        overallRating: {
          type: "number",
          minimum: 1,
          maximum: 5,
          description: "Overall performance rating",
        },
        summary: {
          type: "string",
          description: "Brief summary of the interview performance",
        },
        strengths: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Key strengths demonstrated during the interview",
        },
        areasForImprovement: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Areas that need improvement",
        },
        technicalAssessment: {
          type: "object",
          properties: {
            problemSolving: {
              type: "number",
              description: "Rating for problem-solving skills",
            },
            technicalKnowledge: {
              type: "number",
              description: "Rating for technical knowledge",
            },
            codeQuality: {
              type: "number",
              description: "Rating for code quality (if applicable)",
            },
            systemDesign: {
              type: "number",
              description: "Rating for system design skills (if applicable)",
            },
          },
        },
        softSkillsAssessment: {
          type: "object",
          properties: {
            communication: {
              type: "number",
              description: "Rating for communication skills",
            },
            clarification: {
              type: "number",
              description: "Rating for asking clarifying questions",
            },
            problemBreakdown: {
              type: "number",
              description: "Rating for breaking down complex problems",
            },
          },
        },
        recommendations: {
          type: "array",
          items: {
            type: "string",
          },
          description: "Specific recommendations for improvement",
        },
      },
      required: ["overallRating", "summary", "strengths", "areasForImprovement", "recommendations"],
    },
  },
  required: ["interviewId", "feedback"],
};

export const INTERVIEW_CONFIGURE_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    interviewId: { type: "string" },
    metadata: {
      type: "object",
      properties: {
        candidateLevel: { type: "string" },
        totalQuestions: { type: "number" },
        targetRole: { type: "string" },
        candidateName: { type: "string" },
        createdAt: { type: "string" },
      },
      required: ["candidateLevel", "totalQuestions", "targetRole", "candidateName", "createdAt"],
    },
    systemPromptMetadata: {
      type: "object",
      properties: {
        prefix: {
          type: "string",
          pattern: "^[a-zA-Z_]+$",
          description: "Block prefix (only letters and underscores)",
        },
        title: {
          type: "string",
          maxLength: 100,
          description: "Title for the interview plan",
        },
        description: {
          type: "string",
          maxLength: 200,
          description: "Description of the interview plan",
        },
        tag: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[a-zA-Z_]+$",
          },
          minItems: 1,
        },
      },
      required: ["prefix", "title", "description", "tag"],
    },
    interviewPlan: {
      type: "object",
      properties: {
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              duration: { type: "number" },
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    difficulty: {
                      type: "string",
                      enum: ["easy", "medium", "hard"],
                    },
                    evaluationCriteria: {
                      type: "array",
                      items: { type: "string" },
                    },
                    expectedAnswers: {
                      type: "object",
                      properties: {
                        good: { type: "string" },
                        great: { type: "string" },
                        excellent: { type: "string" },
                      },
                      required: ["good", "great", "excellent"],
                    },
                    hints: {
                      type: "array",
                      items: { type: "string" },
                    },
                    relatedSkills: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "id",
                    "question",
                    "difficulty",
                    "evaluationCriteria",
                    "expectedAnswers",
                    "hints",
                    "relatedSkills",
                  ],
                },
              },
            },
            required: ["name", "description", "duration", "questions"],
          },
        },
        recommendations: {
          type: "object",
          properties: {
            areasToFocus: {
              type: "array",
              items: { type: "string" },
            },
            potentialGaps: {
              type: "array",
              items: { type: "string" },
            },
            interviewerNotes: { type: "string" },
          },
          required: ["areasToFocus", "potentialGaps", "interviewerNotes"],
        },
      },
      required: ["sections", "recommendations"],
    },
  },
  required: ["interviewId", "metadata", "systemPromptMetadata", "interviewPlan"],
};

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

export interface SystemPromptMetadata {
  prefix: string;
  title: string;
  description: string;
  tag: string[];
}

export interface InterviewPlanResponse {
  interviewId: string;
  metadata: {
    candidateLevel: string;
    totalQuestions: number;
    targetRole: string;
    candidateName: string;
    createdAt: string;
  };
  systemPromptMetadata: SystemPromptMetadata;
  interviewPlan: {
    sections: Array<{
      name: string;
      description: string;
      duration: number; // in minutes
      questions: Array<{
        id: string;
        question: string;
        difficulty: "easy" | "medium" | "hard";
        evaluationCriteria: string[];
        expectedAnswers: {
          good: string;
          great: string;
          excellent: string;
        };
        hints: string[];
        relatedSkills: string[];
      }>;
    }>;
    recommendations: {
      areasToFocus: string[];
      potentialGaps: string[];
      interviewerNotes: string;
    };
  };
}

export interface CVSummaryResponse {
  personalInfo: CVSummary["personalInfo"];
  professionalSummary: CVSummary["professionalSummary"];
  skills: CVSummary["skills"];
  workExperience: CVSummary["workExperience"];
  education: CVSummary["education"];
  projects?: CVSummary["projects"];
  certifications?: CVSummary["certifications"];
  metadata: CVSummary["metadata"];
  systemPromptMetadata: SystemPromptMetadata;
}

export const CV_SUMMARY_RESPONSE_SCHEMA: JSONSchema7 = {
  type: "object",
  properties: {
    personalInfo: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        location: { type: "string" },
        phoneNumber: { type: "string" },
        linkedIn: { type: "string" },
        portfolio: { type: "string" },
      },
    },
    professionalSummary: {
      type: "string",
      description: "Brief professional summary/objective",
    },
    skills: {
      type: "object",
      properties: {
        technical: {
          type: "array",
          items: { type: "string" },
        },
        soft: {
          type: "array",
          items: { type: "string" },
        },
        tools: {
          type: "array",
          items: { type: "string" },
        },
        languages: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["technical", "soft", "tools"],
    },
    workExperience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          position: { type: "string" },
          duration: {
            type: "object",
            properties: {
              start: { type: "string" },
              end: { type: "string" },
            },
            required: ["start", "end"],
          },
          highlights: {
            type: "array",
            items: { type: "string" },
          },
          technologies: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["company", "position", "duration", "highlights", "technologies"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          graduationDate: { type: "string" },
          gpa: { type: "string" },
          relevantCourses: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["institution", "degree", "field", "graduationDate"],
      },
    },
    projects: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          technologies: {
            type: "array",
            items: { type: "string" },
          },
          url: { type: "string" },
        },
        required: ["name", "description", "technologies"],
      },
    },
    metadata: {
      type: "object",
      properties: {
        yearsOfExperience: { type: "number" },
        seniorityLevel: { type: "string" },
        primaryDomain: { type: "string" },
        keyTechnologies: {
          type: "array",
          items: { type: "string" },
        },
        lastUpdated: { type: "string" },
      },
      required: ["yearsOfExperience", "seniorityLevel", "primaryDomain", "keyTechnologies"],
    },
    systemPromptMetadata: {
      type: "object",
      properties: {
        prefix: {
          type: "string",
          pattern: "^[a-zA-Z_]+$",
          description: "Block prefix (only letters and underscores)",
        },
        title: {
          type: "string",
          maxLength: 100,
          description: "Title for the CV summary",
        },
        description: {
          type: "string",
          maxLength: 200,
          description: "Description of the CV summary",
        },
        tag: {
          type: "array",
          items: {
            type: "string",
            pattern: "^[a-zA-Z_]+$",
          },
          minItems: 1,
        },
      },
      required: ["prefix", "title", "description", "tag"],
    },
  },
  required: [
    "personalInfo",
    "professionalSummary",
    "skills",
    "workExperience",
    "education",
    "metadata",
    "systemPromptMetadata",
  ],
};
