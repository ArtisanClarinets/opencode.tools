"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chunker = void 0;
const crypto = __importStar(require("crypto"));
class Chunker {
    constructor(chunkSize = 500, overlap = 50) {
        this.chunkSize = chunkSize;
        this.overlap = overlap;
    }
    chunk(text, docId) {
        const passages = [];
        let offset = 0;
        // Simple character-based chunking for now
        // In production, use token-based or sentence-boundary aware
        while (offset < text.length) {
            const end = Math.min(offset + this.chunkSize, text.length);
            const chunkText = text.substring(offset, end);
            const id = crypto.createHash('sha256')
                .update(docId)
                .update(offset.toString())
                .digest('hex')
                .substring(0, 16);
            passages.push({
                id,
                docId,
                text: chunkText,
                offset,
                length: chunkText.length
            });
            if (end >= text.length)
                break;
            offset += (this.chunkSize - this.overlap);
        }
        return passages;
    }
}
exports.Chunker = Chunker;
//# sourceMappingURL=chunker.js.map