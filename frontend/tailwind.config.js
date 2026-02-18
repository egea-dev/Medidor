/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            colors: {
                brand: {
                    50: '#FDF4F5',
                    100: '#FBE8EB',
                    200: '#F6D0D8',
                    300: '#EEAAB9',
                    400: '#E47D93',
                    500: '#803746',
                    600: '#6D2E3B',
                    700: '#5A2530',
                    800: '#481D26',
                    900: '#3B1820',
                },
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 0.4s ease-out forwards',
            },
        },
    },
    plugins: [],
};
