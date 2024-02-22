import { S3 } from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { exec as execChildProcess, spawn } from 'child_process';
import { getAllFiles } from './getAllFiles';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { promises as fsPromises } from 'fs';


const exec = promisify(execCb);


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

// Download all the files from the bucket
export async function downloadFilesFromS3(prefix: string) {
    const allFiles = await s3.listObjectsV2({
        Bucket: "vercelclone",
        Prefix: prefix
    }).promise();

    const allPromises = allFiles.Contents?.map(async ({Key}) => {
        if (!Key) {
            return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const dirName = path.dirname(finalOutputPath);
        await fsPromises.mkdir(dirName, { recursive: true });

        const outputFile = fs.createWriteStream(finalOutputPath);
        const stream = s3.getObject({
            Bucket: "vercelclone",
            Key
        }).createReadStream();

        return new Promise((resolve, reject) => {
            stream.pipe(outputFile).on("finish", resolve).on("error", reject);
        });
    }) || [];

    console.log("awaiting");
    await Promise.all(allPromises);
}

// build the project and save it in the output folder
export async function buildProject(id: string) {
    const { stdout, stderr } = await exec(`cd ${path.join(__dirname, `input/${id}`)} && npm install && npm run build`);

    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
}

export async function uploadBuildFiles(id: string){
    const folderPath = path.join(__dirname, `input/${id}/build`);
    const files = getAllFiles(folderPath);
    files.forEach(file => {
        uploadFile(file.replace(folderPath, `output/${id}`), file);
    })
}

export const obtainObject = async (prefix: string, id: string) => {
    const contents = await s3.getObject({
        Bucket: "vercelclone",
        Key: `output/${id}${prefix}`
    }).promise();
    return contents;
}

