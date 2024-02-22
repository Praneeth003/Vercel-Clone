import express from 'express';
import cors from "cors";
import generateUniqueId from './utils/generateId';
import simpleGit from "simple-git";
import path from "path";
import { getAllFiles } from './utils/getAllFiles';
import { uploadFile } from './utils/aws';
import { createClient } from 'redis';

const app = express();
app.use(cors());
app.use(express.json());

// Create a publisher to push the id to the deploy queue of the Redis queue running locally on port 6379
const publisher = createClient();
publisher.connect();

// Create a subscriber to listen to the status of the deployment
const subscriber = createClient();
subscriber.connect();

app.post('/deploy', async (req,res) => {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    
    const id = generateUniqueId();
    console.log(id);

    // Clone the repository and save it in the input folder with the id as the folder name
    await simpleGit().clone(repoUrl, path.join(__dirname,`input/${id}`));

    // Get all the files in the input folder and upload them to the bucket
    const files = getAllFiles(path.join(__dirname,`input/${id}`));
    files.forEach(async (file) => {
        await uploadFile(file.slice(file.indexOf("dist") + "dist".length + 1) ,file);
    });

    // Push the id to the deploy queue
    publisher.lPush('deploy', id);
    publisher.hSet("status", id, "uploaded");

    res.json({id: id});
})

app.get("/status", async (req, res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});