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
exports.obtainObject = exports.uploadBuildFiles = exports.buildProject = exports.downloadFilesFromS3 = exports.uploadFile = void 0;
const aws_sdk_1 = require("aws-sdk");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = require("./getAllFiles");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs_2 = require("fs");
const exec = (0, util_1.promisify)(child_process_1.exec);
dotenv_1.default.config();
// Create an S3 instance with my credentials
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
// Upload a file to my bucket
const uploadFile = (fileName, localFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = fs_1.default.readFileSync(localFilePath);
    const response = yield s3.upload({
        Body: fileContent,
        Bucket: 'vercelclone',
        Key: fileName,
    }).promise();
    console.log(response);
});
exports.uploadFile = uploadFile;
// Download all the files from the bucket
function downloadFilesFromS3(prefix) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const allFiles = yield s3.listObjectsV2({
            Bucket: "vercelclone",
            Prefix: prefix
        }).promise();
        const allPromises = ((_a = allFiles.Contents) === null || _a === void 0 ? void 0 : _a.map(({ Key }) => __awaiter(this, void 0, void 0, function* () {
            if (!Key) {
                return;
            }
            const finalOutputPath = path_1.default.join(__dirname, Key);
            const dirName = path_1.default.dirname(finalOutputPath);
            yield fs_2.promises.mkdir(dirName, { recursive: true });
            const outputFile = fs_1.default.createWriteStream(finalOutputPath);
            const stream = s3.getObject({
                Bucket: "vercelclone",
                Key
            }).createReadStream();
            return new Promise((resolve, reject) => {
                stream.pipe(outputFile).on("finish", resolve).on("error", reject);
            });
        }))) || [];
        console.log("awaiting");
        yield Promise.all(allPromises);
    });
}
exports.downloadFilesFromS3 = downloadFilesFromS3;
// build the project and save it in the output folder
function buildProject(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const { stdout, stderr } = yield exec(`cd ${path_1.default.join(__dirname, `input/${id}`)} && npm install && npm run build`);
        console.log('stdout:', stdout);
        console.log('stderr:', stderr);
    });
}
exports.buildProject = buildProject;
function uploadBuildFiles(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const folderPath = path_1.default.join(__dirname, `input/${id}/build`);
        const files = (0, getAllFiles_1.getAllFiles)(folderPath);
        files.forEach(file => {
            (0, exports.uploadFile)(file.replace(folderPath, `output/${id}`), file);
        });
    });
}
exports.uploadBuildFiles = uploadBuildFiles;
const obtainObject = (prefix, id) => __awaiter(void 0, void 0, void 0, function* () {
    const contents = yield s3.getObject({
        Bucket: "vercelclone",
        Key: `output/${id}${prefix}`
    }).promise();
    return contents;
});
exports.obtainObject = obtainObject;
