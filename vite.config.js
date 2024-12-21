import * as child from 'child_process';

const commitHash = child.execSync('git rev-parse --short HEAD').toString().trim();

/** @type {import('vite').UserConfig} */
export default {
    build: {
        outDir: './dist',
        assetsDir: '',
        manifest: false,
        minify: false, // comment to minify
        rollupOptions: {
            // overwrite default .html entry
            input: './src/main.ts',
            output: {
                dir: './dist',
                chunkFileNames: '[name].js',
                entryFileNames: '[name].js',
            },
        },
        watch: {
            buildDelay: 50,
        }
    },
    plugins: [
        {
            name: 'savebot-command',
            closeBundle: async () => {
                child.execSync(`cp ./dist/main.js ./bots/${commitHash}.js`);
                child.execSync('cp ./dist/main.js ./bots/latest.js');
            }
        }
    ],
};
