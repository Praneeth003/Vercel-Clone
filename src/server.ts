import express from 'express';
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/deploy', (req,res) => {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});