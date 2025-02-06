import { SamplingPrompt } from "../types/sampling.js";
import {
  INTERVIEW_CONFIGURE_INSTRUCTIONS,
  CV_ANALYSIS_INSTRUCTIONS,
  SYSTEM_PROMPT_METADATA_INSTRUCTIONS,
} from "./instructions.js";
import {
  INTERVIEW_CONFIGURE_RESPONSE_SCHEMA,
  CV_SUMMARY_RESPONSE_SCHEMA,
} from "../types/sampling-schemas.js";

// Configure Interview Prompt
export const CONFIGURE_INTERVIEW_PROMPT: SamplingPrompt = {
  name: "configure_interview",
  description: "Creates a structured interview plan based on CV and job description",
  arguments: [
    {
      name: "cv",
      description: "Candidate's CV summary",
      required: true,
    },
    {
      name: "title",
      description: "Job title",
      required: true,
    },
    {
      name: "description",
      description: "Job description",
      required: true,
    },
    {
      name: "notes",
      description: "Additional notes",
      required: false,
    },
  ],
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: `${INTERVIEW_CONFIGURE_INSTRUCTIONS}

${SYSTEM_PROMPT_METADATA_INSTRUCTIONS}`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Design a comprehensive interview plan based on the following:

CANDIDATE PROFILE:
{{cv}}

ROLE INFORMATION:
Position: {{title}}
Job Description: {{description}}
Additional Context: {{notes}}

Create a personalized interview plan that includes:
1. Analysis of role requirements and how they match candidate's experience
2. Multiple interview sections tailored to the role and candidate
3. Specific questions that probe both experience and role requirements
4. Clear evaluation criteria aligned with job expectations
5. Strategic hints for interviewers to guide deeper discussion
6. Areas to explore potential gaps between experience and requirements`,
      },
    },
  ],
  _meta: {
    callback: "configure_interview",
    responseSchema: INTERVIEW_CONFIGURE_RESPONSE_SCHEMA,
  },
};

// CV Summarization Prompt
export const SUMMARIZE_CV_PROMPT: SamplingPrompt = {
  name: "summarize_cv",
  description: "Extracts structured information from a CV in text format",
  arguments: [
    {
      name: "cv",
      description: "CV text content",
      required: true,
    },
  ],
  messages: [
    {
      role: "assistant",
      content: {
        type: "text",
        text: `${CV_ANALYSIS_INSTRUCTIONS}

${SYSTEM_PROMPT_METADATA_INSTRUCTIONS}`,
      },
    },
    {
      role: "user",
      content: {
        type: "text",
        text: `Please analyze and structure the following CV:

{{cv}}`,
      },
    },
  ],
  _meta: {
    callback: "summarize_cv",
    responseSchema: CV_SUMMARY_RESPONSE_SCHEMA,
  },
};

// Export all prompts
export const PROMPTS = [CONFIGURE_INTERVIEW_PROMPT, SUMMARIZE_CV_PROMPT];
