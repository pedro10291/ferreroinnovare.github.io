export interface Procedure {
  id: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  image?: string;
  category?: string;
  benefits?: string[];
  how_it_works?: string[];
  pre_care?: string[];
  post_care?: string[];
  important_information?: string[];
  contraindications?: string[];
  duration?: string;
  sessions?: string;
  interval?: string;
  price?: number;
  price_label?: string;
  maintenance?: string;
  result?: string;
  indication?: string;
  cta_label?: string;
  active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}
