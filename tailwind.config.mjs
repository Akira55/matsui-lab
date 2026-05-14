/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Blue-led pop palette — primary cobalt blue + supporting cyan/yellow + tiny pink accents.
        pop: {
          blue: '#2563eb',        // primary
          'blue-soft': '#dbeafe', // tinted background
          'blue-deep': '#1e3a8a', // ink-ish blue alt
          cyan: '#23d3e8',
          'cyan-soft': '#cbf3f8',
          yellow: '#ffd23f',
          'yellow-soft': '#fff3b3',
          purple: '#7c5cff',
          'purple-soft': '#e0d5ff',
          pink: '#ff5d8f',         // accent only
          'pink-soft': '#ffd6e3',
          ink: '#0b1d44',          // deep navy ink (was near-black)
          paper: '#f5fafe',        // soft blue-tinted paper
        },
      },
      fontFamily: {
        sans: [
          '"M PLUS Rounded 1c"',
          '"Kosugi Maru"',
          'Quicksand',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        display: [
          '"Bagel Fat One"',
          '"Hachi Maru Pop"',
          '"Yusei Magic"',
          'sans-serif',
        ],
        kana: ['"Hachi Maru Pop"', '"Yusei Magic"', 'sans-serif'],
        retro: ['"Reggae One"', '"Bungee"', 'sans-serif'],
      },
      boxShadow: {
        sticker: '6px 6px 0 0 #0b1d44',
        'sticker-sm': '4px 4px 0 0 #0b1d44',
        'sticker-blue': '6px 6px 0 0 #2563eb',
        'sticker-cyan': '6px 6px 0 0 #23d3e8',
        'sticker-yellow': '6px 6px 0 0 #ffd23f',
      },
      backgroundImage: {
        'gradient-pop':
          'linear-gradient(135deg, #dbeafe 0%, #cbf3f8 55%, #fff3b3 100%)',
        'gradient-sunset':
          'linear-gradient(135deg, #2563eb 0%, #7c5cff 55%, #23d3e8 100%)',
        'gradient-sky':
          'linear-gradient(180deg, #dbeafe 0%, #f5fafe 100%)',
        dots:
          'radial-gradient(circle, #0b1d44 1px, transparent 1.2px)',
      },
      backgroundSize: {
        dots: '14px 14px',
      },
      animation: {
        wiggle: 'wiggle 1.4s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        sparkle: 'sparkle 2.4s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'scale(1.25) rotate(20deg)', opacity: '0.7' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
