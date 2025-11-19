// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Polyfill for Web APIs in Node.js environment
import { TextEncoder, TextDecoder } from 'util'
import { ReadableStream, TransformStream } from 'stream/web'
import { fetch, Request, Response, Headers, FormData, File, Blob } from 'undici'

// Make Web APIs available globally
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder
global.ReadableStream = ReadableStream
global.TransformStream = TransformStream
global.fetch = fetch
global.Request = Request
global.Response = Response
global.Headers = Headers
global.FormData = FormData
global.File = File
global.Blob = Blob

