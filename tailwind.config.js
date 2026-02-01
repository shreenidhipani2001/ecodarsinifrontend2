// tailwind.config.js
module.exports = {
    theme: {
      extend: {
        animation: {
          gradient: 'gradient 4s ease-in-out infinite',
        },
        keyframes: {
          gradient: {
            '0%': { backgroundPosition: '0% 50%' },
            '50%': { backgroundPosition: '100% 50%' },
            '100%': { backgroundPosition: '0% 50%' },
          },
        },
      },
    },
  };
  