import { POST, OPTIONS } from './route';
import { NextRequest, NextResponse } from 'next/server';
const mockGetAuth = require('firebase-admin/auth').getAuth;
const mockGetStorage = require('firebase-admin/storage').getStorage;
import { SecurityValidator } from '@/lib/validation';

jest.mock('firebase-admin/auth', () => ({
    getAuth: jest.fn(),
}));
jest.mock('firebase-admin/app', () => ({
    getApps: jest.fn(() => [true]),
    initializeApp: jest.fn(),
    cert: jest.fn(),
}));
jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn(),
}));
jest.mock('@/lib/validation', () => ({
    SecurityValidator: {
        checkRateLimit: jest.fn(),
        validateFile: jest.fn(),
    },
}));


describe('POST /api/upload-image', () => {
    const mockUid = 'test-uid';
    const mockToken = 'valid-token';
    const mockFile = {
        name: 'test.png',
        type: 'image/png',
        arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('test')),
    };
    const mockFormData = {
        get: jest.fn((key: string) => (key === 'image' ? mockFile : null)),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetAuth.mockReturnValue({
            verifyIdToken: jest.fn().mockResolvedValue({ uid: mockUid }),
        });
        SecurityValidator.checkRateLimit.mockReturnValue(true);
        SecurityValidator.validateFile.mockImplementation(() => {});
        mockGetStorage.mockReturnValue({
            bucket: jest.fn().mockReturnValue({
                file: jest.fn().mockReturnValue({
                    save: jest.fn().mockResolvedValue(undefined),
                    makePublic: jest.fn().mockResolvedValue(undefined),
                }),
                name: 'bucket-name',
            }),
        });
    });

    function createRequest({
        auth = true,
        token = mockToken,
        file = mockFile,
        formData = mockFormData,
    } = {}) {
        return {
            headers: {
                get: jest.fn((key: string) =>
                    key === 'authorization'
                        ? auth
                            ? `Bearer ${token}`
                            : null
                        : null
                ),
            },
            formData: jest.fn().mockResolvedValue(formData),
        } as unknown as NextRequest;
    }

    it('returns 401 if no authorization header', async () => {
        const req = createRequest({ auth: false });
        const res = await POST(req);
        expect(res).toBeInstanceOf(NextResponse);
        expect(await (res as any)._getJSON()).toEqual({ error: 'Unauthorized' });
        expect((res as any).status).toBe(401);
    });

    it('returns 401 if token is invalid', async () => {
        mockGetAuth.mockReturnValue({
            verifyIdToken: jest.fn().mockRejectedValue(new Error('bad token')),
        });
        const req = createRequest();
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'Invalid token' });
        expect((res as any).status).toBe(401);
    });

    it('returns 429 if rate limit exceeded', async () => {
        SecurityValidator.checkRateLimit.mockReturnValue(false);
        const req = createRequest();
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'Rate limit exceeded' });
        expect((res as any).status).toBe(429);
    });

    it('returns 400 if no file provided', async () => {
        const req = createRequest({
            formData: { get: jest.fn(() => null) },
        });
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'No file provided' });
        expect((res as any).status).toBe(400);
    });

    it('returns 413 if file size too large', async () => {
        SecurityValidator.validateFile.mockImplementation(() => {
            throw new Error('File size too large');
        });
        const req = createRequest();
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'File size too large' });
        expect((res as any).status).toBe(413);
    });

    it('returns 400 if invalid file type', async () => {
        SecurityValidator.validateFile.mockImplementation(() => {
            throw new Error('Invalid file type');
        });
        const req = createRequest();
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'Invalid file type' });
        expect((res as any).status).toBe(400);
    });

    it('returns 500 on unexpected error', async () => {
        mockGetStorage.mockImplementation(() => {
            throw new Error('Unexpected');
        });
        const req = createRequest();
        const res = await POST(req);
        expect(await (res as any)._getJSON()).toEqual({ error: 'Internal server error' });
        expect((res as any).status).toBe(500);
    });

    it('returns 200 and image url on success', async () => {
        const req = createRequest();
        const res = await POST(req);
        const json = await (res as any)._getJSON();
        expect(json.success).toBe(true);
        expect(json.imageUrl).toMatch(/^https:\/\/storage\.googleapis\.com\/bucket-name\/banners\//);
        expect(json.fileName).toMatch(/^banners\//);
        expect((res as any).status).toBe(200);
    });
});

describe('OPTIONS /api/upload-image', () => {
    it('returns 200 and CORS headers', async () => {
        const req = {} as NextRequest;
        const res = await OPTIONS(req);
        expect(res.status).toBe(200);
        expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
        expect(res.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
        expect(res.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
    });
});

// Patch NextResponse for easier assertions in tests
Object.defineProperty(NextResponse.prototype, '_getJSON', {
    value: async function () {
        // @ts-ignore
        if (this._bodyInit) {
            // @ts-ignore
            return JSON.parse(this._bodyInit);
        }
        // Try to read from body stream
        if (this.body) {
            const text = await this.text();
            return text ? JSON.parse(text) : undefined;
        }
        return undefined;
    },
});