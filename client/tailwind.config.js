/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pulse: {
          blue: '#3395FF',
          darkBlue: '#0B214A',
          deepNavy: '#081C3A',
          textPrimary: '#172B4D',
          textSecondary: '#64748B',
          textLight: '#94A3B8',
          bg: '#F7F9FC',
          white: '#FFFFFF',
          lightBlue: '#E8F3FF',
          blueBorder: '#CFE5FF',
          success: '#16A34A',
          successBg: '#ECFDF3',
          warning: '#F59E0B',
          warningBg: '#FFF7E6',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
          border: '#E5E7EB',
          aiAccent: '#4F46E5',
          aiLight: '#EEF2FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        cardHover: '0 10px 25px -5px rgba(11, 33, 74, 0.08), 0 8px 10px -6px rgba(11, 33, 74, 0.04)',
        dropdown: '0 12px 32px 0 rgba(11, 33, 74, 0.12)',
      },
      borderRadius: {
        'fintech': '14px',
      }
    },
  },
  plugins: [],
};
