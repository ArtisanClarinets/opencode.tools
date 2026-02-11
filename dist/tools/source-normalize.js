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
exports.normalizeSource = normalizeSource;
const html_to_text_1 = require("html-to-text");
const crypto = __importStar(require("crypto"));
/**
 * Normalizes and processes raw source content for consistency and deduplication.
 */
async function normalizeSource(rawContent, originalUrl) {
    const cleanText = (0, html_to_text_1.convert)(rawContent, {
        wordwrap: 130
    });
    const contentHash = crypto.createHash('sha256').update(cleanText).digest('hex');
    const canonicalUrl = new URL(originalUrl).href.toLowerCase();
    return {
        success: true,
        content: JSON.stringify({
            canonicalUrl,
            contentHash,
            cleanText,
            isDuplicate: false, // In a real system, we would check against a database of hashes
            language: 'en'
        })
    };
}
//# sourceMappingURL=source-normalize.js.map