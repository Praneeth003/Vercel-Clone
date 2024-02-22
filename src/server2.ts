import express from 'express';
import { commandOptions, createClient } from 'redis';
import { buildProject, downloadFilesFromS3, uploadBuildFiles } from './utils/aws';
import { getAllFiles } from './utils/getAllFiles';
import path from 'path';



const app = express();
const port = 4001;

// Subscribe to the deploy queue on Redis running on port 6379 locally
const subscriber = createClient();
subscriber.connect();

subscriber.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

// Create a publisher to push the status of the deployment
const publisher = createClient();
publisher.connect();

async function start(){
    while(true){
        // Pop the id from the right side of deploy queue
        const res = await subscriber.brPop(
            commandOptions({isolated: true}),
            'deploy',
            0
        );
        console.log(res);

        if (res) {
            console.log(`Deploying ${res.element}`);
            // Download the files from the bucket for the corresponding id 
            await downloadFilesFromS3(`input/${res.element}`);
            
            // Build the project
            await buildProject(res.element);

            // Get all the files from the folder where the build happened and upload them to the bucket
            await uploadBuildFiles(res.element);
            
            await publisher.hSet("status", res.element, "deployed")
        }        
    }
}
start();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});