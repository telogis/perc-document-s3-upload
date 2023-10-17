import fileSystem from 'fs';

const generateErrorLog = (logFileRootPath, message) => {
    console.log('************************************************')
    console.log('   PERC Document Upload - Error Report         ')
    console.log('************************************************')
    fileSystem.appendFile(`${logFileRootPath}/@@@LogError.txt`, `\n ${message}`, error => { if (error) console.log(`Error writing in error log file : ${error}`) });
}

export const generateExecutionLog = (logFileRootPath, message, isError=false) => {    
    if (isError) generateErrorLog(logFileRootPath, message)
    else fileSystem.appendFile(`${logFileRootPath}/@@@LogExecution.txt`, `\n ${message}`, error => { if (error) generateErrorLog(logFileRootPath, `Error writing in execution log file - ${error}`) });
};