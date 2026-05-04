export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  organization?: string;
}

export const testimonials: Testimonial[] = [];
