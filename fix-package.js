const fs = require('fs');
let text = fs.readFileSync('package.json', 'utf8');
const lines = text.split(/\r?\n/);

// Fix corrupted description on line 5 (0-indexed, line 4)
lines[4] = '  "description": "\u6C89\u6D78\u5F0F\u97F3\u4E50\u64AD\u653E\u5668\uFF0C\u878D\u5408\u5929\u6C14\u7535\u53F0\u3001\u6B4C\u8BCD\u821E\u53F0\u3001\u7C92\u5B50\u89C6\u89C9\u548C 3D \u6B4C\u5355\u67B6\u3002",';

// Remove trailing orphaned msi block (everything after the first valid JSON closing)
let braceDepth = 0;
let jsonEndIdx = -1;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
        if (ch === '{') braceDepth++;
        if (ch === '}') braceDepth--;
    }
    if (braceDepth === 0 && i > 10) {
        jsonEndIdx = i;
        break;
    }
}
console.log('JSON ends at line:', jsonEndIdx, 'content:', '"' + lines[jsonEndIdx]?.trim() + '"');

// Only keep up to the valid JSON closing brace
const validJson = lines.slice(0, jsonEndIdx + 1).join('\n');
try {
    const parsed = JSON.parse(validJson);
    console.log('Valid JSON. win.target:', JSON.stringify(parsed.build.win.target));
    console.log('Has build.msi (already):', !!parsed.build.msi);
    
    // Add MSI config if not present
    if (!parsed.build.msi) {
        parsed.build.msi = {
            createDesktopShortcut: true,
            createStartMenuShortcut: true,
            shortcutName: "Mineradio",
            oneClick: false,
            perMachine: false,
            menuCategory: true,
            artifactName: "Mineradio--Setup."
        };
        console.log('Added MSI config');
    }
    
    fs.writeFileSync('package.json', JSON.stringify(parsed, null, 2) + '\n', 'utf8');
    console.log('File written successfully');
} catch(e) {
    console.log('Parse error:', e.message);
}
