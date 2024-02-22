import express from 'express';
import { obtainObject } from './utils/aws';

const app = express();
const port = 4002;

app.get('/*', (req, res) => {
    
    console.log(req.hostname);
    const url = req.hostname;

    // Get the id and the required file from the url
    const id = url.split(".")[0];
    const filePath = req.path;

    // Get the required file from the bucket
    const contents = obtainObject(filePath, id);

    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    contents?.then((data) => {
        res.send(data.Body);
    })
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});