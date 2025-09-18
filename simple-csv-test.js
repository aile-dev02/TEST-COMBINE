// Simple CSV functionality test
console.log('=== CSV機能テスト開始 ===');

// Test CSV line parsing
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i += 2;
            } else {
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    result.push(current);
    return result;
}

// Test cases
const testLines = [
    'simple,test,data',
    '"quoted,data","normal","with""quotes"',
    'mixed,"quoted,comma",normal'
];

console.log('CSV行解析テスト:');
testLines.forEach((line, index) => {
    const parsed = parseCSVLine(line);
    console.log(`行${index + 1}: ${line}`);
    console.log(`解析結果: [${parsed.map(cell => `"${cell}"`).join(', ')}]`);
});

console.log('\n✅ CSV機能の基本的な実装が確認できました');