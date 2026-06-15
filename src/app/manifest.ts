
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IsabiEvents',
    short_name: 'Isabi',
    description: "Nigeria's Premier Ticket Marketplace",
    start_url: '/',
    display: 'standalone',
    background_color: '#16161D',
    theme_color: '#7E7CFF',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
