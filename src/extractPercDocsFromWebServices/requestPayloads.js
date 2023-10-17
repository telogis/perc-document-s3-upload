
// Payload for authorization
export const getQvidianAuthenticationPayload = (USER_ID, PASSWORD) => {
    let authenticationPayload = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://qvidian.com/webservices/"><soap:Header><QvidianCredentialHeader></QvidianCredentialHeader></soap:Header><soap:Body><Connect xmlns="http://qvidian.com/webservices/"><userName>{{USER_ID}}</userName><password>{{PASSWORD}}</password></Connect></soap:Body></soap:Envelope>'
    return authenticationPayload.replace('{{USER_ID}}', USER_ID).replace('{{PASSWORD}}', PASSWORD)
};

// Payload for libraryFoldersGetList
export const getFoldersList = (AuthenticationToken, parentFolderID) =>{
    let foldersListPayload = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://qvidian.com/webservices/"><soap:Header><QvidianCredentialHeader><AuthenticationToken>{{AuthenticationToken}}</AuthenticationToken></QvidianCredentialHeader></soap:Header><soap:Body><libraryFoldersGetList><parentFolderID>{{parentFolderID}}</parentFolderID></libraryFoldersGetList></soap:Body></soap:Envelope>'
    return foldersListPayload.replace('{{AuthenticationToken}}', AuthenticationToken).replace('{{parentFolderID}}', parentFolderID)
}

// Payload for libraryFolderContentGetList
export const getDocumentsList = (AuthenticationToken, folderID) =>{
    let documentsListPayload = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://qvidian.com/webservices/"><soap:Header><QvidianCredentialHeader><AuthenticationToken>{{AuthenticationToken}}</AuthenticationToken></QvidianCredentialHeader></soap:Header><soap:Body><libraryFolderContentGetList><folderID>{{folderID}}</folderID></libraryFolderContentGetList></soap:Body></soap:Envelope>'
    return documentsListPayload.replace('{{AuthenticationToken}}', AuthenticationToken).replace('{{folderID}}', folderID)
}

// Payload for libraryContentGet
export const getDocumentContentData = (AuthenticationToken, contentID) =>{
    let documentContentPayload = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://qvidian.com/webservices/"><soap:Header><QvidianCredentialHeader><AuthenticationToken>{{AuthenticationToken}}</AuthenticationToken></QvidianCredentialHeader></soap:Header><soap:Body><libraryContentGet><contentID>{{contentID}}</contentID></libraryContentGet></soap:Body></soap:Envelope>'
    return documentContentPayload.replace('{{AuthenticationToken}}', AuthenticationToken).replace('{{contentID}}', contentID)
}

// Payload for libraryContentDetailsGet
export const getDocumentContentXml = (AuthenticationToken, contentID) =>{
    let documentContentPayload = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://qvidian.com/webservices/"><soap:Header><QvidianCredentialHeader><AuthenticationToken>{{AuthenticationToken}}</AuthenticationToken></QvidianCredentialHeader></soap:Header><soap:Body><libraryContentDetailsGet><contentID>{{contentID}}</contentID></libraryContentDetailsGet></soap:Body></soap:Envelope>'
    return documentContentPayload.replace('{{AuthenticationToken}}', AuthenticationToken).replace('{{contentID}}', contentID)
}