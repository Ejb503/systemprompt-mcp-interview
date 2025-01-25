// Tool argument schemas
export interface ListMessagesArgs {
  maxResults?: number;
  after?: string; // Date in YYYY/MM/DD format
  before?: string; // Date in YYYY/MM/DD format
  sender?: string; // Sender email address
  to?: string; // Recipient email address
  subject?: string; // Subject line text
  hasAttachment?: boolean; // Whether the email has attachments
  label?: string; // Gmail label name
}

export interface GetMessageArgs {
  messageId: string;
}

export interface SearchMessagesArgs {
  query: string;
  maxResults?: number;
  after?: string; // Date in YYYY/MM/DD format
  before?: string; // Date in YYYY/MM/DD format
}

export interface ListLabelsArgs {}

export interface SendEmailArgs {
  to: string; // Recipient email address(es). Multiple addresses can be comma-separated.
  subject: string; // Email subject line
  body: string; // Email body content
  cc?: string; // CC recipient email address(es)
  bcc?: string; // BCC recipient email address(es)
  isHtml?: boolean; // Whether the body content is HTML
}

export interface CreateDraftArgs extends SendEmailArgs {}

export interface ListDraftsArgs {
  maxResults?: number;
}

export interface DeleteDraftArgs {
  draftId: string;
}

export interface ListCalendarsArgs {}
