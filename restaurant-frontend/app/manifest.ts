import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Paeez 96 Restaurant',
        short_name: 'Paeez 96',
        description: 'Modern dining experience in Bandar Anzali',
        start_url: '/',
        display: 'standalone',
        background_color: '#F8F9FB',
        theme_color: '#F8F9FB',
        icons: [
            {
                src: '/icon.png',
                sizes: '192x192 512x512',
                type: 'image/png',
            },
        ],
    }
}
