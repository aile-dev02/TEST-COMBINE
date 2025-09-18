/**
 * アルゴリズムエンジンのテスト
 */

// テスト用の因子データを作成
function createTestFactors() {
    const factor1 = new Factor('ブラウザ', ['Chrome', 'Firefox', 'Safari']);
    const factor2 = new Factor('OS', ['Windows', 'Mac', 'Linux']);
    const factor3 = new Factor('画面サイズ', ['デスクトップ', 'タブレット', 'モバイル']);

    return [factor1, factor2, factor3];
}

// ペアワイズアルゴリズムのテスト
function testPairwiseAlgorithm() {
    console.log('=== ペアワイズアルゴリズムテスト ===');

    try {
        const factors = createTestFactors();
        const generator = new PairwiseGenerator();
        generator.debugMode = true;

        const testCases = generator.generate(factors);
        const coverage = generator.calculateCoverage(testCases, factors);

        console.log('✅ ペアワイズ生成成功');
        console.log(`テストケース数: ${testCases.length}`);
        console.log(`カバレッジ: ${coverage.coverageRate}%`);
        console.log(`削減率: ${coverage.reductionRate}%`);

        // 最初の3つのテストケースを表示
        console.log('\n最初の3つのテストケース:');
        testCases.slice(0, 3).forEach((testCase, index) => {
            const values = factors.map(f => testCase.getLevel(f.id));
            console.log(`${index + 1}: ${values.join(', ')}`);
        });

        return true;
    } catch (error) {
        console.error('❌ ペアワイズテスト失敗:', error.message);
        return false;
    }
}

// 3因子間網羅アルゴリズムのテスト
function testThreeWayAlgorithm() {
    console.log('\n=== 3因子間網羅アルゴリズムテスト ===');

    try {
        const factors = createTestFactors();
        const generator = new ThreeWayGenerator();
        generator.debugMode = true;

        const testCases = generator.generate(factors);
        const coverage = generator.calculateCoverage(testCases, factors);

        console.log('✅ 3因子間網羅生成成功');
        console.log(`テストケース数: ${testCases.length}`);
        console.log(`カバレッジ: ${coverage.coverageRate}%`);
        console.log(`削減率: ${coverage.reductionRate}%`);

        // 最初の3つのテストケースを表示
        console.log('\n最初の3つのテストケース:');
        testCases.slice(0, 3).forEach((testCase, index) => {
            const values = factors.map(f => testCase.getLevel(f.id));
            console.log(`${index + 1}: ${values.join(', ')}`);
        });

        return true;
    } catch (error) {
        console.error('❌ 3因子間網羅テスト失敗:', error.message);
        return false;
    }
}

// 全組み合わせアルゴリズムのテスト
function testAllCombinationsAlgorithm() {
    console.log('\n=== 全組み合わせアルゴリズムテスト ===');

    try {
        const factors = createTestFactors();
        const generator = new AllCombinationsGenerator();
        generator.debugMode = true;

        // 事前チェック
        const preCheck = generator.preCheckCombinations(factors);
        console.log(`総組み合わせ数: ${preCheck.totalCombinations}`);
        console.log(`推定メモリ使用量: ${preCheck.memoryEstimate.formatted}`);
        console.log(`推奨事項: ${preCheck.recommendation}`);

        const testCases = generator.generate(factors, true); // 強制生成
        const coverage = generator.calculateCoverage(testCases, factors);

        console.log('✅ 全組み合わせ生成成功');
        console.log(`テストケース数: ${testCases.length}`);
        console.log(`カバレッジ: ${coverage.coverageRate}%`);

        // 最初の5つのテストケースを表示
        console.log('\n最初の5つのテストケース:');
        testCases.slice(0, 5).forEach((testCase, index) => {
            const values = factors.map(f => testCase.getLevel(f.id));
            console.log(`${index + 1}: ${values.join(', ')}`);
        });

        return true;
    } catch (error) {
        console.error('❌ 全組み合わせテスト失敗:', error.message);
        return false;
    }
}

// エラーケースのテスト
function testErrorCases() {
    console.log('\n=== エラーケーステスト ===');

    let passedTests = 0;
    let totalTests = 0;

    // ペアワイズ: 因子数不足
    totalTests++;
    try {
        const generator = new PairwiseGenerator();
        generator.generate([new Factor('単一因子', ['A', 'B'])]);
        console.error('❌ ペアワイズ因子数不足テスト失敗: エラーが発生しませんでした');
    } catch (error) {
        console.log('✅ ペアワイズ因子数不足テスト成功:', error.message);
        passedTests++;
    }

    // 3因子間網羅: 因子数不足
    totalTests++;
    try {
        const generator = new ThreeWayGenerator();
        generator.generate([
            new Factor('因子1', ['A', 'B']),
            new Factor('因子2', ['X', 'Y'])
        ]);
        console.error('❌ 3因子間網羅因子数不足テスト失敗: エラーが発生しませんでした');
    } catch (error) {
        console.log('✅ 3因子間網羅因子数不足テスト成功:', error.message);
        passedTests++;
    }

    // 全組み合わせ: 大規模データセット警告
    totalTests++;
    try {
        const generator = new AllCombinationsGenerator();
        const largeFactor = new Factor('大規模因子', Array.from({ length: 100 }, (_, i) => `値${i}`));
        generator.generate([largeFactor, largeFactor]);
        console.error('❌ 大規模データセット警告テスト失敗: エラーが発生しませんでした');
    } catch (error) {
        console.log('✅ 大規模データセット警告テスト成功:', error.message);
        passedTests++;
    }

    console.log(`\nエラーケーステスト結果: ${passedTests}/${totalTests} 成功`);
    return passedTests === totalTests;
}

// 全テストの実行
function runAllTests() {
    console.log('アルゴリズムエンジンテスト開始\n');

    const results = [];
    results.push(testPairwiseAlgorithm());
    results.push(testThreeWayAlgorithm());
    results.push(testAllCombinationsAlgorithm());
    results.push(testErrorCases());

    const passedCount = results.filter(r => r).length;
    const totalCount = results.length;

    console.log(`\n=== テスト結果 ===`);
    console.log(`成功: ${passedCount}/${totalCount}`);

    if (passedCount === totalCount) {
        console.log('🎉 全てのテストが成功しました！');
    } else {
        console.log('⚠️ 一部のテストが失敗しました。');
    }

    return passedCount === totalCount;
}

// テスト実行（ページ読み込み時）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () {
        // URLパラメータでテストモードかチェック
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'algorithms') {
            setTimeout(runAllTests, 1000); // 1秒後に実行
        }
    });
}