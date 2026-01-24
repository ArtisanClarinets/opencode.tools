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
const research_1 = require("../agents/research");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
async function main() {
    const args = process.argv.slice(2);
    const briefIndex = args.indexOf('--brief');
    const outputIndex = args.indexOf('--output');
    if (briefIndex === -1 || outputIndex === -1) {
        console.error('Usage: npm run research -- --brief "path/to/brief.json" --output "path/to/output.json"');
        process.exit(1);
    }
    const briefPath = args[briefIndex + 1];
    const outputPath = args[outputIndex + 1];
    try {
        // Read client brief
        const briefContent = fs.readFileSync(briefPath, 'utf-8');
        const brief = JSON.parse(briefContent);
        // Create research input
        const input = {
            brief: {
                company: brief.company,
                industry: brief.industry,
                description: brief.description,
                goals: brief.goals,
                constraints: brief.constraints,
                timeline: brief.timeline
            },
            keywords: brief.keywords,
            urls: brief.urls,
            priorNotes: brief.priorNotes
        };
        // Execute research
        const agent = new research_1.ResearchAgent();
        const result = await agent.execute(input);
        // Create output directory if it doesn't exist
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        // Write results
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        // Also write individual components
        const baseName = path.basename(outputPath, '.json');
        const dirName = path.dirname(outputPath);
        fs.writeFileSync(path.join(dirName, `${baseName}-dossier.json`), JSON.stringify(result.dossier, null, 2));
        fs.writeFileSync(path.join(dirName, `${baseName}-sources.json`), JSON.stringify(result.sources, null, 2));
        fs.writeFileSync(path.join(dirName, `${baseName}-meta.json`), JSON.stringify(result.meta, null, 2));
        console.log(`Research completed successfully!`);
        console.log(`Output written to: ${outputPath}`);
        console.log(`Dossier: ${path.join(dirName, `${baseName}-dossier.json`)}`);
        console.log(`Sources: ${path.join(dirName, `${baseName}-sources.json`)}`);
        console.log(`Meta: ${path.join(dirName, `${baseName}-meta.json`)}`);
    }
    catch (error) {
        console.error('Research failed:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    main();
}
//# sourceMappingURL=index.js.map