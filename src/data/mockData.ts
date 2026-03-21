import { Lead } from '../types/lead';

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Big Kahuna Burger',
    address: '123 Main St, Austin, TX 78701',
    contact: {
      email: ['info@bkburger.com', 'manager@bkburger.com'],
      phone: ['(512) 555-0199'],
      facebook: 'https://facebook.com/bkburger',
    },
    googleBusiness: {
      isClaimed: false,
      rating: 3.5,
      reviewCount: 45,
      category: 'Burger Restaurant',
    },
    techAudit: {
      hasWebsite: true,
      website: 'http://bkburger.com',
      cms: 'WordPress',
      pageSpeedScore: 32,
      isMobileOptimized: false,
      technologies: ['WordPress', 'Google Analytics', 'Facebook Pixel'],
    },
    opportunityScore: 8.5,
  },
  {
    id: '2',
    name: 'Los Pollos Hermanos',
    address: '456 Oak Ave, Albuquerque, NM',
    contact: {
      email: ['contact@lospollos.com'],
      phone: ['(505) 555-0100'],
      linkedin: 'https://linkedin.com/company/lospollos',
    },
    googleBusiness: {
      isClaimed: true,
      rating: 4.9,
      reviewCount: 1240,
      category: 'Fast Food Restaurant',
    },
    techAudit: {
      hasWebsite: true,
      website: 'https://lospollos.com',
      cms: 'React',
      pageSpeedScore: 92,
      isMobileOptimized: true,
      technologies: ['React', 'Next.js', 'Vercel', 'Tailwind'],
    },
    opportunityScore: 2.1,
  },
  {
    id: '3',
    name: 'Joe\'s Pizza',
    address: '789 Pine Ln, Brooklyn, NY',
    contact: {
      phone: ['(718) 555-0144'],
    },
    googleBusiness: {
      isClaimed: false,
      rating: 2.1,
      reviewCount: 12,
      category: 'Pizza Place',
    },
    techAudit: {
      hasWebsite: false,
      technologies: [],
    },
    opportunityScore: 9.2,
  },
  {
    id: '4',
    name: 'Sushi Zen',
    address: '321 Elm St, San Francisco, CA',
    contact: {
      email: ['hello@sushizen.net'],
      phone: ['(415) 555-0122'],
      linkedin: 'https://linkedin.com/company/sushizen',
    },
    googleBusiness: {
      isClaimed: true,
      rating: 4.0,
      reviewCount: 88,
      category: 'Sushi Restaurant',
    },
    techAudit: {
      hasWebsite: true,
      website: 'https://sushizen.net',
      cms: 'Shopify',
      pageSpeedScore: 58,
      isMobileOptimized: true,
      technologies: ['Shopify', 'Google Tag Manager'],
    },
    opportunityScore: 5.4,
  },
  {
    id: '5',
    name: 'Diner Deluxe',
    address: '654 Maple Dr, Seattle, WA',
    contact: {
      phone: ['(206) 555-0177'],
    },
    googleBusiness: {
      isClaimed: false,
      rating: 3.5,
      reviewCount: 30,
      category: 'Diner',
    },
    techAudit: {
      hasWebsite: false,
      technologies: [],
    },
    opportunityScore: 7.8,
  },
];
