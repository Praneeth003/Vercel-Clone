import { S3 } from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';


dotenv.config();

// Create an S3 instance with my credentials
const s3 = new S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// Upload a file to my bucket
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
    Body: fileContent,
    Bucket: 'vercelclone',
    Key: fileName,
  }).promise();
  console.log(response);
}