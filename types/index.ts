export interface Observation {
  id: string;
  timestamp: Date;
  location: string;
  project: string;
  company: string;
  exactLocationDescription: string;
  observationDetails: string;
  actionsTaken: string;
  severityLevel: string;
  category: string;
  attachments: string[];
  reporterName?: string;
  isAnonymous: boolean;
}