// Tool argument schemas
export interface ListEmailsArgs {
  maxResults?: number;
  after?: string; // Date in YYYY/MM/DD format
  before?: string; // Date in YYYY/MM/DD format
  sender?: string; // Sender email address
  to?: string; // Recipient email address
  subject?: string; // Subject line text
  hasAttachment?: boolean; // Whether the email has attachments
  label?: string; // Gmail label name
}

export interface GetEmailArgs {
  messageId: string;
}

export interface GetDraftArgs {
  draftId: string;
}

export interface SearchEmailsArgs {
  query: string;
  maxResults?: number;
  after?: string; // Date in YYYY/MM/DD format
  before?: string; // Date in YYYY/MM/DD format
}

export interface SendEmailAIArgs {
  to: string; // Recipient email address(es). Multiple addresses can be comma-separated.
  userInstructions: string; // Instructions for AI to generate the email
  replyTo?: string; // Optional message ID to reply to
}

export interface SendEmailManualArgs {
  to: string; // Recipient email address(es). Multiple addresses can be comma-separated.
  subject?: string; // Email subject line, optional if replyTo is provided
  body: string; // Email body content
  cc?: string; // CC recipient email address(es)
  bcc?: string; // BCC recipient email address(es)
  isHtml?: boolean; // Whether the body content is HTML
  replyTo?: string; // Optional message ID to reply to
}

export interface CreateDraftAIArgs {
  to: string; // Recipient email address(es). Multiple addresses can be comma-separated.
  userInstructions: string; // Instructions for AI to generate the draft
  replyTo?: string; // Optional message ID to reply to
}

export interface EditDraftAIArgs {
  draftId: string; // The ID of the draft to edit
  userInstructions: string; // Instructions for AI to edit the draft
}

export interface ListDraftsArgs {
  maxResults?: number;
}

export interface DeleteDraftArgs {
  draftId: string;
}

export interface TrashMessageArgs {
  messageId: string;
}

export interface ListLabelsArgs {}
