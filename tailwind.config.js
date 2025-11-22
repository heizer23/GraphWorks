/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'blueprint-bg': '#0a0a0a',
                'blueprint-grid': '#1a1a1a',
                'blueprint-border': '#333333',
                'blueprint-text': '#e5e5e5',
            },
        },
    },
    plugins: [],
}
