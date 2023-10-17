import fileSystem from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateExecutionLog } from './statusReport.js';

const configureS3ClientInstance = () => {
    return new S3Client({
        credentials: {
            accessKeyId: process.env.UPLOAD_AWS__ACCESS_KEY,
            secretAccessKey: process.env.UPLOAD_AWS_SECRET_KEY
        },
        region: process.env.UPLOAD_AWS_BUCKET_REGION
    });
};

const getObjectParams = async (documentAssetPath, metaData) => {
    const documentToUpload = await fileSystem.promises.readFile(documentAssetPath);
    let uploadAssetPath = documentAssetPath.substr(process.env.UPLOAD_SOURCE_DOCUMENT_FOLDER.length + 1, documentAssetPath.length);
    const documentContentType = uploadAssetPath.substr(uploadAssetPath.lastIndexOf('.') + 1, uploadAssetPath.length);
    if (documentContentType === 'xml') {
        const splittedAssetValue = uploadAssetPath.split('/');
        splittedAssetValue.splice(splittedAssetValue.length - 1, 0, 'xmlResponses');
        uploadAssetPath = splittedAssetValue.join('/');
    }
    return {
        uploadAssetPath,
        objectParams: {
            Bucket: process.env.UPLOAD_S3_BUCKET_NAME,
            Key: uploadAssetPath,
            Body: documentToUpload,
            Metadata: metaData,
            ContentType: documentContentType
        }
    };
};

export const uploadDocumentToAwsS3 = async (documentAssetPath, metaData, documentUploadCount, rootPathOfUploadLog) => {
    try {
        const S3ClientInstance = configureS3ClientInstance();
        const { uploadAssetPath, objectParams } = await getObjectParams(documentAssetPath, metaData);
        const putObject = new PutObjectCommand(objectParams);
        await S3ClientInstance.send(putObject);
        const documentUploadCountLatest = documentUploadCount + 1
        console.log(`S3 Upload Completed - Count ${documentUploadCountLatest}- ${uploadAssetPath}`);
        generateExecutionLog(rootPathOfUploadLog, `Document Upload Success : Count-${documentUploadCountLatest} | Path-${uploadAssetPath}`);
        return documentUploadCountLatest;
    } catch(error) {
        console.log(`***Error Uploading File To S3 Bucket - ${error}\nDetails: ${documentAssetPath} - ${metaData}`);
        generateExecutionLog(rootPathOfUploadLog, `Document Upload Failure : After Count-${documentUploadCount} | Path-${documentAssetPath} | error-${error}`, true);
        return documentUploadCount;
    }
}