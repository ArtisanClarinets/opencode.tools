"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webfetch = webfetch;
/**
 * Fetches content from a specified URL, handles HTTP requests, and extracts text using a readability algorithm.
 */
const axios_1 = __importDefault(require("axios"));
const html_to_text_1 = require("html-to-text");
async function webfetch(url, format = 'markdown') {
    try {
        const response = await axios_1.default.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; OpenCodeResearchBot/1.0; +http://opencode.tools)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            timeout: 15000, // 15 seconds timeout
            validateStatus: (status) => status < 400 // Reject on 4xx/5xx
        });
        const html = response.data;
        let content = html;
        if (format === 'markdown' || format === 'text') {
            content = (0, html_to_text_1.convert)(html, {
                wordwrap: 130,
                selectors: [
                    { selector: 'a', options: { ignoreHref: true } },
                    { selector: 'img', format: 'skip' },
                    { selector: 'script', format: 'skip' },
                    { selector: 'style', format: 'skip' },
                    { selector: 'nav', format: 'skip' },
                    { selector: 'footer', format: 'skip' },
                    { selector: 'header', format: 'skip' }
                ]
            });
        }
        return {
            success: true,
            content,
            url: response.request.res.responseUrl || url,
            status: response.status
        };
    }
    catch (error) {
        return {
            success: false,
            content: '',
            url,
            error: error.message,
            status: error.response?.status
        };
    }
}
//# sourceMappingURL=webfetch.js.map