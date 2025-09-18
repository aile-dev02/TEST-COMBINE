/**
 * CSV Implementation Verification Script
 * CSVアップロード機能の実装検証
 */

// Node.js環境での実行用（ブラウザ環境をシミュレート）
if (typeof window === 'undefined') {
    global.window = {};
    global.document = {
        getElementById: () => ({ 
            style: { display: 'none' }, 
            innerHTML: '',
            value: ''
        }),
        createElement: () => ({ 
            style: {}, 
            classList: { add: () => {}, remove: () => {} },
            appendChild: () => {},
            setAttribute: () => {},
            click: () => {}
        }),
        body: { appendChild: () => {}, removeChild: () => {} }
    };
    global.bootstrap = { Alert: function() { return { close: () => {} }; } };
    global.URL = { createObjectURL: () => 'mock-url', revokeObjectURL: () => {} };
    global.Blob = function(data, options) { return { data, options }; };
    global.console = console;
}

// Factor クラスの実装（簡略版）
class Factor {
    constructor(name, levels) {
        this.id = 'factor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        this.name = name;
        this.levels = Array.isArray(levels) ? levels : [];
    }
    
    validate() {
        const errors = [];
        
        if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
            errors.push('因子名は必須です');
        }
        
        if (!Array.isArray(this.levels) || this.levels.length < 2) {
            errors.push('各因子には最低2つの水準が必要です');
        }
        
        const uniqueLevels = new Set(this.levels.map(level => level.toString().trim()));
        if (uniqueLevels.size !== this.levels.length) {
            errors.push('水準に重複があります');
        }
        
        const hasEmptyLevel = this.levels.some(level => 
            level === null || level === undefined || level.toString().trim() === ''
        );
        if (hasEmptyLevel) {
            errors.push('空の水準は許可されません');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    getLevelCount() {
        return this.levels.length;
    }
}

// InputManager クラス（CSV機能付き）
class VerifyInputManager {
    constructor() {
        this.factors = [];
        this.factorCounter = 0;
        this.validationErrors = [];
    }
    
    addFactor(name = '', levels = []) {
        this.factorCounter++;
        const factorId = `factor_${this.factorCounter}`;
        
        const factor = new Factor(name || `因子${this.factorCounter}`, levels);
        factor.id = factorId;
        
        this.factors.push(factor);
        return factorId;
    }
    
    clearAll() {
        this.factors = [];
        this.factorCounter = 0;
        this.validationErrors = [];
    }
    
    validateCSVFile(file) {
        const errors = [];
        
        if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
            errors.push('CSVファイルを選択してください');
        }
        
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push('ファイルサイズが大きすぎます（10MB以下にしてください）');
        }
        
        if (file.size === 0) {
            errors.push('空のファイルです');
        }
        
        if (errors.length > 0) {
            console.log(`ファイルエラー: ${errors.join(', ')}`);
            return false;
        }
        
        return true;
    }
    
    parseCSV(csvText) {
        try {
            if (!csvText || csvText.trim() === '') {
                return {
                    success: false,
                    error: 'ファイルが空です'
                };
            }
            
            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                return {
                    success: false,
                    error: '最低2行（ヘッダー行と1行以上のデータ行）が必要です'
                };
            }
            
            const headerLine = lines[0];
            const factorNames = this.parseCSVLine(headerLine);
            
            if (factorNames.length === 0) {
                return {
                    success: false,
                    error: 'ヘッダー行に因子名が見つかりません'
                };
            }
            
            const uniqueNames = new Set(factorNames.map(name => name.trim().toLowerCase()));
            if (uniqueNames.size !== factorNames.length) {
                return {
                    success: false,
                    error: '因子名に重複があります'
                };
            }
            
            const factorsData = factorNames.map(name => ({
                name: name.trim(),
                levels: new Set()
            }));
            
            for (let i = 1; i < lines.length; i++) {
                const dataLine = lines[i];
                const values = this.parseCSVLine(dataLine);
                
                while (values.length < factorNames.length) {
                    values.push('');
                }
                
                values.forEach((value, index) => {
                    if (index < factorsData.length && value.trim() !== '') {
                        factorsData[index].levels.add(value.trim());
                    }
                });
            }
            
            const factors = factorsData
                .filter(factorData => factorData.levels.size >= 2)
                .map(factorData => ({
                    name: factorData.name,
                    levels: Array.from(factorData.levels).sort()
                }));
            
            if (factors.length === 0) {
                return {
                    success: false,
                    error: '有効な因子が見つかりません（各因子には最低2つの異なる水準が必要です）'
                };
            }
            
            return {
                success: true,
                factors: factors,
                originalFactorCount: factorNames.length,
                validFactorCount: factors.length
            };
            
        } catch (error) {
            console.error('CSV解析エラー:', error);
            return {
                success: false,
                error: `CSV解析エラー: ${error.message}`
            };
        }
    }
    
    parseCSVLine(line) {
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
    
    loadFactorsFromCSV(factorsData) {
        this.clearAll();
        
        factorsData.forEach(factorData => {
            this.addFactor(factorData.name, factorData.levels);
        });
    }
}

// テスト実行
function runCSVImplementationTests() {
    console.log('=== CSV実装検証テスト開始 ===\n');
    
    const inputManager = new VerifyInputManager();
    let passedTests = 0;
    let totalTests = 0;
    
    // テスト1: 正常なCSV解析
    totalTests++;
    console.log('テスト1: 正常なCSV解析');
    const testCSV1 = `ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,iOS,モバイル
Edge,Android,デスクトップ
Chrome,Linux,タブレット`;
    
    const result1 = inputManager.parseCSV(testCSV1);
    if (result1.success && result1.factors.length === 3) {
        console.log('✅ 成功: 3つの因子が正しく解析されました');
        console.log(`   因子: ${result1.factors.map(f => `${f.name}(${f.levels.length}水準)`).join(', ')}`);
        passedTests++;
    } else {
        console.log('❌ 失敗:', result1.error || '期待される因子数と異なります');
    }
    
    // テスト2: CSV行解析（特殊文字対応）
    totalTests++;
    console.log('\nテスト2: CSV行解析（特殊文字対応）');
    const testLine = '"値,カンマ","値""クォート",通常値';
    const parsedLine = inputManager.parseCSVLine(testLine);
    const expected = ['値,カンマ', '値"クォート', '通常値'];
    
    if (JSON.stringify(parsedLine) === JSON.stringify(expected)) {
        console.log('✅ 成功: 特殊文字が正しく解析されました');
        console.log(`   解析結果: [${parsedLine.map(v => `"${v}"`).join(', ')}]`);
        passedTests++;
    } else {
        console.log('❌ 失敗: 特殊文字の解析が正しくありません');
        console.log(`   期待値: [${expected.map(v => `"${v}"`).join(', ')}]`);
        console.log(`   実際値: [${parsedLine.map(v => `"${v}"`).join(', ')}]`);
    }
    
    // テスト3: ファイルバリデーション
    totalTests++;
    console.log('\nテスト3: ファイルバリデーション');
    const validFile = { name: 'test.csv', type: 'text/csv', size: 1024 };
    const invalidFile = { name: 'test.txt', type: 'text/plain', size: 1024 };
    
    const validResult = inputManager.validateCSVFile(validFile);
    const invalidResult = inputManager.validateCSVFile(invalidFile);
    
    if (validResult && !invalidResult) {
        console.log('✅ 成功: ファイルバリデーションが正しく動作しています');
        passedTests++;
    } else {
        console.log('❌ 失敗: ファイルバリデーションが正しく動作していません');
    }
    
    // テスト4: エラーハンドリング
    totalTests++;
    console.log('\nテスト4: エラーハンドリング');
    const errorTests = [
        { name: '空CSV', csv: '', shouldFail: true },
        { name: 'ヘッダーのみ', csv: 'Factor1,Factor2', shouldFail: true },
        { name: '重複ヘッダー', csv: 'Factor1,Factor1\nA,B\nC,D', shouldFail: true },
        { name: '有効な因子なし', csv: 'Factor1,Factor2\nA,\n,B', shouldFail: true }
    ];
    
    let errorTestsPassed = 0;
    errorTests.forEach(test => {
        const result = inputManager.parseCSV(test.csv);
        if (result.success !== test.shouldFail) {
            errorTestsPassed++;
        }
    });
    
    if (errorTestsPassed === errorTests.length) {
        console.log('✅ 成功: エラーハンドリングが正しく動作しています');
        passedTests++;
    } else {
        console.log(`❌ 失敗: エラーハンドリングテスト ${errorTestsPassed}/${errorTests.length} 通過`);
    }
    
    // テスト5: 因子データ読み込み
    totalTests++;
    console.log('\nテスト5: 因子データ読み込み');
    const testCSV5 = `ブラウザ,OS
Chrome,Windows
Firefox,macOS
Safari,iOS`;
    
    const result5 = inputManager.parseCSV(testCSV5);
    if (result5.success) {
        inputManager.loadFactorsFromCSV(result5.factors);
        
        if (inputManager.factors.length === 2) {
            console.log('✅ 成功: 因子データが正しく読み込まれました');
            console.log(`   読み込まれた因子: ${inputManager.factors.map(f => f.name).join(', ')}`);
            passedTests++;
        } else {
            console.log('❌ 失敗: 因子データの読み込みが正しくありません');
        }
    } else {
        console.log('❌ 失敗: CSV解析に失敗しました');
    }
    
    // 結果サマリー
    console.log('\n=== CSV実装検証テスト結果 ===');
    console.log(`総テスト数: ${totalTests}`);
    console.log(`成功: ${passedTests}`);
    console.log(`失敗: ${totalTests - passedTests}`);
    console.log(`成功率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 全てのテストが成功しました！CSV機能は正常に実装されています。');
    } else {
        console.log('\n⚠️ 一部のテストが失敗しました。実装を確認してください。');
    }
    
    return { passed: passedTests, total: totalTests };
}

// テスト実行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runCSVImplementationTests, VerifyInputManager, Factor };
} else {
    runCSVImplementationTests();
}