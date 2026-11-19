import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const gatewayTarget = env.VITE_GATEWAY_TARGET || 'http://127.0.0.1:9000';

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            }
        },
        server: {
            port: 5175,
            proxy: {
                '/api': {
                    target: gatewayTarget,
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
                            if (id.includes('vue')) {
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
    };
});
