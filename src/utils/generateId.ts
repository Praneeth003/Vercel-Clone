function generateUniqueId(): string {
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId: string = '';
    for (let i = 0; i < 7; i++) {
        uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return uniqueId;
}

export default generateUniqueId;