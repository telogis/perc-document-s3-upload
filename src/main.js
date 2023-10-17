import path from 'path';
import dotenv from 'dotenv';
import fileSystem from 'fs';
import { triggerPercDocumentUpload } from './uploadPercDocsToAwsS3/triggerPercDocumentUpload.js';
import { triggerPercDocumentExtract } from './extractPercDocsFromWebServices/triggerPercDocumentExtract.js';

export const triggerProcess = (runMode, __dirname) => {
    dotenv.config();
    if (runMode.includes('perc-extract')) {
        const rootPath = `${__dirname}/extract`;
        if (!fileSystem.existsSync(rootPath)) fileSystem.mkdirSync(rootPath);
        triggerPercDocumentExtract(path.resolve(rootPath));
    }  if (runMode.includes('perc-upload')) {
        const rootPath = `${__dirname}/upload`;
        if (!fileSystem.existsSync(rootPath)) fileSystem.mkdirSync(rootPath);
        triggerPercDocumentUpload(path.resolve(rootPath));
    }
};
