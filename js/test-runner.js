/**
 * 統合テストランナー - 全テストの実行と管理
 * 単体テスト、統合テスト、ブラウザ互換性テストを統合実行
 */

/**
 * テストランナークラス
 */
class TestRunner {
    constructor() {
        this.results = {
            unit: null,
            integration: null,
            overall: {
                totalTests: 0,
                passedTests: 0,
                failedTests: 0,
                executionTime: 0,
                startTime: null,
                endTime: null
            }
        };
        this.config = {
            runUnitTests: true,
            runIntegrationTests: true,
            generateReport: true,
            showDetailedOutput: true,
            timeout: 60000 // 60秒
        };
    }
    
    /**
     * 全テストの実行
     */
    async runAllTests(config = {}) {
        this.config = { ...this.config, ...config };
        this.results.overall.startTime = Date.now();
        
        console.log('=== テスト組み合わせ生成ツール - 全テスト実行開始 ===');
        console.log(`実行時刻: ${new Date().toLocaleString('ja-JP')}`);
        console.log(`ブラウザ: ${navigator.userAgent}`);
        console.log(`ビューポート: ${window.innerWidth}x${window.innerHeight}`);
        
        try {
            // 1. 単体テストの実行
            if (this.config.runUnitTests) {
                console.log('\n--- 単体テスト実行 ---');
                if (typeof runUnitTests === 'function') {
                    this.results.unit = await this.executeWithTimeout(runUnitTests(), 'Unit Tests');
                } else {
                    console.warn('⚠️ 単体テスト関数が見つかりません');
                }
            }
            
            // 2. 統合テストの実行
            if (this.config.runIntegrationTests) {
                console.log('\n--- 統合テスト・ブラウザ互換性テスト実行 ---');
                if (typeof runIntegrationTests === 'function') {
                    this.results.integration = await this.executeWithTimeout(runIntegrationTests(), 'Integration Tests');
                } else {
                    console.warn('⚠️ 統合テスト関数が見つかりません');
                }
            }
            
            // 3. 結果の集計
            this.aggregateResults();
            
            // 4. レポート生成
            if (this.config.generateReport) {
                this.generateComprehensiveReport();
            }
            
            // 5. 結果の保存
            this.saveResults();
            
            console.log('\n=== 全テスト実行完了 ===');
            return this.results;
            
        } catch (error) {
            console.error('テスト実行中にエラーが発生しました:', error);
            this.results.overall.error = error.message;
            throw error;
        } finally {
            this.results.overall.endTime = Date.now();
            this.results.overall.executionTime = this.results.overall.endTime - this.results.overall.startTime;
        }
    }
    
    /**
     * タイムアウト付きでテストを実行
     */
    async executeWithTimeout(testPromise, testName) {
        try {
            return await Promise.race([
                testPromise,
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error(`${testName} timeout after ${this.config.timeout}ms`)), this.config.timeout)
                )
            ]);
        } catch (error) {
            console.error(`${testName} 実行エラー:`, error.message);
            return {
                passed: 0,
                failed: 1,
                total: 1,
                error: error.message,
                details: [{ test: testName, status: 'failed', error: error.message }]
            };
        }
    }
    
    /**
     * 結果の集計
     */
    aggregateResults() {
        let totalTests = 0;
        let passedTests = 0;
        let failedTests = 0;
        
        if (this.results.unit) {
            totalTests += this.results.unit.total || 0;
            passedTests += this.results.unit.passed || 0;
            failedTests += this.results.unit.failed || 0;
        }
        
        if (this.results.integration) {
            totalTests += this.results.integration.total || 0;
            passedTests += this.results.integration.passed || 0;
            failedTests += this.results.integration.failed || 0;
        }
        
        this.results.overall.totalTests = totalTests;
        this.results.overall.passedTests = passedTests;
        this.results.overall.failedTests = failedTests;
        this.results.overall.successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
    }
    
    /**
     * 包括的レポートの生成
     */
    generateComprehensiveReport() {
        console.log('\n=== 包括的テストレポート ===');
        
        // 全体サマリー
        console.log('\n📊 全体サマリー:');
        console.log(`  総テスト数: ${this.results.overall.totalTests}`);
        console.log(`  成功: ${this.results.overall.passedTests}`);
        console.log(`  失敗: ${this.results.overall.failedTests}`);
        console.log(`  成功率: ${this.results.overall.successRate.toFixed(1)}%`);
        console.log(`  実行時間: ${this.results.overall.executionTime}ms`);
        
        // 単体テスト結果
        if (this.results.unit) {
            console.log('\n🔬 単体テスト結果:');
            console.log(`  テスト数: ${this.results.unit.total}`);
            console.log(`  成功: ${this.results.unit.passed}`);
            console.log(`  失敗: ${this.results.unit.failed}`);
            console.log(`  成功率: ${((this.results.unit.passed / this.results.unit.total) * 100).toFixed(1)}%`);
            
            if (this.results.unit.details && this.config.showDetailedOutput) {
                const suiteResults = this.groupByTestSuite(this.results.unit.details);
                Object.entries(suiteResults).forEach(([suite, results]) => {
                    const successRate = ((results.passed / results.total) * 100).toFixed(1);
                    console.log(`    ${suite}: ${results.passed}/${results.total} (${successRate}%)`);
                });
            }
        }
        
        // 統合テスト結果
        if (this.results.integration) {
            console.log('\n🔗 統合テスト結果:');
            console.log(`  テスト数: ${this.results.integration.total}`);
            console.log(`  成功: ${this.results.integration.passed}`);
            console.log(`  失敗: ${this.results.integration.failed}`);
            console.log(`  成功率: ${((this.results.integration.passed / this.results.integration.total) * 100).toFixed(1)}%`);
            
            if (this.results.integration.details && this.config.showDetailedOutput) {
                const typeResults = this.groupByTestType(this.results.integration.details);
                Object.entries(typeResults).forEach(([type, results]) => {
                    const successRate = ((results.passed / results.total) * 100).toFixed(1);
                    console.log(`    ${type}: ${results.passed}/${results.total} (${successRate}%)`);
                });
            }
        }
        
        // 要件カバレッジ
        this.generateRequirementsCoverage();
        
        // 品質メトリクス
        this.generateQualityMetrics();
        
        // 推奨事項
        this.generateRecommendations();
    }
    
    /**
     * テストスイート別にグループ化
     */
    groupByTestSuite(details) {
        return details.reduce((acc, detail) => {
            const suite = detail.suite || 'その他';
            if (!acc[suite]) {
                acc[suite] = { passed: 0, failed: 0, total: 0 };
            }
            acc[suite].total++;
            if (detail.status === 'passed') {
                acc[suite].passed++;
            } else {
                acc[suite].failed++;
            }
            return acc;
        }, {});
    }
    
    /**
     * テストタイプ別にグループ化
     */
    groupByTestType(details) {
        return details.reduce((acc, detail) => {
            const type = detail.type || 'その他';
            if (!acc[type]) {
                acc[type] = { passed: 0, failed: 0, total: 0 };
            }
            acc[type].total++;
            if (detail.status === 'passed') {
                acc[type].passed++;
            } else {
                acc[type].failed++;
            }
            return acc;
        }, {});
    }
    
    /**
     * 要件カバレッジレポート
     */
    generateRequirementsCoverage() {
        console.log('\n📋 要件カバレッジ:');
        
        const requirements = [
            { id: '1.2', description: 'ブラウザ互換性', covered: this.isRequirementCovered('browser') },
            { id: '1.3', description: 'レスポンシブデザイン', covered: this.isRequirementCovered('responsive') },
            { id: '2.2', description: 'データバリデーション', covered: this.isRequirementCovered('validation') },
            { id: '3.2', description: 'アルゴリズム実行', covered: this.isRequirementCovered('algorithm') },
            { id: '4.2', description: '3因子間網羅', covered: this.isRequirementCovered('threeway') }
        ];
        
        requirements.forEach(req => {
            const status = req.covered ? '✅' : '❌';
            console.log(`  ${status} Requirement ${req.id}: ${req.description}`);
        });
        
        const coverageRate = (requirements.filter(req => req.covered).length / requirements.length) * 100;
        console.log(`\n要件カバレッジ率: ${coverageRate.toFixed(1)}%`);
    }
    
    /**
     * 要件がカバーされているかチェック
     */
    isRequirementCovered(requirementType) {
        const allDetails = [
            ...(this.results.unit?.details || []),
            ...(this.results.integration?.details || [])
        ];
        
        const typeMapping = {
            'browser': ['browser', 'ブラウザ互換性'],
            'responsive': ['responsive', 'レスポンシブ'],
            'validation': ['バリデーション', 'validation', 'データバリデーション'],
            'algorithm': ['アルゴリズム', 'algorithm', 'ペアワイズ'],
            'threeway': ['3因子', 'ThreeWay', '3-way']
        };
        
        const keywords = typeMapping[requirementType] || [];
        
        return allDetails.some(detail => {
            const testName = (detail.test || '').toLowerCase();
            const suiteName = (detail.suite || '').toLowerCase();
            const testType = (detail.type || '').toLowerCase();
            
            return keywords.some(keyword => 
                testName.includes(keyword.toLowerCase()) ||
                suiteName.includes(keyword.toLowerCase()) ||
                testType.includes(keyword.toLowerCase())
            ) && detail.status === 'passed';
        });
    }
    
    /**
     * 品質メトリクス
     */
    generateQualityMetrics() {
        console.log('\n📈 品質メトリクス:');
        
        // テスト密度
        const testDensity = this.results.overall.totalTests;
        console.log(`  テスト密度: ${testDensity} テスト`);
        
        // 欠陥密度
        const defectDensity = this.results.overall.failedTests;
        console.log(`  欠陥密度: ${defectDensity} 失敗`);
        
        // 実行効率
        const executionEfficiency = this.results.overall.totalTests / (this.results.overall.executionTime / 1000);
        console.log(`  実行効率: ${executionEfficiency.toFixed(2)} テスト/秒`);
        
        // 信頼性指標
        const reliability = this.results.overall.successRate;
        let reliabilityLevel = '低';
        if (reliability >= 95) reliabilityLevel = '非常に高い';
        else if (reliability >= 90) reliabilityLevel = '高い';
        else if (reliability >= 80) reliabilityLevel = '中程度';
        else if (reliability >= 70) reliabilityLevel = 'やや低い';
        
        console.log(`  信頼性レベル: ${reliabilityLevel} (${reliability.toFixed(1)}%)`);
        
        // メモリ使用量（利用可能な場合）
        if (performance.memory) {
            const memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            console.log(`  メモリ使用量: ${memoryUsage}MB`);
        }
    }
    
    /**
     * 推奨事項の生成
     */
    generateRecommendations() {
        console.log('\n💡 推奨事項:');
        
        const recommendations = [];
        
        // 成功率に基づく推奨事項
        if (this.results.overall.successRate < 90) {
            recommendations.push('テスト成功率が90%を下回っています。失敗したテストを確認し、実装を改善してください。');
        }
        
        // 実行時間に基づく推奨事項
        if (this.results.overall.executionTime > 30000) {
            recommendations.push('テスト実行時間が30秒を超えています。テストの最適化を検討してください。');
        }
        
        // 失敗したテストに基づく推奨事項
        if (this.results.overall.failedTests > 0) {
            recommendations.push('失敗したテストがあります。詳細なエラーログを確認し、問題を修正してください。');
        }
        
        // ブラウザ固有の推奨事項
        const browserInfo = this.results.integration?.browserInfo;
        if (browserInfo) {
            if (browserInfo.browser === 'Unknown') {
                recommendations.push('未知のブラウザが検出されました。主要ブラウザ（Chrome、Firefox、Safari、Edge）での動作確認を推奨します。');
            }
            
            if (browserInfo.viewport.width < 768) {
                recommendations.push('モバイル環境で実行されています。デスクトップ環境でのテストも実施してください。');
            }
        }
        
        // メモリ使用量に基づく推奨事項
        if (performance.memory) {
            const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
            if (memoryUsage > 0.8) {
                recommendations.push('メモリ使用量が多くなっています。大規模データセットでのテストを制限することを検討してください。');
            }
        }
        
        // 推奨事項の表示
        if (recommendations.length === 0) {
            console.log('  🎉 特に問題は検出されませんでした。優秀な実装です！');
        } else {
            recommendations.forEach((recommendation, index) => {
                console.log(`  ${index + 1}. ${recommendation}`);
            });
        }
    }
    
    /**
     * 結果の保存
     */
    saveResults() {
        try {
            // グローバルオブジェクトに保存
            window.TestCombinationGenerator = window.TestCombinationGenerator || {};
            window.TestCombinationGenerator.testResults = this.results;
            
            // ローカルストレージに保存
            const resultsForStorage = {
                timestamp: new Date().toISOString(),
                overall: this.results.overall,
                summary: {
                    unit: this.results.unit ? {
                        total: this.results.unit.total,
                        passed: this.results.unit.passed,
                        failed: this.results.unit.failed
                    } : null,
                    integration: this.results.integration ? {
                        total: this.results.integration.total,
                        passed: this.results.integration.passed,
                        failed: this.results.integration.failed
                    } : null
                }
            };
            
            localStorage.setItem('testResults', JSON.stringify(resultsForStorage));
            console.log('\n💾 テスト結果をローカルストレージに保存しました');
            
        } catch (error) {
            console.warn('テスト結果の保存に失敗しました:', error.message);
        }
    }
    
    /**
     * 保存された結果の読み込み
     */
    loadSavedResults() {
        try {
            const savedResults = localStorage.getItem('testResults');
            if (savedResults) {
                const parsed = JSON.parse(savedResults);
                console.log('💾 保存されたテスト結果:');
                console.log(`  実行日時: ${new Date(parsed.timestamp).toLocaleString('ja-JP')}`);
                console.log(`  総テスト数: ${parsed.overall.totalTests}`);
                console.log(`  成功率: ${parsed.overall.successRate.toFixed(1)}%`);
                return parsed;
            }
        } catch (error) {
            console.warn('保存されたテスト結果の読み込みに失敗しました:', error.message);
        }
        return null;
    }
    
    /**
     * テスト結果のエクスポート
     */
    exportResults(format = 'json') {
        const exportData = {
            metadata: {
                timestamp: new Date().toISOString(),
                browser: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href
            },
            results: this.results
        };
        
        let content, filename, mimeType;
        
        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                filename = `test-results-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
                
            case 'csv':
                content = this.convertToCSV(exportData);
                filename = `test-results-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
                
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
        
        // ダウンロード実行
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`📄 テスト結果を ${format.toUpperCase()} 形式でエクスポートしました: ${filename}`);
    }
    
    /**
     * CSV形式への変換
     */
    convertToCSV(exportData) {
        const rows = [
            ['Test Suite', 'Test Name', 'Type', 'Status', 'Error']
        ];
        
        const allDetails = [
            ...(exportData.results.unit?.details || []).map(d => ({ ...d, category: 'Unit' })),
            ...(exportData.results.integration?.details || []).map(d => ({ ...d, category: 'Integration' }))
        ];
        
        allDetails.forEach(detail => {
            rows.push([
                detail.suite || '',
                detail.test || '',
                detail.type || detail.category || '',
                detail.status || '',
                detail.error || ''
            ]);
        });
        
        return rows.map(row => 
            row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }
}

// グローバルテストランナーのインスタンス
const testRunner = new TestRunner();

/**
 * 全テスト実行の便利関数
 */
async function runAllTests(config = {}) {
    return await testRunner.runAllTests(config);
}

/**
 * 特定のテストタイプのみ実行
 */
async function runSpecificTests(testTypes = ['unit', 'integration']) {
    const config = {
        runUnitTests: testTypes.includes('unit'),
        runIntegrationTests: testTypes.includes('integration')
    };
    return await testRunner.runAllTests(config);
}

/**
 * クイックテスト（基本的なテストのみ）
 */
async function runQuickTests() {
    const config = {
        runUnitTests: true,
        runIntegrationTests: false,
        showDetailedOutput: false,
        timeout: 10000
    };
    return await testRunner.runAllTests(config);
}

// ページ読み込み時の自動実行
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function() {
        const urlParams = new URLSearchParams(window.location.search);
        const testParam = urlParams.get('test');
        
        if (testParam === 'all') {
            setTimeout(() => runAllTests(), 3000);
        } else if (testParam === 'quick') {
            setTimeout(() => runQuickTests(), 2000);
        } else if (testParam === 'unit') {
            setTimeout(() => runSpecificTests(['unit']), 1000);
        } else if (testParam === 'integration') {
            setTimeout(() => runSpecificTests(['integration']), 2000);
        }
    });
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        TestRunner, 
        testRunner, 
        runAllTests, 
        runSpecificTests, 
        runQuickTests 
    };
}