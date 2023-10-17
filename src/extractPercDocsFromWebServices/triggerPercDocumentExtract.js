import fileSystem from 'fs';
import base64 from 'file-base64';
import { generateErrorLog, generateExecutionLog, generateFinalExecutionReport } from './statusReport.js';
import { fetchQvidianAuthenticationToken, fetchPercFoldersList, fetchPercDocumentsList, fetchPercDocumentContentXml, fetchPercDocumentContentData } from './requests.js';


let endTime = '';
let startTime = '';
let newFolderCount = 0;
let logFileRootPath = '';
let newFolderXmlCount = 0;
let newDocumentXmlCount = 0;
let newDocumentContentXml = 0;
let newDocumentContentData = 0;
let __dirname = ''
let recordExtension = new Map();
let bundleFolderCount = 0;
let bundleDocumentCount = 0;

const getCurrentTimeStamp = () => {
    const currentDate = new Date();
    return "D" + currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate() + "_" + currentDate.getTime();
};

// Retrieve document xml response and save
const gatherPercDocumentContentXml = async (props, documentContentId, documentName) => {
    const { rootPath } = props
    const { success, documentContentErrorMessage, documentContentResponse, documentContentTitle } = await fetchPercDocumentContentXml({ ...props, documentContentId})
    if (success) {                
        const finalDocumentName = (documentName == null) ? documentContentTitle : documentName;
        fileSystem.writeFile(`${rootPath}/${finalDocumentName}.xml`, documentContentResponse, error => { 
            if (error) generateErrorLog({ fileError: `Document Content File Write Error ${rootPath}`, fileErrorMessage: error, logFileRootPath })
            else newDocumentXmlCount += 1;
        });
        newDocumentContentXml += 1;
        let logNewDocumentRootPath = `${rootPath}/${finalDocumentName}.xml`.replace(__dirname, '')
        generateExecutionLog(logFileRootPath, `log: Documents Content Xml Update ID: ${documentContentId} | count: ${newDocumentContentXml} | Path: ${logNewDocumentRootPath}`);
        console.log(`DOC: Count ${newDocumentContentXml} - ${logNewDocumentRootPath}`);
    } else generateErrorLog({ documentContentCallFailure: true, errorMessage: documentContentErrorMessage, logFileRootPath });
};

// Gather bundle documents
const gatherBundleDocuments = async (props, documentNameWithId) => {
    const { rootPath } = props
    const documentsIdListInBundle = await fileSystem.promises.readFile( `${rootPath}/${documentNameWithId}`, 'utf8')    
    if (documentsIdListInBundle) {
        const bundleFolderPath = `${rootPath}/${documentNameWithId.substring(0, documentNameWithId.lastIndexOf('.'))}_bundle`;        
        [...documentsIdListInBundle.split('\r\n')].map((documentContentId, index) => {
            if (index === 0) { 
                fileSystem.mkdirSync(bundleFolderPath);
                bundleFolderCount += 1;
            }
            if (documentContentId !== '') {
                gatherPercDocumentContentData({ ...props, rootPath: bundleFolderPath, }, documentContentId);
                bundleDocumentCount += 1;
            }
        })
    }     
}

// Retrieve document and save
const gatherPercDocumentContentData = async (props, documentContentId) => {
    const { rootPath } = props
    const { success, documentContentErrorMessage, documentContentData, documentName } = await fetchPercDocumentContentData({ ...props, documentContentId});
    if (success) {                
        const documentNameWithId = `${documentContentId}_${documentName}`
        await base64.decode(documentContentData, `${rootPath}/${documentNameWithId}`, async (error) => {
            if(error) generateErrorLog({ fileError: `Document Content Data File Write Error ${rootPath}\${documentName}`, fileErrorMessage: error, logFileRootPath })
            else {
                newDocumentContentData += 1;
                let logNewDocumentRootPath = `${rootPath}/${documentNameWithId}`.replace(__dirname, '')
                generateExecutionLog(logFileRootPath, `log: Documents Content Data Update ID: ${documentContentId} | count: ${newDocumentContentData} | Path: ${logNewDocumentRootPath}`);
                console.log(`DOC DATA: Count ${newDocumentContentData} - ${logNewDocumentRootPath}`);

                //Get extension of the file after writing
                const fileExtension = documentNameWithId.substring(documentNameWithId.lastIndexOf('.')+1);

                //Record the extension details in Set and capture the first file location
                if (!recordExtension.has(fileExtension)) {
                    console.log(`Extension: New extension ${fileExtension} - ${documentNameWithId}`);
                    recordExtension.set(fileExtension, documentNameWithId);
                }

                if (fileExtension === 'BNDL') await gatherBundleDocuments(props, documentNameWithId);
            }
        });

        return { documentName: documentNameWithId.substring(0, documentNameWithId.lastIndexOf('.')) };
    } else generateErrorLog({ documentContentCallFailure: true, errorMessage: documentContentErrorMessage, logFileRootPath });
    return { documentName: null }
};

// Check for all documents within parent folder and save document and its xml response
const gatherPercDocuments = async (props) => {
    const { rootPath } = props
    const { success, documentsErrorMessage, documentsDetails, documentsResponse } = await fetchPercDocumentsList(props);
    if (success) {
        fileSystem.writeFile(`${rootPath}/@@@documentsResponse.xml`, documentsResponse, error => { if (error) generateErrorLog({ fileError: `Documents File Write Error ${rootPath}`, fileErrorMessage: error, logFileRootPath }) });
        const { parentFolderID } = props;
        generateExecutionLog(logFileRootPath, `log: Documents Xml Update ID: ${parentFolderID}`);
        for (let writeDoc = 0; writeDoc < documentsDetails.length; writeDoc++) {
            const { documentContentId } = documentsDetails[writeDoc];
            const { documentName } = await gatherPercDocumentContentData(props, documentContentId);
            await gatherPercDocumentContentXml(props, documentContentId, documentName);
        }
    } else generateErrorLog({ documentCallFailure: true, errorMessage: documentsErrorMessage, logFileRootPath });
};

// Check for all folders within parent folder and create folder directories
const gatherPercFolders = async (props) => {    
    const { success, foldersErrorMessage, foldersDetails, foldersResponse } = await fetchPercFoldersList(props);
    if (success) {
        const { rootPath } = props
        fileSystem.writeFile(`${rootPath}/@@@foldersResponse.xml`, foldersResponse, error => { 
            if (error) generateErrorLog({ fileError: `Folders File Write Error ${rootPath}`, fileErrorMessage: error, logFileRootPath })
            else newFolderXmlCount += 1;
        });
        const { parentFolderID } = props;
        generateExecutionLog(logFileRootPath, `log: Folder Xml Update ID: ${parentFolderID}`);
        await gatherPercDocuments(props);
        for (let index = 0; index < foldersDetails.length; index++) {
            const { libraryFolderID, folderName } = foldersDetails[index];
            const newFolderRootPath = `${rootPath}/${folderName}`;
            fileSystem.mkdirSync(newFolderRootPath);
            newFolderCount += 1;
            let logNewFolderRootPath = newFolderRootPath; logNewFolderRootPath.replace(__dirname, '')
            generateExecutionLog(logFileRootPath, `log: Folder Create ID: ${libraryFolderID} | Folder Count: ${newFolderCount} | Path: ${logNewFolderRootPath}`);
            console.log(`FLD: Count ${newFolderCount} - ${logNewFolderRootPath}`);
            await gatherPercFolders({ ...props, parentFolderID: libraryFolderID, rootPath: newFolderRootPath })
        }
    } else generateErrorLog({ folderCallFailure: true, errorMessage: foldersErrorMessage, logFileRootPath });
};

// PERC Document extract process initialing point.
export const triggerPercDocumentExtract = async (__dirname_passed) => {
    __dirname = __dirname_passed;
    startTime = new Date();
    const executionStartTime = `log: PERC Documents extract execution start time ${startTime}`;
    // Retrieving authorization token
    const { success, AuthToken, LibraryURL, Message } = await fetchQvidianAuthenticationToken(process.env.EXTRACT_QVIDIAN_USER_ID, process.env.EXTRACT_QVIDIAN_PASSWORD);
    if (success) {
        const currentTimeStamp = getCurrentTimeStamp();
        const rootPath = `${__dirname}/PERC_${currentTimeStamp}`;
        fileSystem.mkdirSync(rootPath);
        logFileRootPath = rootPath;
        generateExecutionLog(logFileRootPath, executionStartTime);
        generateExecutionLog(logFileRootPath, `log: Folder ID: 1`);
        await gatherPercFolders({ AuthenticationToken: AuthToken, libraryUrlEndpoint: LibraryURL, parentFolderID: 1, rootPath });
    } else generateErrorLog({ authCallFailure: true, errorMessage: Message, logFileRootPath });
    endTime = new Date();

    recordExtension.forEach((extension, path) => {
        generateExecutionLog(logFileRootPath, `log: Unique file extension & location ${extension} - ${path}`);
    })

    generateExecutionLog(logFileRootPath, `log: PERC Documents extract execution end time ${endTime}`);
    generateFinalExecutionReport(logFileRootPath, startTime, endTime, newFolderCount, newDocumentContentXml, newDocumentContentData, newFolderXmlCount, newDocumentXmlCount, bundleDocumentCount, bundleFolderCount);
};
