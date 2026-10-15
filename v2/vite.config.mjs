import {defineConfig} from 'vite';
export default defineConfig({build:{target:'es2022',rollupOptions:{input:{main:'index.html',operator:'operator.html',poc:'poc.html'}}},server:{host:'127.0.0.1',port:4520,strictPort:true}});
