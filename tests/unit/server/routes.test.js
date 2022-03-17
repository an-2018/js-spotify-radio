import {
    describe,
    expect,
    test,
    jest,
    beforeEach
} from "@jest/globals"
import config from "../../../server/config"
import { Controller } from "../../../server/controller"
import { handler } from "../../../server/routes"
import TestUtil from "../_unit/testUtil"

const {
    pages,
    location,
    constants: {
        CONTENT_TYPE
    }
} = config
describe('#Routes - Test SIte for api response', () => {
    beforeEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
    })

    test("GET / - Should redirect to home page", async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/'

        await handler(...params.values())

        expect(params.response.writeHead).toBeCalledWith(
            302,
            {
                'Location': location.home
            }
        )
    })

    test(`GET /home - Should response with ${pages.homeHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/home'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
        })

        jest.spyOn(
            mockFileStream,
            "pipe" // jest doesnt allow stream.prototype.pipe.name
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /controller - Should response with ${pages.controllerHTML} file stream`, async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/controller'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
        })

        jest.spyOn(
            mockFileStream,
            "pipe" // jest doesnt allow stream.prototype.pipe.name
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    })

    test(`GET /index.html - Should response with file stream`, async () => {

        const params = TestUtil.defaultHandleParams()
        const filename = '/index.html'
        params.request.method = 'GET'
        params.request.url = filename
        const expectType = '.html'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectType
        })

        jest.spyOn(
            mockFileStream,
            "pipe" // jest doesnt allow stream.prototype.pipe.name
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).toHaveBeenCalledWith(
            200,
            {
                'Content-Type': CONTENT_TYPE[expectType]
            }
        )
    })

    test(`GET /file.ext - Should response with file stream`, async () => {

        const params = TestUtil.defaultHandleParams()
        const filename = '/file.ext'
        params.request.method = 'GET'
        params.request.url = filename
        const expectType = '.ext'
        const mockFileStream = TestUtil.generateReadableStream(['data'])

        jest.spyOn(
            Controller.prototype,
            Controller.prototype.getFileStream.name,
        ).mockResolvedValue({
            stream: mockFileStream,
            type: expectType
        })

        jest.spyOn(
            mockFileStream,
            "pipe" // jest doesnt allow stream.prototype.pipe.name
        ).mockReturnValue()

        await handler(...params.values())

        expect(Controller.prototype.getFileStream).toBeCalledWith(filename)
        expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
        expect(params.response.writeHead).not.toHaveBeenCalledWith()
    })

    test(`POST /unknow - given an enexistent route it should response with 404`, async () => {

        const params = TestUtil.defaultHandleParams()
        params.request.method = 'POST'
        params.request.url = '/unknow'

        await handler(...params.values())

        expect(params.response.writeHead).toHaveBeenCalledWith(404)
        expect(params.response.end).toHaveBeenCalled()
    })

    describe("Exceptions", () => {
        test('given inexistent file it should respond with 404', async () => {

            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'
            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            ).mockRejectedValue(new Error('Error: ENOENT: no such file or directory'))

            await handler(...params.values())

            expect(params.response.writeHead).toHaveBeenCalledWith(404)
            expect(params.response.end).toHaveBeenCalled()
        })
        test('given an error it should respond with 500', async () => {

            const params = TestUtil.defaultHandleParams()
            params.request.method = 'GET'
            params.request.url = '/index.png'
            jest.spyOn(
                Controller.prototype,
                Controller.prototype.getFileStream.name
            ).mockRejectedValue(new Error('Error:'))

            await handler(...params.values())

            expect(params.response.writeHead).toHaveBeenCalledWith(500)
            expect(params.response.end).toHaveBeenCalled()
        })
    })
})