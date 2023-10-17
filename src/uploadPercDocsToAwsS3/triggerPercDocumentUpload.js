import fileSystem from 'fs';
import { DOMParser } from 'xmldom';
import { uploadDocumentToAwsS3 } from './uploadDocumentToAwsS3.js'
import { generateExecutionLog } from './statusReport.js';

let documentReadCount = 0;
let documentUploadCount = 0;

const getFileFolderDetails = (rootFolderPath, rootPathOfUploadLog) => {
    const folderAssets = new Set();
    const documentAssets = new Set();
    const foldersAndFile = fileSystem.readdirSync(rootFolderPath)
    for (const asset of foldersAndFile) {
        const newAssetPath = `${rootFolderPath}/${asset}`;
        if (fileSystem.statSync(newAssetPath).isDirectory()) {
            folderAssets.add(newAssetPath);
        } else { 
            documentAssets.add(newAssetPath); documentReadCount += 1;
            console.log(`Document Read Count - ${documentReadCount}`);
            generateExecutionLog(rootPathOfUploadLog, `Document Read           : Count-${documentReadCount} | Path-${newAssetPath}`)
        }
    }
    return { folderAssets,  documentAssets }

};

const getMetaDataDetails = (documentAssetPath) => {
    const xmlStringData = fileSystem.readFileSync(documentAssetPath, "utf8");
    const responseXml = new DOMParser().parseFromString(xmlStringData);
    const content_id = responseXml.getElementsByTagName("ContentID")[0]?.firstChild?.data;
    const library_folder_id = responseXml.getElementsByTagName("LibraryFolderID")[0]?.firstChild?.data;
    return { content_id, library_folder_id }
};

const getDocumentContentPath = (documentAssetPath, metaDataTracker) => {
    const metaDataTrackerArray = [...metaDataTracker];
    const documentAssetPathWithoutXmlExtension = documentAssetPath.substr(0, documentAssetPath.length - 4);
    return metaDataTrackerArray[metaDataTrackerArray.findIndex((val) => val.includes(documentAssetPathWithoutXmlExtension))]
};

const getMetaDataForDocuments = (documentAssets) => {
    const documentAssetsWithMetaData = new Map();
    const metaDataTracker = new Set([...documentAssets]);
    for (const documentAssetPath of documentAssets) {
        if (documentAssetPath.includes('/@@@')) {
            documentAssetsWithMetaData.set(documentAssetPath, {});
            metaDataTracker.delete(documentAssetPath);
        } else if (documentAssetPath.includes('.xml')) {
            metaDataTracker.delete(documentAssetPath);
            documentAssetsWithMetaData.set(documentAssetPath, {});
            const metaData = getMetaDataDetails(documentAssetPath);
            const documentAssetContentPath = getDocumentContentPath(documentAssetPath, metaDataTracker)
            metaDataTracker.delete(documentAssetContentPath);
            documentAssetsWithMetaData.set(documentAssetContentPath, metaData);
        }
    }
    for (const pendingDocumentAssetPath of metaDataTracker) {
        documentAssetsWithMetaData.set(pendingDocumentAssetPath, {})
    }
    return documentAssetsWithMetaData;
};

const gatherFoldersAndFilesUpload = async (rootFolderPath, rootPathOfUploadLog) => {
    const { folderAssets,  documentAssets } = getFileFolderDetails(rootFolderPath, rootPathOfUploadLog);
    const documentAssetsWithMetaData = getMetaDataForDocuments(documentAssets);
    for (const [documentAssetPath, metaData] of documentAssetsWithMetaData) {
        documentUploadCount = await uploadDocumentToAwsS3(documentAssetPath, metaData, documentUploadCount, rootPathOfUploadLog);
    }
    for (const folder of folderAssets) {
        await gatherFoldersAndFilesUpload(folder, rootPathOfUploadLog);
    }
};

export const triggerPercDocumentUpload = (rootPathOfUploadLog) => {
    const startTime = new Date();
    gatherFoldersAndFilesUpload(process.env.UPLOAD_SOURCE_DOCUMENT_FOLDER, rootPathOfUploadLog);
    const endTime = new Date();
    generateExecutionLog(rootPathOfUploadLog, `log: PERC Documents extract execution start time ${startTime}`)
    generateExecutionLog(rootPathOfUploadLog, `log: PERC Documents extract execution end   time ${endTime}`)
}
