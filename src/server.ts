import express from 'express';
import cors from "cors";

const app = express();
app.use(cors());

app.listen(4000, () => {
    console.log('Server is running on port 4000');
});