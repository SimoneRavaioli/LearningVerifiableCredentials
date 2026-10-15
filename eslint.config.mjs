import js from '@eslint/js';
import globals from 'globals';
export default [
 {ignores:['node_modules/**','dist/**','research/**','evidence/**','.data/**']},
 js.configs.recommended,
 {files:['**/*.mjs'],languageOptions:{globals:globals.node},rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}},
 {files:['src/*.jsx'],languageOptions:{parserOptions:{ecmaVersion:'latest',sourceType:'module',ecmaFeatures:{jsx:true}},globals:globals.browser},rules:{'no-unused-vars':'off','no-undef':'error'}}
];
