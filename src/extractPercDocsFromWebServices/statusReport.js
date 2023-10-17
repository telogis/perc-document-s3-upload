import fileSystem from 'fs';

const writeErrorLog = (logFileRootPath, message) => {
    fileSystem.appendFile(`${logFileRootPath}/@@@LogError.txt`, `\n ${message}`, error => { if (error) generateErrorLog({ fileError: `Error writing in error log file`, fileErrorMessage: error }) });
};

export const generateErrorLog = (statusValues) => {
    const { authCallFailure=false, folderCallFailure=false, documentCallFailure=false, documentContentCallFailure=false, errorMessage="", fileError=null, fileErrorMessage="", logFileRootPath } = statusValues;
    
    console.log('************************************************')
    console.log('   PERC Document Extract - Error Report         ')
    console.log('************************************************')
    let logMessage = ''
    if (authCallFailure) {
        logMessage = ` Authentication Call Failure ${errorMessage} `;
    }
    if (folderCallFailure) {
        logMessage = ` Folder API Failure ${errorMessage} `
    }
    if (documentCallFailure) {
        logMessage = ` Document API Failure ${errorMessage} `
    }
    if (documentContentCallFailure) {
        logMessage = ` Document Content API Failure ${errorMessage} `
    }
    if (fileError) {
        logMessage = fileError
    }
    console.log(logMessage);
    writeErrorLog(logFileRootPath, logMessage)
}

export const generateExecutionLog = (logFileRootPath, message) => {
    fileSystem.appendFile(`${logFileRootPath}/@@@LogExecution.txt`, `\n ${message}`, error => { if (error) generateErrorLog({ fileError: `Error writing in execution log file`, fileErrorMessage: error }) });
};

export const generateFinalExecutionReport = (logFileRootPath, startTime, endTime, newFolderCount, newDocumentContentXml, newDocumentContentData, newFolderXmlCount, newDocumentXmlCount, bundleDocumentCount, bundleFolderCount) => {
    fileSystem.appendFile(`${logFileRootPath}/@@@LogFinalReport.txt`,
        `Execution Start Time                        : ${startTime}
       \nExecution End Time                          : ${endTime}
       \n---------------------------------------------------------------------------
       \nTotal New Folders Created                   : ${newFolderCount}
       \nTotal New Bundle Folders Created            : ${bundleFolderCount}
       \n---------------------------------------------------------------------------
       \nTotal New Folder XML Files Count            : ${newFolderXmlCount}
       \nTotal New Document XML Files Count          : ${newDocumentXmlCount}
       \nTotal New Document Content XML Files Count  : ${newDocumentContentXml}
       \nTotal New Document Content Data Files Count : ${newDocumentContentData}
       \nTotal New Bundle Document Data Files Count  : ${bundleDocumentCount}
       \n---------------------------------------------------------------------------
       \nTotal Documents Count                       : ${newFolderXmlCount + newDocumentXmlCount + newDocumentContentXml + newDocumentContentData}`,
        error => { if (error) generateErrorLog({ fileError: `Error writing in final execution log file`, fileErrorMessage: error }) });
}