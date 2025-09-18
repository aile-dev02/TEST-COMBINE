/**
 * 統合テストとブラウザ互換性テスト実装
 * Requirements: 1.2, 1.3
 */

/**
 * 統合テストフレームワーク
 */
class IntegrationTestFramework {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: [],
            browserInfo: this.getBrowserInfo()
        };
        this.testTimeout = 30000; // 30秒タイムアウト
    }
    
    /**
     * ブラウザ情報の取得
     */
    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        const browserInfo = {
            userAgent: userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth
            }
        };
        
        // ブラウザ判定
        if (userAgent.includes('Chrome')) {
            browserInfo.browser = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
            browserInfo.browser = 'Firefox';
        } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
            browserInfo.browser = 'Safari';
        } else if (userAgent.includes('Edge')) {
            browserInfo.browser = 'Edge';
        } else {
            browserInfo.browser = 'Unknown';
        }
        
        return browserInfo;
    }
    
    /**
     * テストケースを追加
     */
    describe(suiteName, suiteFunction) {
        this.currentSuite = suiteName;
        console.log(`\n=== ${suiteName} ===`);
        suiteFunction.call(this);
        this.currentSuite = null;
    }
    
    /**
     * 統合テストケースを追加
     */
    it(name, testFunction) {
        this.tests.push({ 
            suite: this.currentSuite,
            name, 
            testFunction,
            type: 'integration'
        });
    }
    
    /**
     * ブラウザ互換性テストケースを追加
     */
    browserTest(name, testFunction) {
        this.tests.push({ 
            suite: this.currentSuite,
            name, 
            testFunction,
            type: 'browser'
        });
    }
    
    /**
     * レスポンシブデザインテストケースを追加
     */
    responsiveTest(name, testFunction) {
        this.tests.push({ 
            suite: this.currentSuite,
            name, 
            testFunction,
            type: 'responsive'
        });
    }
    
    /**
     * アサーション関数群
     */
    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} - Expected true, but got false`);
        }
    }
    
    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} - Expected false, but got true`);
        }
    }
    
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} - Expected: ${expected}, Actual: ${actual}`);
        }
    }
    
    assertElementExists(selector, message = '') {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`${message} - Element not found: ${selector}`);
        }
        return element;
    }
    
    assertElementVisible(selector, message = '') {
        const element = this.assertElementExists(selector, message);
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            throw new Error(`${message} - Element is not visible: ${selector}`);
        }
        return element;
    }
    
    /**
     * 非同期テストのサポート
     */
    async waitFor(condition, timeout = 5000, interval = 100) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error(`Timeout waiting for condition after ${timeout}ms`);
    }
    
    /**
     * DOM要素の操作
     */
    simulateClick(element) {
        const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
    
    simulateInput(element, value) {
        element.value = value;
        const event = new Event('input', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
    
    simulateChange(element, value) {
        element.value = value;
        const event = new Event('change', {
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }
    
    /**
     * 全テストを実行
     */
    async runAll() {
        console.log('=== 統合テスト・ブラウザ互換性テスト実行開始 ===');
        console.log(`ブラウザ: ${this.results.browserInfo.browser}`);
        console.log(`プラットフォーム: ${this.results.browserInfo.platform}`);
        console.log(`ビューポート: ${this.results.browserInfo.viewport.width}x${this.results.browserInfo.viewport.height}`);
        
        this.results = { 
            passed: 0, 
            failed: 0, 
            total: 0, 
            details: [],
            browserInfo: this.results.browserInfo
        };
        
        for (const test of this.tests) {
            this.results.total++;
            
            try {
                // タイムアウト付きでテスト実行
                await Promise.race([
                    test.testFunction.call(this),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Test timeout')), this.testTimeout)
                    )
                ]);
                
                this.results.passed++;
                const message = `✅ ${test.suite ? test.suite + ' - ' : ''}${test.name} [${test.type}]`;
                console.log(message);
                this.results.details.push({ 
                    test: test.name, 
                    suite: test.suite, 
                    type: test.type,
                    status: 'passed' 
                });
            } catch (error) {
                this.results.failed++;
                const message = `❌ ${test.suite ? test.suite + ' - ' : ''}${test.name} [${test.type}]: ${error.message}`;
                console.error(message);
                this.results.details.push({ 
                    test: test.name, 
                    suite: test.suite, 
                    type: test.type,
                    status: 'failed', 
                    error: error.message 
                });
            }
        }
        
        this.printSummary();
        return this.results;
    }
    
    /**
     * テスト結果のサマリーを表示
     */
    printSummary() {
        console.log('\n=== 統合テスト結果サマリー ===');
        console.log(`総テスト数: ${this.results.total}`);
        console.log(`成功: ${this.results.passed}`);
        console.log(`失敗: ${this.results.failed}`);
        console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        // テストタイプ別の結果
        const typeResults = {};
        this.results.details.forEach(detail => {
            if (!typeResults[detail.type]) {
                typeResults[detail.type] = { passed: 0, failed: 0, total: 0 };
            }
            typeResults[detail.type].total++;
            if (detail.status === 'passed') {
                typeResults[detail.type].passed++;
            } else {
                typeResults[detail.type].failed++;
            }
        });
        
        console.log('\nテストタイプ別結果:');
        Object.entries(typeResults).forEach(([type, result]) => {
            const successRate = ((result.passed / result.total) * 100).toFixed(1);
            console.log(`  ${type}: ${result.passed}/${result.total} 成功 (${successRate}%)`);
        });
        
        if (this.results.failed > 0) {
            console.log('\n失敗したテスト:');
            this.results.details
                .filter(detail => detail.status === 'failed')
                .forEach(detail => {
                    console.log(`  - ${detail.suite ? detail.suite + ' - ' : ''}${detail.test} [${detail.type}]: ${detail.error}`);
                });
        }
    }
}

// 統合テストフレームワークのインスタンス作成
const integrationTestFramework = new IntegrationTestFramework();

/**
 * 完全フローの統合テスト
 */
integrationTestFramework.describe('完全フロー統合テスト', function() {
    
    this.it('因子入力からテスト生成までの完全フロー', async function() {
        // 1. 因子入力フォームの確認
        this.assertElementExists('#factors-container', '因子コンテナが存在しない');
        
        // 2. 因子追加ボタンのクリック
        const addFactorBtn = this.assertElementExists('#add-factor-btn', '因子追加ボタンが存在しない');
        this.simulateClick(addFactorBtn);
        
        // 3. 因子フォームが追加されることを確認
        await this.waitFor(() => document.querySelectorAll('.factor-input').length > 0);
        
        // 4. 因子名と水準を入力
        const factorNameInput = this.assertElementExists('.factor-name-input', '因子名入力フィールドが存在しない');
        const factorLevelsInput = this.assertElementExists('.factor-levels-input', '水準入力フィールドが存在しない');
        
        this.simulateInput(factorNameInput, 'ブラウザ');
        this.simulateInput(factorLevelsInput, 'Chrome, Firefox, Safari');
        
        // 5. 2つ目の因子を追加
        this.simulateClick(addFactorBtn);
        await this.waitFor(() => document.querySelectorAll('.factor-input').length >= 2);
        
        const factorInputs = document.querySelectorAll('.factor-input');
        const secondFactorNameInput = factorInputs[1].querySelector('.factor-name-input');
        const secondFactorLevelsInput = factorInputs[1].querySelector('.factor-levels-input');
        
        this.simulateInput(secondFactorNameInput, 'OS');
        this.simulateInput(secondFactorLevelsInput, 'Windows, Mac, Linux');
        
        // 6. ペアワイズ生成ボタンをクリック
        const pairwiseBtn = this.assertElementExists('#generate-pairwise-btn', 'ペアワイズ生成ボタンが存在しない');
        this.simulateClick(pairwiseBtn);
        
        // 7. 結果テーブルが表示されることを確認
        await this.waitFor(() => {
            const resultsTable = document.querySelector('#results-table');
            return resultsTable && resultsTable.style.display !== 'none';
        });
        
        // 8. テスト結果の検証
        const resultsTable = this.assertElementVisible('#results-table', '結果テーブルが表示されていない');
        const rows = resultsTable.querySelectorAll('tbody tr');
        this.assertTrue(rows.length > 0, 'テストケースが生成されていない');
        
        // 9. CSVダウンロードボタンの確認
        this.assertElementExists('#download-csv-btn', 'CSVダウンロードボタンが存在しない');
        
        console.log(`完全フローテスト成功: ${rows.length}件のテストケースが生成されました`);
    });
    
    this.it('CSVアップロードからテスト生成までのフロー', async function() {
        // 1. CSVアップロード領域の確認
        this.assertElementExists('#csv-upload-area', 'CSVアップロード領域が存在しない');
        
        // 2. サンプルCSVの作成（模擬）
        const csvContent = `ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,iOS,モバイル`;
        
        // 3. CSVファイルの模擬アップロード
        const fileInput = this.assertElementExists('#csv-file-input', 'CSVファイル入力が存在しない');
        
        // Fileオブジェクトをシミュレート
        const mockFile = new File([csvContent], 'test.csv', { type: 'text/csv' });
        
        // ファイル選択イベントをシミュレート
        Object.defineProperty(fileInput, 'files', {
            value: [mockFile],
            writable: false,
        });
        
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
        
        // 4. ファイル処理の完了を待機
        await this.waitFor(() => {
            const factorInputs = document.querySelectorAll('.factor-input');
            return factorInputs.length >= 3; // 3つの因子が読み込まれるはず
        });
        
        // 5. 読み込まれた因子の確認
        const factorInputs = document.querySelectorAll('.factor-input');
        this.assertEqual(factorInputs.length, 3, '期待される因子数と異なる');
        
        // 6. ペアワイズ生成の実行
        const pairwiseBtn = this.assertElementExists('#generate-pairwise-btn', 'ペアワイズ生成ボタンが存在しない');
        this.simulateClick(pairwiseBtn);
        
        // 7. 結果の確認
        await this.waitFor(() => {
            const resultsTable = document.querySelector('#results-table');
            return resultsTable && resultsTable.style.display !== 'none';
        });
        
        console.log('CSVアップロードフローテスト成功');
    });
    
    this.it('エラーハンドリングの統合テスト', async function() {
        // 1. 因子なしでの生成試行
        const clearBtn = document.querySelector('#clear-all-btn');
        if (clearBtn) {
            this.simulateClick(clearBtn);
        }
        
        // 2. 因子が空の状態でペアワイズ生成を試行
        const pairwiseBtn = this.assertElementExists('#generate-pairwise-btn', 'ペアワイズ生成ボタンが存在しない');
        this.simulateClick(pairwiseBtn);
        
        // 3. エラーメッセージの表示を確認
        await this.waitFor(() => {
            const toasts = document.querySelectorAll('.toast');
            return toasts.length > 0;
        });
        
        // 4. 不正な因子データでの生成試行
        const addFactorBtn = this.assertElementExists('#add-factor-btn', '因子追加ボタンが存在しない');
        this.simulateClick(addFactorBtn);
        
        await this.waitFor(() => document.querySelectorAll('.factor-input').length > 0);
        
        const factorNameInput = this.assertElementExists('.factor-name-input', '因子名入力フィールドが存在しない');
        const factorLevelsInput = this.assertElementExists('.factor-levels-input', '水準入力フィールドが存在しない');
        
        // 水準を1つだけ設定（エラーケース）
        this.simulateInput(factorNameInput, 'テスト因子');
        this.simulateInput(factorLevelsInput, '単一水準');
        
        // 5. 生成試行
        this.simulateClick(pairwiseBtn);
        
        // 6. バリデーションエラーの確認
        await this.waitFor(() => {
            const errorElements = document.querySelectorAll('.text-danger, .alert-danger');
            return errorElements.length > 0;
        });
        
        console.log('エラーハンドリング統合テスト成功');
    });
});

/**
 * ブラウザ互換性テスト
 */
integrationTestFramework.describe('ブラウザ互換性テスト', function() {
    
    this.browserTest('JavaScript ES6+ 機能の対応確認', function() {
        // Map/Set の対応
        this.assertTrue(typeof Map === 'function', 'Map がサポートされていない');
        this.assertTrue(typeof Set === 'function', 'Set がサポートされていない');
        
        // Promise の対応
        this.assertTrue(typeof Promise === 'function', 'Promise がサポートされていない');
        
        // Arrow function の対応（間接的にチェック）
        const arrowFunc = () => true;
        this.assertTrue(arrowFunc(), 'Arrow function がサポートされていない');
        
        // Template literals の対応
        const template = `テスト${1 + 1}`;
        this.assertEqual(template, 'テスト2', 'Template literals がサポートされていない');
        
        // Destructuring の対応
        const [a, b] = [1, 2];
        this.assertEqual(a, 1, 'Destructuring がサポートされていない');
        
        console.log('JavaScript ES6+ 機能対応確認完了');
    });
    
    this.browserTest('Web API の対応確認', function() {
        // FileReader API
        this.assertTrue(typeof FileReader === 'function', 'FileReader API がサポートされていない');
        
        // Blob API
        this.assertTrue(typeof Blob === 'function', 'Blob API がサポートされていない');
        
        // URL API
        this.assertTrue(typeof URL === 'function' && typeof URL.createObjectURL === 'function', 'URL API がサポートされていない');
        
        // localStorage
        this.assertTrue(typeof localStorage === 'object', 'localStorage がサポートされていない');
        
        // Performance API
        this.assertTrue(typeof performance === 'object', 'Performance API がサポートされていない');
        
        console.log('Web API 対応確認完了');
    });
    
    this.browserTest('CSS機能の対応確認', function() {
        // CSS Grid の対応
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        this.assertEqual(testElement.style.display, 'grid', 'CSS Grid がサポートされていない');
        
        // CSS Flexbox の対応
        testElement.style.display = 'flex';
        this.assertEqual(testElement.style.display, 'flex', 'CSS Flexbox がサポートされていない');
        
        // CSS Custom Properties の対応
        testElement.style.setProperty('--test-var', 'test');
        this.assertEqual(testElement.style.getPropertyValue('--test-var'), 'test', 'CSS Custom Properties がサポートされていない');
        
        console.log('CSS機能対応確認完了');
    });
    
    this.browserTest('Bootstrap 5 の動作確認', function() {
        // Bootstrap JavaScript の確認
        this.assertTrue(typeof bootstrap === 'object', 'Bootstrap JavaScript が読み込まれていない');
        
        // Bootstrap CSS の確認（間接的）
        const testElement = document.createElement('div');
        testElement.className = 'container';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        this.assertTrue(computedStyle.width !== 'auto', 'Bootstrap CSS が適用されていない');
        
        document.body.removeChild(testElement);
        
        console.log('Bootstrap 5 動作確認完了');
    });
    
    this.browserTest('文字エンコーディングの確認', function() {
        // 日本語文字の正常表示
        const testString = 'テスト組み合わせ生成ツール';
        const testElement = document.createElement('div');
        testElement.textContent = testString;
        document.body.appendChild(testElement);
        
        this.assertEqual(testElement.textContent, testString, '日本語文字が正常に表示されない');
        
        document.body.removeChild(testElement);
        
        // 特殊文字の処理
        const specialChars = '①②③④⑤';
        const specialElement = document.createElement('div');
        specialElement.textContent = specialChars;
        document.body.appendChild(specialElement);
        
        this.assertEqual(specialElement.textContent, specialChars, '特殊文字が正常に表示されない');
        
        document.body.removeChild(specialElement);
        
        console.log('文字エンコーディング確認完了');
    });
});

/**
 * レスポンシブデザインテスト
 */
integrationTestFramework.describe('レスポンシブデザインテスト', function() {
    
    this.responsiveTest('ビューポートサイズの検出', function() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        this.assertTrue(viewport.width > 0, 'ビューポート幅が取得できない');
        this.assertTrue(viewport.height > 0, 'ビューポート高さが取得できない');
        
        // ブレークポイントの判定
        let breakpoint = 'xs';
        if (viewport.width >= 1400) breakpoint = 'xxl';
        else if (viewport.width >= 1200) breakpoint = 'xl';
        else if (viewport.width >= 992) breakpoint = 'lg';
        else if (viewport.width >= 768) breakpoint = 'md';
        else if (viewport.width >= 576) breakpoint = 'sm';
        
        console.log(`現在のブレークポイント: ${breakpoint} (${viewport.width}x${viewport.height})`);
        
        // body要素にブレークポイントクラスが設定されているか確認
        const bodyClasses = document.body.className;
        this.assertTrue(bodyClasses.includes('breakpoint-'), 'ブレークポイントクラスが設定されていない');
    });
    
    this.responsiveTest('モバイル表示の確認', function() {
        // メタビューポートタグの確認
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        this.assertTrue(viewportMeta !== null, 'viewport メタタグが設定されていない');
        
        const viewportContent = viewportMeta.getAttribute('content');
        this.assertTrue(viewportContent.includes('width=device-width'), 'viewport設定が正しくない');
        
        // タッチイベントの対応確認
        this.assertTrue('ontouchstart' in window || navigator.maxTouchPoints > 0, 'タッチイベントが検出されない場合があります（デスクトップ環境では正常）');
        
        console.log('モバイル表示確認完了');
    });
    
    this.responsiveTest('レスポンシブ要素の動作確認', function() {
        // コンテナ要素の確認
        const containers = document.querySelectorAll('.container, .container-fluid');
        this.assertTrue(containers.length > 0, 'Bootstrap コンテナが見つからない');
        
        // グリッドシステムの確認
        const cols = document.querySelectorAll('[class*="col-"]');
        if (cols.length > 0) {
            console.log(`グリッドカラム要素: ${cols.length}個`);
        }
        
        // レスポンシブテーブルの確認
        const responsiveTables = document.querySelectorAll('.table-responsive');
        if (responsiveTables.length > 0) {
            console.log(`レスポンシブテーブル: ${responsiveTables.length}個`);
        }
        
        console.log('レスポンシブ要素動作確認完了');
    });
    
    this.responsiveTest('画面サイズ変更への対応', async function() {
        const originalWidth = window.innerWidth;
        
        // 画面サイズ変更イベントのシミュレーション
        const resizeEvent = new Event('resize');
        window.dispatchEvent(resizeEvent);
        
        // リサイズ処理の完了を待機
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // ブレークポイントクラスの更新確認
        const bodyClasses = document.body.className;
        this.assertTrue(bodyClasses.includes('breakpoint-'), 'リサイズ後もブレークポイントクラスが維持されている');
        
        console.log('画面サイズ変更対応確認完了');
    });
});

/**
 * パフォーマンステスト
 */
integrationTestFramework.describe('パフォーマンステスト', function() {
    
    this.it('大量データでの処理性能', async function() {
        const startTime = performance.now();
        
        // 大量の因子を作成
        const factors = [];
        for (let i = 0; i < 10; i++) {
            const levels = [];
            for (let j = 0; j < 3; j++) {
                levels.push(`Level${j + 1}`);
            }
            factors.push(new Factor(`Factor${i + 1}`, levels));
        }
        
        // ペアワイズ生成
        const generator = new PairwiseGenerator();
        const testCases = generator.generate(factors);
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        
        this.assertTrue(executionTime < 5000, `処理時間が長すぎます: ${executionTime}ms`);
        this.assertTrue(testCases.length > 0, 'テストケースが生成されていない');
        
        console.log(`大量データ処理性能: ${executionTime.toFixed(2)}ms, ${testCases.length}件のテストケース`);
    });
    
    this.it('メモリ使用量の監視', function() {
        if (performance.memory) {
            const memoryInfo = {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
            
            console.log(`メモリ使用量: ${memoryInfo.used}MB / ${memoryInfo.total}MB (制限: ${memoryInfo.limit}MB)`);
            
            // メモリ使用量が制限の80%を超えていないことを確認
            const usageRatio = memoryInfo.used / memoryInfo.limit;
            this.assertTrue(usageRatio < 0.8, `メモリ使用量が多すぎます: ${(usageRatio * 100).toFixed(1)}%`);
        } else {
            console.log('メモリ情報が利用できません（Chrome以外のブラウザ）');
        }
    });
});

/**
 * 統合テスト実行関数
 */
async function runIntegrationTests() {
    console.log('統合テスト・ブラウザ互換性テスト実行を開始します...');
    
    try {
        const results = await integrationTestFramework.runAll();
        
        // テスト結果をグローバルに保存
        window.TestCombinationGenerator = window.TestCombinationGenerator || {};
        window.TestCombinationGenerator.integrationTestResults = results;
        
        // 詳細レポートの生成
        generateIntegrationTestReport(results);
        
        return results;
    } catch (error) {
        console.error('統合テスト実行中にエラーが発生しました:', error);
        throw error;
    }
}

/**
 * 統合テスト詳細レポートの生成
 */
function generateIntegrationTestReport(results) {
    console.log('\n=== 統合テスト詳細レポート ===');
    
    // ブラウザ情報
    console.log('\nブラウザ環境:');
    console.log(`  ブラウザ: ${results.browserInfo.browser}`);
    console.log(`  プラットフォーム: ${results.browserInfo.platform}`);
    console.log(`  言語: ${results.browserInfo.language}`);
    console.log(`  ビューポート: ${results.browserInfo.viewport.width}x${results.browserInfo.viewport.height}`);
    console.log(`  画面解像度: ${results.browserInfo.screen.width}x${results.browserInfo.screen.height}`);
    console.log(`  色深度: ${results.browserInfo.screen.colorDepth}bit`);
    
    // 要件カバレッジの確認
    console.log('\n=== 要件カバレッジ ===');
    console.log('✅ Requirement 1.2 (ブラウザ互換性): 主要ブラウザでの動作確認テスト実装済み');
    console.log('✅ Requirement 1.3 (レスポンシブデザイン): レスポンシブデザインテスト実装済み');
    
    // 互換性マトリックス
    console.log('\n=== ブラウザ互換性マトリックス ===');
    const compatibilityTests = results.details.filter(detail => detail.type === 'browser');
    const compatibilityResults = compatibilityTests.reduce((acc, test) => {
        acc[test.status] = (acc[test.status] || 0) + 1;
        return acc;
    }, {});
    
    console.log(`  互換性テスト: ${compatibilityResults.passed || 0}/${compatibilityTests.length} 成功`);
    
    // レスポンシブデザイン結果
    const responsiveTests = results.details.filter(detail => detail.type === 'responsive');
    const responsiveResults = responsiveTests.reduce((acc, test) => {
        acc[test.status] = (acc[test.status] || 0) + 1;
        return acc;
    }, {});
    
    console.log(`  レスポンシブテスト: ${responsiveResults.passed || 0}/${responsiveTests.length} 成功`);
    
    // 推奨事項
    console.log('\n=== 推奨事項 ===');
    if (results.browserInfo.browser === 'Unknown') {
        console.log('⚠️ 未知のブラウザが検出されました。主要ブラウザでの動作確認を推奨します。');
    }
    
    if (results.browserInfo.viewport.width < 768) {
        console.log('📱 モバイル環境で実行されています。デスクトップ環境でのテストも推奨します。');
    }
    
    if (results.failed > 0) {
        console.log('⚠️ 一部のテストが失敗しました。ブラウザ固有の問題がある可能性があります。');
    }
}

// ページ読み込み時にテストを実行（テストモード時）
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'integration' || urlParams.get('test') === 'all') {
            setTimeout(runIntegrationTests, 2000); // 他の初期化処理の後に実行
        }
    });
}

// エクスポート（モジュール環境用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        runIntegrationTests, 
        IntegrationTestFramework,
        integrationTestFramework
    };
}