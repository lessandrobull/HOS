import { defineConfig } from 'vite'

export default defineConfig({
    server: {
        host: true,
        hmr: {
            clientPort: 5173,
        },
    },
})