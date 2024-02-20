import express from 'express';
import { commandOptions, createClient } from 'redis';

const app = express();
const port = 4001;

const subscriber = createClient();
subscriber.connect();

subscriber.on('error', (err) => {
  console.error('Error connecting to Redis:', err);
});

async function start(){
    while(true){
        const res = await subscriber.brPop(
            commandOptions({isolated: true}),
            'deploy',
            0
        );
        console.log(res);
    }
}
start();


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});