"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_1 = require("./utils/aws");
const app = (0, express_1.default)();
const port = 4002;
app.get('/*', (req, res) => {
    console.log(req.hostname);
    const url = req.hostname;
    // Get the id and the required file from the url
    const id = url.split(".")[0];
    const filePath = req.path;
    // Get the required file from the bucket
    const contents = (0, aws_1.obtainObject)(filePath, id);
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript";
    res.set("Content-Type", type);
    contents === null || contents === void 0 ? void 0 : contents.then((data) => {
        res.send(data.Body);
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
