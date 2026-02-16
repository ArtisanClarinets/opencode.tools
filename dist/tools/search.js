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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.searchWithRetry = searchWithRetry;
exports.searchForFacts = searchForFacts;
/**
 * Real Web Search Tool
 *
 * Executes search queries using DuckDuckGo HTML and parses results properly.
 * Uses cheerio for HTML parsing to extract real search results.
 */
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
/**
 * Executes a search query using DuckDuckGo HTML
 */
async function search(query, options) {
    const numResults = options?.numResults || 10;
    if (!query || query.trim().length === 0) {
        return {
            success: false,
            query,
            results: [],
            error: 'Search query cannot be empty'
        };
    }
    try {
        // Fetch DuckDuckGo HTML results
        const response = await axios_1.default.get(`https://html.duckduckgo.com/html/`, {
            params: {
                q: query,
                b: 1 // Start from first result
            },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
            },
            timeout: 15000
        });
        const $ = cheerio.load(response.data);
        const results = [];
        // Parse search results from DuckDuckGo HTML
        $('.result').each((index, element) => {
            if (index >= numResults)
                return;
            const $element = $(element);
            const $link = $element.find('.result__a');
            const $snippet = $element.find('.result__snippet');
            const $title = $element.find('.result__a');
            const title = $title.text().trim() || $link.attr('title') || '';
            const url = $link.attr('href') || '';
            const snippet = $snippet.text().trim() || $element.find('.result__description').text().trim() || '';
            // DuckDuckGo uses redirects, extract actual URL
            let cleanUrl = url;
            if (url.includes('uddg=')) {
                try {
                    const urlObj = new URL(url);
                    cleanUrl = urlObj.searchParams.get('uddg') || url;
                }
                catch {
                    // Keep original URL if parsing fails
                }
            }
            if (title && cleanUrl) {
                results.push({
                    title,
                    url: cleanUrl,
                    snippet: snippet.replace(/\s+/g, ' ').trim(),
                    position: index + 1
                });
            }
        });
        // Also check for "no results" message
        if (results.length === 0) {
            const noResults = $('.result--no-results').text();
            if (noResults) {
                return {
                    success: true,
                    query,
                    results: [],
                    error: 'No results found'
                };
            }
        }
        return {
            success: true,
            query,
            results,
            totalResults: results.length
        };
    }
    catch (error) {
        // Handle specific error types
        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                query,
                results: [],
                error: 'Search request timed out. Please try again.'
            };
        }
        if (error.response?.status === 403) {
            return {
                success: false,
                query,
                results: [],
                error: 'Search service temporarily unavailable. Rate limit may be exceeded.'
            };
        }
        return {
            success: false,
            query,
            results: [],
            error: error.message || 'Search failed'
        };
    }
}
/**
 * Search with retry logic for resilience
 */
async function searchWithRetry(query, options) {
    const maxRetries = options?.maxRetries || 3;
    const retryDelay = options?.retryDelay || 2000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await search(query, options);
        if (result.success) {
            return result;
        }
        // Don't retry on certain errors
        if (result.error?.includes('empty') || result.error?.includes('No results')) {
            return result;
        }
        // Wait before retrying
        if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
    }
    return {
        success: false,
        query,
        results: [],
        error: `Search failed after ${maxRetries} attempts`
    };
}
/**
 * Extract structured data from search results
 */
async function searchForFacts(query, factsToFind) {
    const result = await search(query, { numResults: 5 });
    if (!result.success) {
        return { success: false, facts: {} };
    }
    const facts = {};
    for (const fact of factsToFind) {
        // Search for each fact in results
        const factResult = await search(`${query} ${fact}`, { numResults: 3 });
        if (factResult.success && factResult.results.length > 0) {
            // Extract potential answer from snippets
            const snippet = factResult.results[0].snippet;
            facts[fact] = snippet;
        }
        else {
            facts[fact] = null;
        }
    }
    return { success: true, facts };
}
exports.default = search;
//# sourceMappingURL=search.js.map