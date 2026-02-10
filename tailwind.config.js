// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
export default {
content: ["./index.html", "./src/**/*.{js,jsx}"],
theme: {
extend: {
colors: {
spotify: "#1DB954",
dark: "#121212",
dark2: "#181818",
},
},
},
plugins: [],
}