export default {
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    "Inter",
                    "ui-sans-serif",
                    "system-ui",
                    "-apple-system",
                    "Segoe UI",
                    "Roboto",
                    "Noto Sans",
                    "Ubuntu",
                    "Cantarell",
                    "Helvetica Neue",
                    "Arial",
                    "Apple Color Emoji",
                    "Segoe UI Emoji",
                    "Segoe UI Symbol",
                ],
            },
            /* Paleta avermelhada (brand) */
            colors: {
                brand: {
                    DEFAULT: "#ef4444", // red-500
                    50: "#fef2f2",
                    100: "#fee2e2",
                    200: "#fecaca",
                    300: "#fca5a5",
                    400: "#f87171",
                    500: "#ef4444",
                    600: "#dc2626",
                    700: "#b91c1c",
                    800: "#991b1b",
                    900: "#7f1d1d",
                },
            },
            borderRadius: { "2xl": "1rem" },
            transitionTimingFunction: { gentle: "cubic-bezier(.22,1,.36,1)" },
        },
    },
    plugins: [],
};
