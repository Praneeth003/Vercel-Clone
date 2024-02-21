import express from 'express';
import { commandOptions, createClient } from 'redis';
import { buildProject, downloadFilesFromS3 } from './utils/aws';


const app = express();
const port = 4001;

// Subscribe to the deploy queue on Redis running on port 6379 locally
const subscriber = createClient();
subscriber.connect();

subscriber.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

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
            await buildProject(res.element);
            
        }
        
    }
}
start();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});