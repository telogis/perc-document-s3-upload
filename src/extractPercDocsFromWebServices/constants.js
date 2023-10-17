export const CONSTANTS = {
    ENDPOINT_QVIDIAN: 'https://qpalogin.qvidian.com/QvidianAuthentication.asmx',
    AUTH_HEADERS: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://qvidian.com/webservices/Connect"
    },
    FOLDER_HEADERS: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://qvidian.com/webservices/libraryFoldersGetList"
    },
    DOCUMENT_HEADERS: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://qvidian.com/webservices/libraryFolderContentGetList"
    },
    DOCUMENT_CONTENT_DATA_HEADERS: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://qvidian.com/webservices/libraryContentGet"
    },
    DOCUMENT_CONTENT_XML_HEADERS: {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": "http://qvidian.com/webservices/libraryContentDetailsGet"
    },
}