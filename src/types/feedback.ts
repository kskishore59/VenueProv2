export type FeedbackCategory = 'bug' | 'feature_request' | 'design' | 'other';

export interface Feedback {
  id: string;
  org_id: string | null;
  user_id: string | null;
  rating: number; // 1-5
  category: FeedbackCategory;
  message: string;
  created_at: string;
}
