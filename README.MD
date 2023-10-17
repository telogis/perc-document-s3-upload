PERC DOCUMENTS EXTRACT FROM WEB SERVICE & UPLOAD TO S3 BUCKET
-------------------------------------------------------------

Perc documents are extracted from web services [provided by Qvidian] to gather all required details and upload those documents to AWS cloud S3 Bucket.

------------------------------------------------------------------------------------------------------------------------------------------------------------
Please update environmental variables in .env file before executing the code.

EXTRACT_QVIDIAN_USER_ID=<provide_Qvidian_user_name>
EXTRACT_QVIDIAN_PASSWORD=<provide_Qvidian_password>
UPLOAD_AWS__ACCESS_KEY=<provide_aws_access_key>
UPLOAD_AWS_SECRET_KEY=<provide_aws_secret_key>
UPLOAD_AWS_BUCKET_REGION=<provide_aws_bucket_region>
UPLOAD_S3_BUCKET_NAME=<provide_aws_bucket_name>
UPLOAD_SOURCE_DOCUMENT_FOLDER=<provide_location_of_extract>

------------------------------------------------------------------------------------------------------------------------------------------------------------
Execute following command to install, extract and upload documents.

--> npm install [This will install all required npm dependent packages before execution]
--> npm run extract-perc-document [This will initiate a process to extract all documents and save within extract folder - Approx time 20 to 30 minutes]
--> npm run upload-perc-document [This will initiate a process to upload to s3 bucket from the extract folder - Approx time 1:30 to 2 hours]



