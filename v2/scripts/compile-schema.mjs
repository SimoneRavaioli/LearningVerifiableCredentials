import Ajv from 'ajv';
import standalone from 'ajv/dist/standalone/index.js';
import {readFile,writeFile} from 'node:fs/promises';
const schema=JSON.parse(await readFile(new URL('../profiles/openbadges/learning-passport-profile.schema.json',import.meta.url),'utf8'));
const ajv=new Ajv({allErrors:true,strict:true,strictTuples:false,strictRequired:false,code:{source:true,esm:true}});const validate=ajv.compile(schema);
let code=standalone(ajv,validate);code=code.replace(/const (\w+) = require\("ajv\/dist\/runtime\/ucs2length"\)\.default;/g,'import $1Module from "ajv/dist/runtime/ucs2length.js"; const $1=$1Module.default??$1Module;');
await writeFile(new URL('../profiles/generated-validator.mjs',import.meta.url),code);
