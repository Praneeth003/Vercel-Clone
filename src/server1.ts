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

// Create a redis client
const publisher = createClient();
publisher.connect();

app.post('/deploy', async (req,res) => {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    
    const id = generateUniqueId();
    console.log(id);

    // Clone the repository and save it in the output folder with the id as the folder name in the output folder
    await simpleGit().clone(repoUrl, path.join(__dirname,`output/${id}`));

    // Get all the files in the output folder and upload them to the bucket
    const files = getAllFiles(path.join(__dirname,`output/${id}`));
    files.forEach(file => {
        uploadFile(file.slice(file.indexOf("dist") + "dist".length + 1) ,file)
    });

    // Push the id to the deploy queue
    publisher.lPush('deploy', id);

    res.json({id: id});
})


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});