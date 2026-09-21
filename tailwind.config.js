/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        margdarshak: {
          navy: {
            DEFAULT: '#2844A8',
            hover: '#1F368A',
            dark: '#162560',
            light: '#EEF2FF',
            border: '#C7D2FE',
          },
          saffron: {
            DEFAULT: '#CA7A00',
            hover: '#A96400',
            light: '#FEF3C7',
            border: '#FDE68A',
          },
          warm: {
            DEFAULT: '#FFF4E6',
            light: '#FFF9F2',
            border: '#FED7AA',
          }
        }
      }
    },
  },
  plugins: [],
}
