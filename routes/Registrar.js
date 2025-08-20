const fs = require('fs');
const path = require('path');

module.exports = class Registrar {
    constructor(fastify, options = {}) {
        this.fastify = fastify;
        this.options = options;
    }
    
    registerRoutes() {
        return new Promise((resolve, reject) => {
            const directoryPath = __dirname;
            fs.readdir(directoryPath, { withFileTypes: true }, (err, entries) => {
                if(err) {
                    console.error("Failed to read routes directory:", err);
                    reject(err);
                    return;
                }
    
                Promise.all(entries.filter(entry => entry.isDirectory()).map(dir => {
                    const subDirPath = path.join(directoryPath, dir.name);
                    return new Promise((res, rej) => {
                        fs.readdir(subDirPath, { withFileTypes: true }, (err, files) => {
                            if (err) {
                                console.error(`Failed to read sub-directory (${dir.name}):`, err);
                                rej(err);
                                return;
                            }
                            Promise.all(files.filter(file => file.isFile() && file.name.endsWith('.js')).map(file => {
                                const filePath = path.join(subDirPath, file.name);
                                return new Promise((r, j) => {
                                    try {
                                        const route = require(filePath);
                                        const prefix = "/" + dir.name.toLowerCase();
                                        this.fastify.register(route, { ...this.options, prefix });
                                        console.log("Registered route " + prefix + "/" + file.name)
                                        r();
                                    }catch(e) {
                                        console.error(`Error registering route ${filePath}:`, e);
                                        j(e);
                                    }
                                });
                            })).then(res).catch(rej);
                        });
                    });
                })).then(resolve).catch(reject);
            });
        });
    }    
}
