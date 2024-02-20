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
const app = (0, express_1.default)();
const port = 4001;
const subscriber = (0, redis_1.createClient)();
subscriber.connect();
subscriber.on('error', (err) => {
    console.error('Error connecting to Redis:', err);
});
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            const res = yield subscriber.brPop((0, redis_1.commandOptions)({ isolated: true }), 'deploy', 0);
            console.log(res);
        }
    });
}
start();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
