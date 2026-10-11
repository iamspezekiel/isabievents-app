/**
 * Static platform constants — categories and Nigerian cities used for
 * filters, selects and event creation. This used to live in `mock-data.ts`;
 * it contains configuration only, never fake records.
 */

export const CATEGORIES = [
  { id: 'concerts', name: 'Concerts', icon: 'Music' },
  { id: 'festivals', name: 'Festivals', icon: 'Trophy' },
  { id: 'conferences', name: 'Conferences', icon: 'Mic2' },
  { id: 'nightlife', name: 'Nightlife', icon: 'GlassWater' },
  { id: 'sports', name: 'Sports', icon: 'Dribbble' },
  { id: 'religious', name: 'Religious Events', icon: 'Church' },
  { id: 'cultural', name: 'Cultural Events', icon: 'Palette' },
  { id: 'exhibitions', name: 'Exhibitions', icon: 'Images' },
  { id: 'workshops', name: 'Workshops', icon: 'Cpu' },
  { id: 'community', name: 'Community Events', icon: 'Users' },
  { id: 'technology', name: 'Technology', icon: 'Laptop' },
  { id: 'networking', name: 'Networking', icon: 'Network' },
  { id: 'health', name: 'Health & Wellness', icon: 'Activity' },
  { id: 'education', name: 'Education', icon: 'GraduationCap' },
  { id: 'charity', name: 'Charity & Causes', icon: 'HandHeart' },
];

export const CITIES = [
  'Aba', 'Abakaliki', 'Abeokuta', 'Abraka', 'Ado Ekiti', 'Afikpo', 'Ajah', 'Akure',
  'Asaba', 'Awka', 'Bauchi', 'Benin City', 'Birnin Kebbi', 'Biu', 'Bukuru', 'Calabar',
  'Damaturu', 'Dutse', 'Effurun', 'Ekpoma', 'Enugu', 'Gombe', 'Gusau', 'Ibadan',
  'Ife', 'Ijebu Ode', 'Ikare', 'Ikeja', 'Ikorodu', 'Ikot Ekpene', 'Ila', 'Ilorin',
  'Jalingo', 'Jos', 'Kaduna', 'Kano', 'Katsina', 'Keffi', 'Kogi', 'Lafia', 'Lagos',
  'Lokoja', 'Maiduguri', 'Makurdi', 'Minna', 'Mubi', 'Nnewi', 'Nsukka', 'Oghara',
  'Oka Akoko', 'Okitipupa', 'Onitsha', 'Oshogbo', 'Otukpo', 'Owerri', 'Owo', 'Oyo',
  'Port Harcourt', 'Sapele', 'Sokoto', 'Umuahia', 'Uyo', 'Warri', 'Yenagoa', 'Yola', 'Zaria'
].sort();

/** The 36 Nigerian states + FCT — used for the event location "State" field. */
export const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT (Abuja)', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
].sort();

/** How an event is hosted — physical (in-person), virtual (online), or hybrid. */
export const EVENT_MODES = [
  { id: 'physical', name: 'Physical', description: 'In-person at a venue' },
  { id: 'virtual', name: 'Virtual', description: 'Online via a stream link' },
  { id: 'hybrid', name: 'Hybrid', description: 'In-person and online' },
] as const;