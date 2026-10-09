
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
  'Abakaliki', 'Abeokuta', 'Abuja', 'Ado Ekiti', 'Akure', 'Asaba', 'Awka', 'Bauchi',
  'Benin City', 'Birnin Kebbi', 'Calabar', 'Damaturu', 'Dutse', 'Enugu', 'Gombe',
  'Gusau', 'Ibadan', 'Ilorin', 'Ikeja', 'Jalingo', 'Jos', 'Kaduna', 'Kano', 'Katsina',
  'Lafia', 'Lagos', 'Lokoja', 'Maiduguri', 'Makurdi', 'Minna', 'Onitsha', 'Oshogbo',
  'Owerri', 'Port Harcourt', 'Sokoto', 'Umuahia', 'Uyo', 'Warri', 'Yenagoa', 'Yola', 'Zaria'
].sort();

export const MOCK_EVENTS = [
  {
    id: 'e1',
    slug: 'lagos-jazz-night-2026',
    title: 'Lagos Jazz Night 2026',
    category: 'concerts',
    city: 'Lagos',
    venue: 'Muson Center, Onikan',
    date: '2026-11-15T19:00:00',
    organizer: { name: 'Smooth Events', verified: true, avatar: 'https://picsum.photos/seed/org1/100/100' },
    image: 'https://picsum.photos/seed/jazz/800/600',
    description: 'Experience a night of soulful melodies and smooth rhythms in the heart of Lagos.',
    price: { min: 5000, max: 25000 },
    inventory: 500,
    tags: ['Live Music', 'Jazz', 'Networking']
  },
  {
    id: 'e2',
    slug: 'naija-tech-summit',
    title: 'Naija Tech Summit',
    category: 'conferences',
    city: 'Abuja',
    venue: 'ICC Abuja',
    date: '2026-12-05T09:00:00',
    organizer: { name: 'TechNigeria', verified: true, avatar: 'https://picsum.photos/seed/org2/100/100' },
    image: 'https://picsum.photos/seed/tech/800/600',
    description: 'The largest gathering of innovators, developers, and tech enthusiasts in Nigeria.',
    price: { min: 0, max: 15000 },
    inventory: 1200,
    tags: ['Tech', 'Innovation', 'Future']
  },
  {
    id: 'e3',
    slug: 'gidi-festival',
    title: 'Gidi Festival',
    category: 'festivals',
    city: 'Lagos',
    venue: 'Hard Rock Beach',
    date: '2026-12-28T12:00:00',
    organizer: { name: 'Eclipse Live', verified: true, avatar: 'https://picsum.photos/seed/org3/100/100' },
    image: 'https://picsum.photos/seed/gidi/800/600',
    description: 'A celebration of African culture, music, and arts on the beautiful shores of Lagos.',
    price: { min: 10000, max: 50000 },
    inventory: 5000,
    tags: ['Music', 'Beach', 'Vibes']
  },
  {
    id: 'e4',
    slug: 'calabar-carnival-main-parade',
    title: 'Calabar Carnival Main Parade',
    category: 'cultural',
    city: 'Calabar',
    venue: 'U.J. Esuene Stadium',
    date: '2026-12-27T08:00:00',
    organizer: { name: 'Cross River Tourism', verified: true, avatar: 'https://picsum.photos/seed/org4/100/100' },
    image: 'https://picsum.photos/seed/calabar/800/600',
    description: "Africa's biggest street party. A display of heritage and creativity.",
    price: { min: 0, max: 0 },
    inventory: 20000,
    tags: ['Carnival', 'Culture', 'Free']
  },
  {
    id: 'e5',
    slug: 'abuja-praise-festival',
    title: 'Abuja Praise Festival',
    category: 'religious',
    city: 'Abuja',
    venue: 'National Stadium, Abuja',
    date: '2026-12-10T17:00:00',
    organizer: { name: 'Faith Impact', verified: true, avatar: 'https://picsum.photos/seed/org5/100/100' },
    image: 'https://picsum.photos/seed/praise/800/600',
    description: 'A grand night of worship and gospel music featuring top Nigerian artists.',
    price: { min: 0, max: 0 },
    inventory: 15000,
    tags: ['Gospel', 'Worship', 'Free']
  },
  {
    id: 'e6',
    slug: 'ph-garden-city-food-fest',
    title: 'PH Garden City Food Fest',
    category: 'festivals',
    city: 'Port Harcourt',
    venue: 'Port Harcourt Polo Club',
    date: '2027-11-20T10:00:00',
    organizer: { name: 'Bole King', verified: true, avatar: 'https://picsum.photos/seed/org6/100/100' },
    image: 'https://picsum.photos/seed/food/800/600',
    description: 'Taste the best of Port Harcourt delicacies and international street food.',
    price: { min: 2000, max: 10000 },
    inventory: 2500,
    tags: ['Food', 'Bole', 'Culture']
  },
  {
    id: 'e7',
    slug: 'ibadan-night-fever',
    title: 'Ibadan Night Fever',
    category: 'nightlife',
    city: 'Ibadan',
    venue: 'Mauve 21 Event Centre',
    date: '2027-11-30T22:00:00',
    organizer: { name: 'IB Party People', verified: false, avatar: 'https://picsum.photos/seed/org7/100/100' },
    image: 'https://picsum.photos/seed/party/800/600',
    description: 'The ultimate nightlife experience in the ancient city. Vibes till dawn.',
    price: { min: 5000, max: 20000 },
    inventory: 400,
    tags: ['Nightlife', 'Clubbing', 'Vibes']
  },
  {
    id: 'e8',
    slug: 'kano-entrepreneurship-workshop',
    title: 'Kano Entrepreneurship Workshop',
    category: 'workshops',
    city: 'Kano',
    venue: 'Ado Bayero Mall',
    date: '2027-12-15T10:00:00',
    organizer: { name: 'Startup Kano', verified: true, avatar: 'https://picsum.photos/seed/org8/100/100' },
    image: 'https://picsum.photos/seed/workshop/800/600',
    description: 'Equipping the next generation of Northern entrepreneurs with digital skills.',
    price: { min: 2000, max: 5000 },
    inventory: 300,
    tags: ['Skills', 'Business', 'Training']
  },
  {
    id: 'e9',
    slug: 'enugu-coal-city-marathon',
    title: 'Enugu Coal City Marathon',
    category: 'sports',
    city: 'Enugu',
    venue: 'Nnamdi Azikiwe Stadium',
    date: '2027-12-20T06:30:00',
    organizer: { name: 'Enugu Sports Council', verified: true, avatar: 'https://picsum.photos/seed/org9/100/100' },
    image: 'https://picsum.photos/seed/marathon/800/600',
    description: 'Run for health and pride through the scenic hills of Enugu.',
    price: { min: 0, max: 0 },
    inventory: 5000,
    tags: ['Running', 'Fitness', 'Sports']
  },
  {
    id: 'e10',
    slug: 'benin-arts-culture-expo',
    title: 'Benin Arts & Culture Expo',
    category: 'cultural',
    city: 'Benin City',
    venue: 'Oba Akenzua Cultural Centre',
    date: '2027-12-12T09:00:00',
    organizer: { name: 'Edo State Heritage', verified: true, avatar: 'https://picsum.photos/seed/org10/100/100' },
    image: 'https://picsum.photos/seed/benin/800/600',
    description: 'A showcase of ancient Benin bronze casting and contemporary Edo arts.',
    price: { min: 1000, max: 5000 },
    inventory: 1000,
    tags: ['Art', 'History', 'Museum']
  }
];

export const MOCK_USER = {
  name: 'Sylvanus P. Ezekiel',
  email: 'attendee@isabievents.ng',
  whatsapp: '+2349024244140',
  role: 'attendee',
  wallet: { active: 2, used: 1, transferred: 0 }
};

export const MOCK_USERS = [
  {
    name: 'Admin Master',
    email: 'isabideveloper@gmail.com',
    whatsapp: '+2349024244140',
    password: 'Password123',
    role: 'admin',
    dashboard: '/dashboard/admin'
  },
  {
    name: 'Smooth Events',
    email: 'organizer@isabievents.ng',
    whatsapp: '+2349024244140',
    password: 'password123',
    role: 'organizer',
    dashboard: '/dashboard/organizer'
  },
  {
    name: 'Main Gate Staff',
    email: 'staff@isabievents.ng',
    whatsapp: '+2349024244140',
    password: 'password123',
    role: 'staff',
    dashboard: '/dashboard/staff'
  },
  {
    name: 'Cold Sips Drinks',
    email: 'vendor@isabievents.ng',
    whatsapp: '+2349024244140',
    password: 'password123',
    role: 'vendor',
    dashboard: '/dashboard/vendor'
  },
  {
    name: 'Sylvanus P. Ezekiel',
    email: 'attendee@isabievents.ng',
    whatsapp: '+2349024244140',
    password: 'password123',
    role: 'attendee',
    dashboard: '/dashboard/attendee'
  }
];
