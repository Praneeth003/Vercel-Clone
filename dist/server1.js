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
const cors_1 = __importDefault(require("cors"));
const generateId_1 = __importDefault(require("./utils/generateId"));
const simple_git_1 = __importDefault(require("simple-git"));
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = require("./utils/getAllFiles");
const aws_1 = require("./utils/aws");
const redis_1 = require("redis");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Create a publisher to push the id to the deploy queue of the Redis queue running locally on port 6379
const publisher = (0, redis_1.createClient)();
publisher.connect();
// Create a subscriber to listen to the status of the deployment
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
app.post('/deploy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const repoUrl = req.body.repoUrl;
    console.log(repoUrl);
    const id = (0, generateId_1.default)();
    console.log(id);
    // Clone the repository and save it in the input folder with the id as the folder name
    yield (0, simple_git_1.default)().clone(repoUrl, path_1.default.join(__dirname, `input/${id}`));
    // Get all the files in the input folder and upload them to the bucket
    const files = (0, getAllFiles_1.getAllFiles)(path_1.default.join(__dirname, `input/${id}`));
    files.forEach((file) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, aws_1.uploadFile)(file.slice(file.indexOf("dist") + "dist".length + 1), file);
    }));
    // Push the id to the deploy queue
    publisher.lPush('deploy', id);
    publisher.hSet("status", id, "uploaded");
    res.json({ id: id });
}));
app.get("/status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield subscriber.hGet("status", id);
    res.json({
        status: response
    });
}));
app.listen(4000, () => {
    console.log('Server is running on port 4000');
});
