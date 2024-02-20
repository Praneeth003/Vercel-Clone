"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUniqueId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';
    for (let i = 0; i < 7; i++) {
        uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return uniqueId;
}
exports.default = generateUniqueId;
