import {defineConfig} from "vite";
import path from "path";

export default defineConfig({
    root: path.resolve(__dirname, "src"),
    base: "./",
    server: {
        // host: "127.0.0.1",
        port: 1923
    },
    build: {
        target: "ES2022",
        assetsDir: ".",
        outDir: path.resolve(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, "src/index.html")
        },
        chunkSizeWarningLimit: 4096
    }
});