"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const redis_1 = require("redis");
const aws_1 = require("./utils/aws");
const app = (0, express_1.default)();
const port = 4001;
// Subscribe to the deploy queue on Redis running on port 6379 locally
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
subscriber.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            // Pop the id from the right side of deploy queue
            const res = yield subscriber.brPop((0, redis_1.commandOptions)({ isolated: true }), 'deploy', 0);
            console.log(res);
            if (res) {
                console.log(`Deploying ${res.element}`);
                // Download the files from the bucket for the corresponding id 
                yield (0, aws_1.downloadFilesFromS3)(`input/${res.element}`);
                // Build the project
                yield (0, aws_1.buildProject)(res.element);
                // Get all the files from the folder where the build happened and upload them to the bucket
                yield (0, aws_1.uploadBuildFiles)(res.element);
            }
        }
    });
}
start();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
