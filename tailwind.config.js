/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/services/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Common spacing classes
    /^p-/, /^m-/, /^my-/, /^mx-/, /^mt-/, /^mb-/, /^ml-/, /^mr-/, /^py-/, /^px-/, /^pt-/, /^pb-/, /^pl-/, /^pr-/, 
    // Width and height classes
    /^w-/, /^h-/, /^min-w-/, /^min-h-/, /^max-w-/, /^max-h-/, /^size-/, 
    // Flex and grid classes
    /^flex-/, /^grid-/, /^gap-/, /^col-/, /^row-/, /^order-/, 
    // Display and position classes
    /^block$/, /^inline$/, /^flex$/, /^grid$/, /^hidden$/, /^absolute$/, /^relative$/, /^fixed$/, 
    // Color classes
    /^(bg|text|border|ring)-/, 
    // Border classes
    /^border-/, /^rounded/, 
    // Typography
    /^text-/, /^font-/, /^leading-/, /^tracking-/, 
    // Shadow and ring
    /^shadow-/, /^ring-/, 
    // Animation and transition
    /^animate-/, /^transition/, /^duration-/, /^ease-/, 
    // State variants
    /^hover:/, /^focus:/, /^active:/, /^group-hover:/, /^dark:/,
  ],
}