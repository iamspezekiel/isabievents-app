
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
];

export const CITIES = [
  'Abakaliki',
  'Abeokuta',
  'Abuja',
  'Ado Ekiti',
  'Akure',
  'Asaba',
  'Awka',
  'Bauchi',
  'Benin City',
  'Birnin Kebbi',
  'Calabar',
  'Damaturu',
  'Dutse',
  'Enugu',
  'Gombe',
  'Gusau',
  'Ibadan',
  'Ilorin',
  'Ikeja',
  'Jalingo',
  'Jos',
  'Kaduna',
  'Kano',
  'Katsina',
  'Lafia',
  'Lagos',
  'Lokoja',
  'Maiduguri',
  'Makurdi',
  'Minna',
  'Onitsha',
  'Oshogbo',
  'Owerri',
  'Port Harcourt',
  'Sokoto',
  'Umuahia',
  'Uyo',
  'Warri',
  'Yenagoa',
  'Yola',
  'Zaria'
].sort();

export const MOCK_EVENTS = [
  {
    id: 'e1',
    title: 'Lagos Jazz Night 2024',
    category: 'concerts',
    city: 'Lagos',
    venue: 'Muson Center, Onikan',
    date: '2024-11-15T19:00:00',
    organizer: {
      name: 'Smooth Events',
      verified: true,
      avatar: 'https://picsum.photos/seed/org1/100/100'
    },
    image: 'https://picsum.photos/seed/jazz/800/600',
    description: 'Experience a night of soulful melodies and smooth rhythms in the heart of Lagos.',
    price: { min: 5000, max: 25000 },
    inventory: 500,
    tags: ['Live Music', 'Jazz', 'Networking']
  },
  {
    id: 'e2',
    title: 'Naija Tech Summit',
    category: 'conferences',
    city: 'Abuja',
    venue: 'ICC Abuja',
    date: '2024-12-05T09:00:00',
    organizer: {
      name: 'TechNigeria',
      verified: true,
      avatar: 'https://picsum.photos/seed/org2/100/100'
    },
    image: 'https://picsum.photos/seed/tech/800/600',
    description: 'The largest gathering of innovators, developers, and tech enthusiasts in Nigeria.',
    price: { min: 0, max: 15000 },
    inventory: 1200,
    tags: ['Tech', 'Innovation', 'Future']
  },
  {
    id: 'e3',
    title: 'Gidi Festival',
    category: 'festivals',
    city: 'Lagos',
    venue: 'Hard Rock Beach',
    date: '2024-12-28T12:00:00',
    organizer: {
      name: 'Eclipse Live',
      verified: true,
      avatar: 'https://picsum.photos/seed/org3/100/100'
    },
    image: 'https://picsum.photos/seed/gidi/800/600',
    description: 'A celebration of African culture, music, and arts on the beautiful shores of Lagos.',
    price: { min: 10000, max: 50000 },
    inventory: 5000,
    tags: ['Music', 'Beach', 'Vibes']
  },
  {
    id: 'e4',
    title: 'Calabar Carnival Main Parade',
    category: 'cultural',
    city: 'Calabar',
    venue: 'U.J. Esuene Stadium',
    date: '2024-12-27T08:00:00',
    organizer: {
      name: 'Cross River Tourism',
      verified: true,
      avatar: 'https://picsum.photos/seed/org4/100/100'
    },
    image: 'https://picsum.photos/seed/calabar/800/600',
    description: 'Africa\'s biggest street party. A display of heritage and creativity.',
    price: { min: 0, max: 0 },
    inventory: 20000,
    tags: ['Carnival', 'Culture', 'Free']
  }
];

export const MOCK_USER = {
  name: 'Tunde Afolayan',
  email: 'tunde@example.com',
  role: 'attendee',
  wallet: {
    active: 2,
    used: 1,
    transferred: 0
  }
};
