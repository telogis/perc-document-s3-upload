import { DOMParser } from 'xmldom';
import { CONSTANTS } from './constants.js';
import { getQvidianAuthenticationPayload, getFoldersList, getDocumentsList, getDocumentContentXml, getDocumentContentData } from './requestPayloads.js';

const { ENDPOINT_QVIDIAN, AUTH_HEADERS, FOLDER_HEADERS, DOCUMENT_HEADERS, DOCUMENT_CONTENT_XML_HEADERS, DOCUMENT_CONTENT_DATA_HEADERS } = CONSTANTS;

// API call for getting authorization token [Connect]
export const fetchQvidianAuthenticationToken = async (userId, password) => {
    const payload = getQvidianAuthenticationPayload(userId, password);
    const response = await fetch(ENDPOINT_QVIDIAN, 
        { body: payload, method: "POST", headers: AUTH_HEADERS }, payload).then((response) => response.text().then((response) => response));
    const responseXml = new DOMParser().parseFromString(response);
    const Error = responseXml.getElementsByTagName("Error")[0]?.firstChild?.data;
    const Message = responseXml.getElementsByTagName("Message")[0]?.firstChild?.data;
    const AuthToken = responseXml.getElementsByTagName("AuthToken")[0]?.firstChild?.data;
    const LibraryURL = responseXml.getElementsByTagName("LibraryURL")[0]?.firstChild?.data;
    if (Error === undefined) return { success: true, Message: null, AuthToken, LibraryURL };
    else return { success: false, Message, AuthToken, LibraryURL };
}

const parseFoldersResponse = (response) => {
    const responseXml = new DOMParser().parseFromString(response);
    const Error = responseXml.getElementsByTagName("Error")[0]?.firstChild?.data;
    const Message = responseXml.getElementsByTagName("Message")[0]?.firstChild?.data;
    let foldersDetails = [];
    const foldersIds = responseXml.getElementsByTagName("LibraryFolderID");
    for (let index = 0; index<foldersIds.length; index++) {
        const title = responseXml.getElementsByTagName("Title")[index]?.firstChild?.data;
        const libraryFolderID = responseXml.getElementsByTagName("LibraryFolderID")[index]?.firstChild?.data;
        const libraryParentFolderID = responseXml.getElementsByTagName("LibraryParentFolderID")[index]?.firstChild?.data;
        let folderName = title.replace(/[/\:*?"<>|]/g, ' ');
        folderName = (folderName.length > 200) ? `${folderName.substr(1,20)}__trimedName__RandomNum${Math.floor( Math.random()*99999 ) + 10000}` : folderName;
        foldersDetails[index] = { libraryFolderID, libraryParentFolderID, folderName };
    }
    return { Error, Message, foldersDetails };
};

// API call to get folder details [libraryFoldersGetList]
export const fetchPercFoldersList = async ({ AuthenticationToken, libraryUrlEndpoint, parentFolderID }) => {
    try {
        const payload = getFoldersList(AuthenticationToken, parentFolderID);
        const response = await fetch(libraryUrlEndpoint, 
            { body: payload, method: "POST", headers: FOLDER_HEADERS }, payload).then((response) => response.text().then((response) => response));
        const { Error, Message, foldersDetails } = parseFoldersResponse(response);
        if (Error === undefined) return { success: true, foldersErrorMessage: null, foldersDetails, foldersResponse: response };
        else return { success: false, foldersErrorMessage: Message, foldersDetails, foldersResponse: response };
    } catch (error) {
        console.log(`*****Error executing fetchPercFoldersList - ${error}`);
    }

};

const parseDocumentsResponse = (response) => {
    const responseXml = new DOMParser().parseFromString(response);
    const Error = responseXml.getElementsByTagName("Error")[0]?.firstChild?.data;
    const Message = responseXml.getElementsByTagName("Message")[0]?.firstChild?.data;
    let documentsDetails = [];
    const contents = responseXml.getElementsByTagName("Content");
    for (let index = 0; index<contents.length; index++) {
        const documentContentId = contents[index].getElementsByTagName("ContentID")[0]?.firstChild?.data;
        documentsDetails[index] = { documentContentId }
    }
    return { Error, Message, documentsDetails };
};

// API call to get document list response [libraryFolderContentGetList]
export const fetchPercDocumentsList = async ({ AuthenticationToken, libraryUrlEndpoint, parentFolderID }) => {
    try {
        const payload = getDocumentsList(AuthenticationToken, parentFolderID);
        const response = await fetch(libraryUrlEndpoint, 
            { body: payload, method: "POST", headers: DOCUMENT_HEADERS }, payload).then((response) => response.text().then((response) => response));
        const { Error, Message, documentsDetails } = parseDocumentsResponse(response);
        if (Error === undefined) return { success: true, documentsErrorMessage: null, documentsDetails, documentsResponse: response };
        else return { success: false, documentsErrorMessage: Message, documentsDetails, documentsResponse: response };
    } catch (error) {
        console.log(`*****Error executing fetchPercDocumentsList - ${error}`);
    }

};

const parseDocumentContentDataResponse = (response) => {
    const responseXml = new DOMParser().parseFromString(response);
    const Error = responseXml.getElementsByTagName("Error")[0]?.firstChild?.data;
    const Message = responseXml.getElementsByTagName("Message")[0]?.firstChild?.data;
    const documentName = responseXml.getElementsByTagName("fileName")[0]?.firstChild?.data;
    const documentContentData = responseXml.getElementsByTagName("fileContent")[0]?.firstChild?.data;
    return { Error, Message, documentName, documentContentData };
};

// API call to get document content data response [libraryContentGet]
export const fetchPercDocumentContentData = async ({ AuthenticationToken, libraryUrlEndpoint, documentContentId }) => {
    try {
        const payload = getDocumentContentData(AuthenticationToken, documentContentId);
        const response = await fetch(libraryUrlEndpoint, 
            { body: payload, method: "POST", headers: DOCUMENT_CONTENT_DATA_HEADERS }, payload).then((response) => response.text().then((response) => response));
        const { Error, Message, documentName, documentContentData } = parseDocumentContentDataResponse(response);
        if (Error === undefined) return { success: true, documentContentErrorMessage: null, documentName, documentContentData };
        else return { success: false, documentContentErrorMessage: Message, documentName, documentContentData  };
    } catch (error) {
        console.log(`*****Error executing fetchPercDocumentContentData - ${error}`);
    }

};

const parseDocumentContentXmlResponse = (response) => {
    const responseXml = new DOMParser().parseFromString(response);
    const Error = responseXml.getElementsByTagName("Error")[0]?.firstChild?.data;
    const Message = responseXml.getElementsByTagName("Message")[0]?.firstChild?.data;
    const documentContentTitle = responseXml.getElementsByTagName("Title")[0]?.firstChild?.data;
    return { Error, Message, documentContentTitle };
};

// API call to get document content xml response [libraryContentDetailsGet]
export const fetchPercDocumentContentXml = async ({ AuthenticationToken, libraryUrlEndpoint, documentContentId }) => {
    try{
        const payload = getDocumentContentXml(AuthenticationToken, documentContentId);
        const response = await fetch(libraryUrlEndpoint, 
            { body: payload, method: "POST", headers: DOCUMENT_CONTENT_XML_HEADERS }, payload).then((response) => response.text().then((response) => response));
        const { Error, Message, documentContentTitle } = parseDocumentContentXmlResponse(response);
        if (Error === undefined) return { success: true, documentContentErrorMessage: null, documentContentResponse: response, documentContentTitle };
        else return { success: false, documentContentErrorMessage: Message, documentContentResponse: response, documentContentTitle };
    } catch (error) {
        console.log(`*****Error executing fetchPercDocumentContentXml - ${error}`);
    }
};

