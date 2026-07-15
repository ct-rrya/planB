/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Color Palette - Enhanced for visibility
        primary: {
          DEFAULT: '#0A2947',
          50: '#E6EBF1',
          100: '#C2D0E0',
          200: '#9DB4CE',
          300: '#7999BD',
          400: '#547DAB',
          500: '#0A2947',
          600: '#0F3A5F', // Much lighter for better hover visibility
          700: '#061931',
          800: '#04152A',
          900: '#020A1B',
        },
        background: {
          DEFAULT: '#F5F5F5', // Clean light gray
          50: '#FEFEFE',
          100: '#FDFDFD',
          200: '#FAFAFA',
          300: '#F7F7F7',
          400: '#F5F5F5',
          500: '#F0F0F0',
          600: '#EBEBEB',
          700: '#E6E6E6',
          800: '#E1E1E1',
          900: '#DCDCDC',
        },
        secondary: {
          DEFAULT: '#D3D4C0',
          50: '#F7F7F4',
          100: '#EEEEE8',
          200: '#E4E5DB',
          300: '#DBDCCE',
          400: '#D3D4C0',
          500: '#C0C2A9',
          600: '#ADB092',
          700: '#9A9E7B',
          800: '#878C64',
          900: '#747A4D',
        },
        accent: {
          DEFAULT: '#8B5E3C',
          50: '#F5EDE6',
          100: '#E8D5C6',
          200: '#DBBDA6',
          300: '#CEA586',
          400: '#C18D66',
          500: '#8B5E3C',
          600: '#A37047', // Lighter for better hover visibility
          700: '#734E31',
          800: '#432E1D',
          900: '#2B1E13',
        },
        // Status colors - enhanced visibility
        status: {
          pending: '#D97706',
          approved: '#3B82F6',
          ready: '#8B5AEC',
          released: '#10B981',
          rejected: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(10, 41, 71, 0.08)',
        'elevated': '0 4px 16px rgba(10, 41, 71, 0.12)',
        'card': '0 1px 3px rgba(10, 41, 71, 0.1)',
      },
      borderRadius: {
        'card': '12px',
      },
    },
  },
  plugins: [],
}
