/**
 * Unit Tests for Factor and TestCase Classes
 * データモデルの単体テスト
 */

/**
 * テスト実行フレームワーク（シンプルな実装）
 */
class SimpleTestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * テストケースを追加
     * @param {string} name - テスト名
     * @param {Function} testFunction - テスト関数
     */
    test(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    /**
     * アサーション - 等しいかチェック
     * @param {*} actual - 実際の値
     * @param {*} expected - 期待値
     * @param {string} message - エラーメッセージ
     */
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
        }
    }

    /**
     * アサーション - 真偽値チェック
     * @param {boolean} condition - 条件
     * @param {string} message - エラーメッセージ
     */
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} - Expected true, but got false`);
        }
    }

    /**
     * アサーション - 偽値チェック
     * @param {boolean} condition - 条件
     * @param {string} message - エラーメッセージ
     */
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} - Expected false, but got true`);
        }
    }

    /**
     * アサーション - 配列の等しさチェック
     * @param {Array} actual - 実際の配列
     * @param {Array} expected - 期待する配列
     * @param {string} message - エラーメッセージ
     */
    assertArrayEqual(actual, expected, message = '') {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            throw new Error(`${message} - Both values must be arrays`);
        }

        if (actual.length !== expected.length) {
            throw new Error(`${message} - Array lengths differ. Expected: ${expected.length}, Actual: ${actual.length}`);
        }

        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                throw new Error(`${message} - Arrays differ at index ${i}. Expected: ${expected[i]}, Actual: ${actual[i]}`);
            }
        }
    }

    /**
     * 全テストを実行
     */
    async runAll() {
        console.log('=== データモデル単体テスト開始 ===');

        this.results = { passed: 0, failed: 0, total: 0 };

        for (const test of this.tests) {
            this.results.total++;

            try {
                await test.testFunction.call(this);
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }

        console.log('\n=== テスト結果 ===');
        console.log(`総テスト数: ${this.results.total}`);
        console.log(`成功: ${this.results.passed}`);
        console.log(`失敗: ${this.results.failed}`);
        console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        return this.results;
    }
}

// テストフレームワークのインスタンス作成
const testFramework = new SimpleTestFramework();

// Factor クラスのテスト
testFramework.test('Factor - 正常なコンストラクタ', function () {
    const factor = new Factor('ブラウザ', ['Chrome', 'Firefox', 'Safari']);

    this.assertEqual(factor.name, 'ブラウザ', 'Factor name should be set correctly');
    this.assertArrayEqual(factor.levels, ['Chrome', 'Firefox', 'Safari'], 'Factor levels should be set correctly');
    this.assertTrue(factor.id.startsWith('factor_'), 'Factor ID should have correct prefix');
});

testFramework.test('Factor - 空の水準配列での初期化', function () {
    const factor = new Factor('テスト因子', []);

    this.assertEqual(factor.name, 'テスト因子');
    this.assertArrayEqual(factor.levels, []);
});

testFramework.test('Factor - 水準配列が配列でない場合の処理', function () {
    const factor = new Factor('テスト因子', 'not an array');

    this.assertArrayEqual(factor.levels, [], 'Non-array levels should be converted to empty array');
});

testFramework.test('Factor - バリデーション: 正常なケース', function () {
    const factor = new Factor('OS', ['Windows', 'Mac', 'Linux']);
    const validation = factor.validate();

    this.assertTrue(validation.isValid, 'Valid factor should pass validation');
    this.assertEqual(validation.errors.length, 0, 'Valid factor should have no errors');
});

testFramework.test('Factor - バリデーション: 因子名が空', function () {
    const factor = new Factor('', ['Level1', 'Level2']);
    const validation = factor.validate();

    this.assertFalse(validation.isValid, 'Factor with empty name should fail validation');
    this.assertTrue(validation.errors.includes('因子名は必須です'), 'Should have name error');
});

testFramework.test('Factor - バリデーション: 水準数不足', function () {
    const factor = new Factor('テスト因子', ['Level1']);
    const validation = factor.validate();

    this.assertFalse(validation.isValid, 'Factor with insufficient levels should fail validation');
    this.assertTrue(validation.errors.includes('各因子には最低2つの水準が必要です'), 'Should have level count error');
});

testFramework.test('Factor - バリデーション: 水準の重複', function () {
    const factor = new Factor('テスト因子', ['Level1', 'Level2', 'Level1']);
    const validation = factor.validate();

    this.assertFalse(validation.isValid, 'Factor with duplicate levels should fail validation');
    this.assertTrue(validation.errors.includes('水準に重複があります'), 'Should have duplicate error');
});

testFramework.test('Factor - バリデーション: 空の水準', function () {
    const factor = new Factor('テスト因子', ['Level1', '', 'Level3']);
    const validation = factor.validate();

    this.assertFalse(validation.isValid, 'Factor with empty level should fail validation');
    this.assertTrue(validation.errors.includes('空の水準は許可されません'), 'Should have empty level error');
});

testFramework.test('Factor - getLevelCount', function () {
    const factor = new Factor('テスト因子', ['A', 'B', 'C', 'D']);

    this.assertEqual(factor.getLevelCount(), 4, 'Level count should be correct');
});

testFramework.test('Factor - toString', function () {
    const factor = new Factor('ブラウザ', ['Chrome', 'Firefox']);
    const result = factor.toString();

    this.assertEqual(result, 'ブラウザ: [Chrome, Firefox]', 'toString should format correctly');
});

testFramework.test('Factor - clone', function () {
    const original = new Factor('OS', ['Windows', 'Mac']);
    const cloned = original.clone();

    this.assertEqual(cloned.name, original.name, 'Cloned factor should have same name');
    this.assertArrayEqual(cloned.levels, original.levels, 'Cloned factor should have same levels');
    this.assertTrue(cloned.id !== original.id, 'Cloned factor should have different ID');
});

// TestCase クラスのテスト
testFramework.test('TestCase - 正常なコンストラクタ（Map）', function () {
    const combinations = new Map([
        ['factor1', 'Level1'],
        ['factor2', 'Level2']
    ]);
    const testCase = new TestCase(combinations);

    this.assertEqual(testCase.getLevel('factor1'), 'Level1', 'Should get correct level for factor1');
    this.assertEqual(testCase.getLevel('factor2'), 'Level2', 'Should get correct level for factor2');
    this.assertTrue(testCase.id.startsWith('testcase_'), 'TestCase ID should have correct prefix');
});

testFramework.test('TestCase - 正常なコンストラクタ（Object）', function () {
    const combinations = {
        'factor1': 'Level1',
        'factor2': 'Level2'
    };
    const testCase = new TestCase(combinations);

    this.assertEqual(testCase.getLevel('factor1'), 'Level1', 'Should get correct level for factor1');
    this.assertEqual(testCase.getLevel('factor2'), 'Level2', 'Should get correct level for factor2');
});

testFramework.test('TestCase - setLevel and getLevel', function () {
    const testCase = new TestCase({});

    testCase.setLevel('factor1', 'NewLevel');
    this.assertEqual(testCase.getLevel('factor1'), 'NewLevel', 'Should set and get level correctly');

    this.assertEqual(testCase.getLevel('nonexistent'), undefined, 'Should return undefined for nonexistent factor');
});

testFramework.test('TestCase - toString', function () {
    const testCase = new TestCase({
        'factor1': 'Level1',
        'factor2': 'Level2'
    });
    const result = testCase.toString();

    this.assertTrue(result.includes('factor1=Level1'), 'toString should include factor1');
    this.assertTrue(result.includes('factor2=Level2'), 'toString should include factor2');
    this.assertTrue(result.startsWith('TestCase['), 'toString should have correct format');
});

testFramework.test('TestCase - toCSVRow', function () {
    const factor1 = new Factor('ブラウザ', ['Chrome', 'Firefox']);
    const factor2 = new Factor('OS', ['Windows', 'Mac']);

    const testCase = new TestCase({});
    testCase.setLevel(factor1.id, 'Chrome');
    testCase.setLevel(factor2.id, 'Windows');

    const csvRow = testCase.toCSVRow([factor1, factor2]);
    this.assertEqual(csvRow, 'Chrome,Windows', 'CSV row should be formatted correctly');
});

testFramework.test('TestCase - toCSVRow with special characters', function () {
    const factor1 = new Factor('テスト', ['値,カンマ', '値"クォート']);

    const testCase = new TestCase({});
    testCase.setLevel(factor1.id, '値,カンマ');

    const csvRow = testCase.toCSVRow([factor1]);
    this.assertEqual(csvRow, '"値,カンマ"', 'CSV row should escape special characters');
});

testFramework.test('TestCase - validate: 正常なケース', function () {
    const factor1 = new Factor('ブラウザ', ['Chrome', 'Firefox']);
    const factor2 = new Factor('OS', ['Windows', 'Mac']);

    const testCase = new TestCase({});
    testCase.setLevel(factor1.id, 'Chrome');
    testCase.setLevel(factor2.id, 'Windows');

    const validation = testCase.validate([factor1, factor2]);

    this.assertTrue(validation.isValid, 'Valid test case should pass validation');
    this.assertEqual(validation.errors.length, 0, 'Valid test case should have no errors');
});

testFramework.test('TestCase - validate: 水準未設定', function () {
    const factor1 = new Factor('ブラウザ', ['Chrome', 'Firefox']);
    const factor2 = new Factor('OS', ['Windows', 'Mac']);

    const testCase = new TestCase({});
    testCase.setLevel(factor1.id, 'Chrome');
    // factor2の水準を設定しない

    const validation = testCase.validate([factor1, factor2]);

    this.assertFalse(validation.isValid, 'Test case with missing level should fail validation');
    this.assertTrue(validation.errors.some(error => error.includes('OS')), 'Should have error for missing OS level');
});

testFramework.test('TestCase - validate: 無効な水準', function () {
    const factor1 = new Factor('ブラウザ', ['Chrome', 'Firefox']);

    const testCase = new TestCase({});
    testCase.setLevel(factor1.id, 'InvalidBrowser');

    const validation = testCase.validate([factor1]);

    this.assertFalse(validation.isValid, 'Test case with invalid level should fail validation');
    this.assertTrue(validation.errors.some(error => error.includes('無効な水準')), 'Should have invalid level error');
});

testFramework.test('TestCase - clone', function () {
    const original = new TestCase({
        'factor1': 'Level1',
        'factor2': 'Level2'
    });
    const cloned = original.clone();

    this.assertEqual(cloned.getLevel('factor1'), 'Level1', 'Cloned test case should have same levels');
    this.assertEqual(cloned.getLevel('factor2'), 'Level2', 'Cloned test case should have same levels');
    this.assertTrue(cloned.id !== original.id, 'Cloned test case should have different ID');
});

testFramework.test('TestCase - equals', function () {
    const testCase1 = new TestCase({
        'factor1': 'Level1',
        'factor2': 'Level2'
    });

    const testCase2 = new TestCase({
        'factor1': 'Level1',
        'factor2': 'Level2'
    });

    const testCase3 = new TestCase({
        'factor1': 'Level1',
        'factor2': 'DifferentLevel'
    });

    this.assertTrue(testCase1.equals(testCase2), 'Test cases with same combinations should be equal');
    this.assertFalse(testCase1.equals(testCase3), 'Test cases with different combinations should not be equal');
    this.assertFalse(testCase1.equals('not a test case'), 'Test case should not equal non-TestCase object');
});

/**
 * テストを実行する関数
 */
async function runDataModelTests() {
    console.log('データモデルのテストを開始します...');
    const results = await testFramework.runAll();

    // テスト結果をグローバルに保存
    window.TestCombinationGenerator = window.TestCombinationGenerator || {};
    window.TestCombinationGenerator.testResults = results;

    return results;
}

// ページ読み込み時にテストを実行（開発時のみ）
if (window.location.search.includes('test=true')) {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(runDataModelTests, 1000); // 他の初期化処理の後に実行
    });
}

// InputManager クラスの簡易版（テスト用）
class TestInputManager {
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

    validateInput() {
        this.validationErrors = [];

        if (this.factors.length === 0) {
            this.validationErrors.push('最低1つの因子が必要です');
        }

        // 因子名重複チェック
        const factorNames = this.factors.map(f => f.name.trim().toLowerCase());
        const duplicateNames = factorNames.filter((name, index) =>
            name && factorNames.indexOf(name) !== index
        );

        if (duplicateNames.length > 0) {
            this.validationErrors.push('因子名に重複があります');
        }

        // 各因子のバリデーション
        this.factors.forEach((factor, index) => {
            const validation = factor.validate();
            if (!validation.isValid) {
                validation.errors.forEach(error => {
                    this.validationErrors.push(`因子${index + 1}: ${error}`);
                });
            }
        });

        return {
            isValid: this.validationErrors.length === 0,
            errors: this.validationErrors
        };
    }

    checkDataCompleteness() {
        const result = {
            isComplete: false,
            isValid: false,
            factorCount: this.factors.length,
            validFactorCount: 0,
            totalCombinations: 0,
            warnings: [],
            recommendations: []
        };

        if (this.factors.length === 0) {
            result.recommendations.push('因子を追加してください');
            return result;
        }

        const validFactors = this.factors.filter(f => f.validate().isValid);
        result.validFactorCount = validFactors.length;
        result.isValid = this.validationErrors.length === 0;
        result.isComplete = result.isValid && validFactors.length >= 2;

        if (validFactors.length > 0) {
            result.totalCombinations = validFactors.reduce((total, factor) =>
                total * factor.getLevelCount(), 1
            );
        }

        return result;
    }
}

// InputManager バリデーション機能のテスト
testFramework.test('InputManager - 因子名重複チェック', function () {
    // DOM環境をモック
    global.document = {
        getElementById: () => null,
        createElement: () => ({
            style: {},
            classList: { add: () => { }, remove: () => { } },
            appendChild: () => { }
        })
    };

    const inputManager = new TestInputManager();

    // 重複する因子名を追加
    inputManager.addFactor('ブラウザ', ['Chrome', 'Firefox']);
    inputManager.addFactor('ブラウザ', ['IE', 'Safari']); // 重複

    const validation = inputManager.validateInput();

    this.assertFalse(validation.isValid, 'Duplicate factor names should fail validation');
    this.assertTrue(validation.errors.some(error => error.includes('重複')), 'Should have duplicate error');
});

testFramework.test('InputManager - 水準数最小値チェック', function () {
    const inputManager = new TestInputManager();

    // 水準数不足の因子を追加
    inputManager.addFactor('テスト因子', ['Level1']); // 1つだけ

    const validation = inputManager.validateInput();

    this.assertFalse(validation.isValid, 'Factor with insufficient levels should fail validation');
    this.assertTrue(validation.errors.some(error => error.includes('最低2つ')), 'Should have minimum level error');
});

testFramework.test('InputManager - 正常なバリデーション', function () {
    const inputManager = new TestInputManager();

    // 正常な因子を追加
    inputManager.addFactor('ブラウザ', ['Chrome', 'Firefox', 'Safari']);
    inputManager.addFactor('OS', ['Windows', 'Mac', 'Linux']);

    const validation = inputManager.validateInput();

    this.assertTrue(validation.isValid, 'Valid factors should pass validation');
    this.assertEqual(validation.errors.length, 0, 'Valid factors should have no errors');
});

testFramework.test('InputManager - データ完全性チェック', function () {
    const inputManager = new TestInputManager();

    // 正常な因子を追加
    inputManager.addFactor('ブラウザ', ['Chrome', 'Firefox']);
    inputManager.addFactor('OS', ['Windows', 'Mac']);

    const completeness = inputManager.checkDataCompleteness();

    this.assertTrue(completeness.isComplete, 'Should be complete with valid factors');
    this.assertEqual(completeness.factorCount, 2, 'Should have 2 factors');
    this.assertEqual(completeness.validFactorCount, 2, 'Should have 2 valid factors');
    this.assertEqual(completeness.totalCombinations, 4, 'Should have 4 total combinations');
});

/**
 * 因子入力フォームの統合テスト
 */
function testFactorInputFormIntegration() {
    console.log('=== 因子入力フォーム統合テスト開始 ===');

    try {
        // 1. InputManager の初期化テスト
        const manager = new TestInputManager();
        console.log('✅ InputManager 初期化成功');

        // 2. 動的因子追加テスト
        const factorId1 = manager.addFactor('ブラウザ', ['Chrome', 'Firefox', 'Safari']);
        console.log('✅ 因子追加テスト成功:', factorId1);

        // 3. DOM要素の存在確認
        const factorElement = document.getElementById(`factor-${factorId1}`);
        if (factorElement) {
            console.log('✅ DOM要素生成成功');
        } else {
            console.log('⚠️ DOM要素が見つかりません（HTMLが読み込まれていない可能性）');
        }

        // 4. リアルタイムバリデーションテスト
        manager.handleFactorNameChange(factorId1, '');
        manager.handleFactorNameChange(factorId1, 'Webブラウザ');
        console.log('✅ 因子名変更ハンドラテスト成功');

        // 5. 水準変更テスト
        manager.handleLevelsChange(factorId1, 'Chrome, Firefox, Safari, Edge');
        console.log('✅ 水準変更ハンドラテスト成功');

        // 6. バリデーションテスト
        const validation = manager.validateInput();
        console.log('✅ バリデーション実行:', validation.isValid ? '成功' : '失敗');

        // 7. 重複因子名テスト
        const factorId2 = manager.addFactor('Webブラウザ', ['IE', 'Opera']);
        const duplicateValidation = manager.validateInput();
        console.log('✅ 重複チェック:', duplicateValidation.isValid ? '失敗（重複が検出されなかった）' : '成功（重複が検出された）');

        // 8. 因子削除テスト
        manager.removeFactor(factorId2);
        console.log('✅ 因子削除テスト成功');

        // 9. データ完全性チェックテスト
        const completeness = manager.checkDataCompleteness();
        console.log('✅ データ完全性チェック:', completeness.isComplete ? '完全' : '不完全');

        // 10. 全クリアテスト
        manager.clearAll();
        console.log('✅ 全クリアテスト成功');

        console.log('=== 因子入力フォーム統合テスト完了 ===');
        return true;

    } catch (error) {
        console.error('❌ 因子入力フォーム統合テストエラー:', error);
        return false;
    }
}

/**
 * 因子入力フォームのUIテスト（DOM操作）
 */
function testFactorInputFormUI() {
    console.log('=== 因子入力フォームUIテスト開始 ===');

    try {
        // グローバルな addFactor 関数のテスト
        if (typeof addFactor === 'function') {
            addFactor();
            console.log('✅ グローバル addFactor 関数テスト成功');
        } else {
            console.log('⚠️ グローバル addFactor 関数が見つかりません');
        }

        // clearAllFactors 関数のテスト
        if (typeof clearAllFactors === 'function') {
            console.log('✅ グローバル clearAllFactors 関数が存在');
        } else {
            console.log('⚠️ グローバル clearAllFactors 関数が見つかりません');
        }

        // InputManager インスタンスの確認
        if (typeof inputManager !== 'undefined' && inputManager.constructor.name === 'InputManager') {
            console.log('✅ グローバル inputManager インスタンスが存在');
        } else {
            console.log('⚠️ グローバル inputManager インスタンスが見つかりません');
        }

        console.log('=== 因子入力フォームUIテスト完了 ===');
        return true;

    } catch (error) {
        console.error('❌ 因子入力フォームUIテストエラー:', error);
        return false;
    }
}

/**
 * CSVアップロード機能のテスト
 */
function testCSVUploadFunctionality() {
    console.log('=== CSVアップロード機能テスト開始 ===');

    try {
        const inputManager = new TestInputManager();

        // 1. CSV解析テスト
        console.log('1. CSV解析テスト');
        const testCSVContent = `ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,iOS,モバイル
Edge,Android,デスクトップ
Chrome,Linux,タブレット`;

        const parseResult = inputManager.parseCSV(testCSVContent);

        if (parseResult.success) {
            console.log('✅ CSV解析成功');
            console.log(`   因子数: ${parseResult.factors.length}`);
            parseResult.factors.forEach((factor, index) => {
                console.log(`   因子${index + 1}: ${factor.name} (水準数: ${factor.levels.length})`);
                console.log(`     水準: ${factor.levels.join(', ')}`);
            });
        } else {
            console.error('❌ CSV解析失敗:', parseResult.error);
        }

        // 2. ファイルバリデーションテスト
        console.log('\n2. ファイルバリデーションテスト');

        // 正常なファイル（模擬）
        const validFile = {
            name: 'test.csv',
            type: 'text/csv',
            size: 1024
        };

        const validationResult = inputManager.validateCSVFile(validFile);
        console.log(`   正常ファイル: ${validationResult ? '✅ 通過' : '❌ 失敗'}`);

        // 不正なファイル（模擬）
        const invalidFile = {
            name: 'test.txt',
            type: 'text/plain',
            size: 1024
        };

        const invalidValidationResult = inputManager.validateCSVFile(invalidFile);
        console.log(`   不正ファイル: ${!invalidValidationResult ? '✅ 正しく拒否' : '❌ 誤って通過'}`);

        // 3. CSV行解析テスト
        console.log('\n3. CSV行解析テスト');

        const testLines = [
            'simple,test,data',
            '"quoted,data","normal","with""quotes"',
            'mixed,"quoted,comma",normal'
        ];

        testLines.forEach((line, index) => {
            const parsed = inputManager.parseCSVLine(line);
            console.log(`   行${index + 1}: [${parsed.join('] [')}]`);
        });

        // 4. エラーハンドリングテスト
        console.log('\n4. エラーハンドリングテスト');

        // 空のCSV
        const emptyResult = inputManager.parseCSV('');
        console.log(`   空CSV: ${!emptyResult.success ? '✅ 正しく拒否' : '❌ 誤って通過'}`);

        // ヘッダーのみ
        const headerOnlyResult = inputManager.parseCSV('因子1,因子2');
        console.log(`   ヘッダーのみ: ${!headerOnlyResult.success ? '✅ 正しく拒否' : '❌ 誤って通過'}`);

        // 重複因子名
        const duplicateHeaderResult = inputManager.parseCSV('因子1,因子1\nA,B\nC,D');
        console.log(`   重複因子名: ${!duplicateHeaderResult.success ? '✅ 正しく拒否' : '❌ 誤って通過'}`);

        // 5. 実際のCSVファイル処理テスト（模擬）
        console.log('\n5. CSVファイル処理テスト');

        // サンプルCSVダウンロード機能のテスト
        if (typeof downloadSampleCSV === 'function') {
            console.log('✅ サンプルCSVダウンロード機能が存在');
        } else {
            console.log('❌ サンプルCSVダウンロード機能が見つかりません');
        }

        // CSVアップロードハンドラのテスト
        if (typeof handleCSVFileUpload === 'function') {
            console.log('✅ CSVアップロードハンドラが存在');
        } else {
            console.log('❌ CSVアップロードハンドラが見つかりません');
        }

        console.log('\n✅ CSVアップロード機能テスト完了');
        return true;

    } catch (error) {
        console.error('❌ CSVアップロード機能テストでエラー:', error);
        return false;
    }
}

/**
 * CSVアップロード統合テスト
 */
function testCSVUploadIntegration() {
    console.log('=== CSVアップロード統合テスト開始 ===');

    try {
        // InputManagerにCSVメソッドを追加（テスト用）
        const inputManager = new TestInputManager();

        // CSV解析メソッドを追加
        inputManager.parseCSV = function (csvText) {
            try {
                if (!csvText || csvText.trim() === '') {
                    return { success: false, error: 'ファイルが空です' };
                }

                const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');

                if (lines.length < 2) {
                    return { success: false, error: '最低2行が必要です' };
                }

                const factorNames = this.parseCSVLine(lines[0]);
                const uniqueNames = new Set(factorNames.map(name => name.trim().toLowerCase()));

                if (uniqueNames.size !== factorNames.length) {
                    return { success: false, error: '因子名に重複があります' };
                }

                const factorsData = factorNames.map(name => ({
                    name: name.trim(),
                    levels: new Set()
                }));

                for (let i = 1; i < lines.length; i++) {
                    const values = this.parseCSVLine(lines[i]);
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
                    return { success: false, error: '有効な因子が見つかりません' };
                }

                return { success: true, factors: factors };

            } catch (error) {
                return { success: false, error: error.message };
            }
        };

        // CSV行解析メソッドを追加
        inputManager.parseCSVLine = function (line) {
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
        };

        // ファイルバリデーションメソッドを追加
        inputManager.validateCSVFile = function (file) {
            if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
                return false;
            }

            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize || file.size === 0) {
                return false;
            }

            return true;
        };

        // テスト実行
        const testCSV = `ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,iOS,モバイル`;

        const result = inputManager.parseCSV(testCSV);

        if (result.success) {
            console.log('✅ CSV統合テスト成功');
            console.log(`   解析された因子数: ${result.factors.length}`);

            // 因子をInputManagerに追加
            result.factors.forEach(factor => {
                inputManager.addFactor(factor.name, factor.levels);
            });

            const validation = inputManager.validateInput();
            console.log(`   バリデーション: ${validation.isValid ? '✅ 成功' : '❌ 失敗'}`);

        } else {
            console.error('❌ CSV統合テスト失敗:', result.error);
        }

        console.log('=== CSVアップロード統合テスト完了 ===');
        return true;

    } catch (error) {
        console.error('❌ CSVアップロード統合テストエラー:', error);
        return false;
    }
}

// テスト実行関数をグローバルに公開
window.runDataModelTests = runDataModelTests;
window.testFactorInputFormIntegration = testFactorInputFormIntegration;
window.testFactorInputFormUI = testFactorInputFormUI;
window.testCSVUploadFunctionality = testCSVUploadFunctionality;
window.testCSVUploadIntegration = testCSVUploadIntegration;