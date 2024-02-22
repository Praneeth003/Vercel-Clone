import { S3 } from 'aws-sdk';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { exec, spawn } from 'child_process';
import { getAllFiles } from './getAllFiles';



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
        return new Promise(async (resolve) => {
            if (!Key) {
                resolve("");
                return;
            }
            const finalOutputPath = path.join(__dirname, Key);
            const outputFile = fs.createWriteStream(finalOutputPath);
            const dirName = path.dirname(finalOutputPath);
            if (!fs.existsSync(dirName)){
                fs.mkdirSync(dirName, { recursive: true });
            }
            s3.getObject({
                Bucket: "vercelclone",
                Key
            }).createReadStream().pipe(outputFile).on("finish", () => {
                resolve("");
            })
        })
    }) || []
    console.log("awaiting");

    await Promise.all(allPromises?.filter(x => x !== undefined));
}

// build the project and save it in the output folder
export async function buildProject(id: string) {
    return new Promise(async (resolve) => {
        const child = exec(`cd ${path.join(__dirname, `input/${id}`)} && npm install && npm run build`)

        child.stdout?.on('data', function(data) {
            console.log('stdout: ' + data);
        });
        child.stderr?.on('data', function(data) {
            console.log('stderr: ' + data);
        });

        child.on('close', function(code) {
           resolve("")
        });

    })
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

