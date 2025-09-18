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
     * 全テストを実行
     * @returns {Object} テスト結果
     */
    runAll() {
        this.results = { passed: 0, failed: 0, total: 0 };
        
        console.log('=== テスト実行開始 ===');
        
        this.tests.forEach(({ name, testFunction }) => {
            this.results.total++;
            
            try {
                testFunction.call(this);
                this.results.passed++;
                console.log(`✅ ${name}`);
            } catch (error) {
                this.results.failed++;
                console.error(`❌ ${name}: ${error.message}`);
            }
        });
        
        console.log('=== テスト実行完了 ===');
        console.log(`総テスト数: ${this.results.total}`);
        console.log(`成功: ${this.results.passed}`);
        console.log(`失敗: ${this.results.failed}`);
        console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        return this.results;
    }
}

// グローバルテストフレームワークインスタンス
const testFramework = new SimpleTestFramework();

console.log('テストフレームワークが初期化されました');