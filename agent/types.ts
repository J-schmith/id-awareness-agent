export interface ResearchResult {
  name: string;
  date: string;
  themeLabel: string;
  sourceUrl: string;
  description: string;
  confidence: "high" | "medium" | "low";
}

export interface DraftResult {
  subject: string;
  body: string;
  sourcesCited: string[];
}

export interface AgentRunResult {
  daysDiscovered: ResearchResult[];
  draftsGenerated: number;
  errors: string[];
}
