import fs from 'fs'
import { extname, join } from 'path'
import config from './config.js'
import fsPromises from 'fs/promises'

const {
    dir: {
        publicDirectory,
    }
} = config

export class Service {
    createFilesStream(filename) {
        return fs.createReadStream(filename)
    }

    async getFileInfo(file) {
        // file = home/index.html
        const fullFilePath = join(publicDirectory, file)
        await fsPromises.access(fullFilePath)
        const fileType = extname(fullFilePath)
        return {
            type: fileType,
            name: fullFilePath
        }
    }

    async getFileStream(file) {
        const { name, type } = await this.getFileInfo(file)

        return {
            stream: this.createFilesStream(name),
            type
        }
    }
}