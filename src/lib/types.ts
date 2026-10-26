export interface Quote {
  id: string;
  book_id?: string;
  quote_text: string;
  page_number?: string;
  context?: string;
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  author: string;
  cover_url: string;
  accent_color: string; // Hex color for page background glow & buttons (e.g. #C85A32, #1C3B68)
  paws_rating: number; // 1.0 to 5.0
  paws_badge: string; // e.g. "Purr-fect Masterpiece", "Warm & Cozy Read", "Deep Intellectual Yarn"
  is_featured: boolean;
  categories: string[];
  blurb: string; // 1-2 sentence punchline / blurb
  review_content: string; // Full in-depth review
  read_time: string; // e.g. "5 min read"
  status: 'draft' | 'published';
  created_at: string;
  quotes?: Quote[];
}

export type BookFormData = Omit<Book, 'id' | 'created_at'> & {
  id?: string;
  created_at?: string;
};
