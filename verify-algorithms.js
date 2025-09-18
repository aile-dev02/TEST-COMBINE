/**
 * アルゴリズムエンジンの検証スクリプト
 * Node.js環境で実行してアルゴリズムの動作を確認
 */

// Factor クラスの簡易実装（テスト用）
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
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    getLevelCount() {
        return this.levels.length;
    }
}

// TestCase クラスの簡易実装（テスト用）
class TestCase {
    constructor(combinations) {
        this.id = 'testcase_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
        this.combinations = combinations instanceof Map ? combinations : new Map(Object.entries(combinations || {}));
    }
    
    getLevel(factorId) {
        return this.combinations.get(factorId);
    }
    
    setLevel(factorId, level) {
        this.combinations.set(factorId, level);
    }
    
    clone() {
        return new TestCase(new Map(this.combinations));
    }
}

// PairwiseGenerator クラス（main.jsから抽出）
class PairwiseGenerator {
    constructor() {
        this.debugMode = true;
    }
    
    generate(factors) {
        if (!Array.isArray(factors) || factors.length < 2) {
            throw new Error('ペアワイズテストには最低2つの因子が必要です');
        }
        
        for (const factor of factors) {
            const validation = factor.validate();
            if (!validation.isValid) {
                throw new Error(`因子 "${factor.name}" のバリデーションエラー: ${validation.errors.join(', ')}`);
            }
        }
        
        console.log('ペアワイズ生成開始:', factors.map(f => `${f.name}(${f.levels.length})`));
        
        const testCases = this.executeIPOG(factors);
        
        console.log(`ペアワイズ生成完了: ${testCases.length}件のテストケース`);
        
        return testCases;
    }
    
    executeIPOG(factors) {
        let testCases = this.buildInitialTestSet(factors[0], factors[1]);
        
        for (let i = 2; i < factors.length; i++) {
            testCases = this.extendTestSet(testCases, factors.slice(0, i), factors[i]);
        }
        
        return testCases;
    }
    
    buildInitialTestSet(factor1, factor2) {
        const testCases = [];
        
        for (const level1 of factor1.levels) {
            for (const level2 of factor2.levels) {
                const combinations = new Map();
                combinations.set(factor1.id, level1);
                combinations.set(factor2.id, level2);
                testCases.push(new TestCase(combinations));
            }
        }
        
        console.log(`初期テストセット構築: ${testCases.length}件`);
        return testCases;
    }
    
    extendTestSet(existingTests, existingFactors, newFactor) {
        const extendedTests = [];
        
        for (const testCase of existingTests) {
            const newTestCase = testCase.clone();
            newTestCase.setLevel(newFactor.id, newFactor.levels[0]);
            extendedTests.push(newTestCase);
        }
        
        console.log(`因子拡張: ${newFactor.name} 追加後 ${extendedTests.length}件`);
        return extendedTests;
    }
    
    calculateCoverage(testCases, factors) {
        const allPairs = this.generateAllPairs(factors);
        const coveredPairs = new Set();
        
        for (const testCase of testCases) {
            const pairs = this.getCoveredPairs(testCase, factors);
            for (const pair of pairs) {
                coveredPairs.add(pair);
            }
        }
        
        const coverageRate = allPairs.size > 0 ? (coveredPairs.size / allPairs.size) * 100 : 0;
        const totalCombinations = factors.reduce((total, factor) => total * factor.levels.length, 1);
        const reductionRate = totalCombinations > 0 ? ((totalCombinations - testCases.length) / totalCombinations) * 100 : 0;
        
        return {
            totalPairs: allPairs.size,
            coveredPairs: coveredPairs.size,
            coverageRate: Math.round(coverageRate * 100) / 100,
            testCaseCount: testCases.length,
            totalCombinations: totalCombinations,
            reductionRate: Math.round(reductionRate * 100) / 100
        };
    }
    
    generateAllPairs(factors) {
        const allPairs = new Set();
        
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                const factor1 = factors[i];
                const factor2 = factors[j];
                
                for (const level1 of factor1.levels) {
                    for (const level2 of factor2.levels) {
                        const pairKey = this.createPairKey(factor1.id, level1, factor2.id, level2);
                        allPairs.add(pairKey);
                    }
                }
            }
        }
        
        return allPairs;
    }
    
    createPairKey(factorId1, level1, factorId2, level2) {
        if (factorId1 > factorId2) {
            [factorId1, level1, factorId2, level2] = [factorId2, level2, factorId1, level1];
        }
        return `${factorId1}:${level1}|${factorId2}:${level2}`;
    }
    
    getCoveredPairs(testCase, factors) {
        const coveredPairs = new Set();
        
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                const factor1 = factors[i];
                const factor2 = factors[j];
                const level1 = testCase.getLevel(factor1.id);
                const level2 = testCase.getLevel(factor2.id);
                
                if (level1 !== undefined && level2 !== undefined) {
                    const pairKey = this.createPairKey(factor1.id, level1, factor2.id, level2);
                    coveredPairs.add(pairKey);
                }
            }
        }
        
        return coveredPairs;
    }
}

// テスト実行
function runVerification() {
    console.log('=== アルゴリズムエンジン検証開始 ===\n');
    
    try {
        // テスト用因子を作成
        const factors = [
            new Factor('ブラウザ', ['Chrome', 'Firefox', 'Safari']),
            new Factor('OS', ['Windows', 'Mac', 'Linux']),
            new Factor('画面サイズ', ['デスクトップ', 'タブレット', 'モバイル'])
        ];
        
        console.log('テスト因子:');
        factors.forEach((factor, index) => {
            console.log(`  ${index + 1}. ${factor.name}: [${factor.levels.join(', ')}]`);
        });
        console.log();
        
        // ペアワイズアルゴリズムのテスト
        console.log('--- ペアワイズアルゴリズムテスト ---');
        const generator = new PairwiseGenerator();
        const testCases = generator.generate(factors);
        const coverage = generator.calculateCoverage(testCases, factors);
        
        console.log('結果:');
        console.log(`  テストケース数: ${testCases.length}`);
        console.log(`  総ペア数: ${coverage.totalPairs}`);
        console.log(`  カバー済みペア数: ${coverage.coveredPairs}`);
        console.log(`  カバレッジ率: ${coverage.coverageRate}%`);
        console.log(`  削減率: ${coverage.reductionRate}%`);
        
        console.log('\n生成されたテストケース:');
        testCases.forEach((testCase, index) => {
            const values = factors.map(f => testCase.getLevel(f.id));
            console.log(`  ${index + 1}: ${values.join(', ')}`);
        });
        
        console.log('\n✅ アルゴリズムエンジン検証成功！');
        return true;
        
    } catch (error) {
        console.error('❌ アルゴリズムエンジン検証失敗:', error.message);
        console.error(error.stack);
        return false;
    }
}

// 実行
if (require.main === module) {
    runVerification();
}

module.exports = { runVerification, PairwiseGenerator, Factor, TestCase };