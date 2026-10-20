import { fileURLToPath, URL } from 'node:url';

import vue from '../frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs';
import { defineConfig } from '../frontend/node_modules/vite/dist/node/index.js';

const frontendRoot = fileURLToPath(new URL('../frontend', import.meta.url));
const backendTarget = process.env.VITE_BACKEND_TARGET ?? 'http://localhost:8080';
const frontendPort = Number(process.env.VITE_FRONTEND_PORT ?? 5173);

export default defineConfig({
    root: frontendRoot,
    cacheDir: fileURLToPath(new URL('./cache', import.meta.url)),
    plugins: [vue()],
    optimizeDeps: {
        noDiscovery: true,
        include: []
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('../frontend/src', import.meta.url))
        }
    },
    server: {
        open: true,
        port: frontendPort,
        proxy: {
            '/stage4': {
                target: backendTarget,
                changeOrigin: true
            }
        }
    },
    build: {
        sourcemap: false,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('vue') || id.includes('pinia')) {
                            return 'vue-vendor';
                        }
                        if (id.includes('axios')) {
                            return 'request-vendor';
                        }
                        if (id.includes('lucide-vue-next')) {
                            return 'icons-vendor';
                        }
                        return 'vendor';
                    }
                    return undefined;
                }
            }
        }
    }
});
