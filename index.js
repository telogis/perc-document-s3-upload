import path from 'path';
import { triggerProcess } from './src/main.js';

triggerProcess(process.env['run-mode'], path.resolve() );