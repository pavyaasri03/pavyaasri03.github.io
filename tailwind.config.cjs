module.exports = {
      content: ['./index.html', './portfolio.js'],
      theme: {
        extend: {
          colors: {
            bgBase: '#0C0D10',
            surface1: '#14161B',
            surface2: '#1C1F25',
            textMain: '#F0EFEA',
            textSec: '#B4B6BE',
            muted: '#969BA6',
            lines: '#30343D',
            accent: '#D7B77B',
            accentWash: 'rgba(215, 183, 123, 0.08)',
            success: '#9CC6B0',
            error: '#E8A19A',
            techHighlight: '#A9BBD6',
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            mono: ['"IBM Plex Mono"', 'monospace'],
          },
          spacing: {
            'gutter-desk': '64px',
            'gutter-mob': '24px',
            'section-desk': '160px',
            'section-mob': '80px',
          },
          maxWidth: {
            'content': '1200px',
          },
          borderRadius: {
            'std': '8px',
            'lg': '12px',
          },
        }
      }
    };
