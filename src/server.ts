import express from 'express';
import cors from "cors";
import generateUniqueId from './generateId';
import simpleGit from "simple-git";

const app = express();
app.use(cors());
app.use(express.json());

app.post('/deploy', async (req,res) => {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = generateUniqueId();
    console.log(id);
    await simpleGit().clone(repoUrl, `output/${id}`);
    res.json({id: id});
})


app.listen(4000, () => {
    console.log('Server is running on port 4000');
});