/**
 * Test Combination Generator - Main JavaScript File
 * メインアプリケーションの初期化とコア機能
 */

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('テスト組み合わせ生成ツールが初期化されました');
    
    // Bootstrap tooltips の初期化
    initializeBootstrapComponents();
    
    // レスポンシブ対応の確認
    checkResponsiveLayout();
    
    // アプリケーション状態の初期化
    initializeAppState();
});

/**
 * Bootstrap コンポーネントの初期化
 */
function initializeBootstrapComponents() {
    // Tooltips の初期化
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Popovers の初期化
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    console.log('Bootstrap コンポーネントが初期化されました');
}

/**
 * レスポンシブレイアウトの確認
 */
function checkResponsiveLayout() {
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };
    
    // ブレークポイントの定義（Bootstrap 5準拠）
    const breakpoints = {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400
    };
    
    let currentBreakpoint = 'xs';
    for (const [name, width] of Object.entries(breakpoints)) {
        if (viewport.width >= width) {
            currentBreakpoint = name;
        }
    }
    
    console.log(`現在のビューポート: ${viewport.width}x${viewport.height} (${currentBreakpoint})`);
    
    // レスポンシブ対応のクラスを body に追加
    document.body.className = document.body.className.replace(/\bbreakpoint-\w+\b/g, '');
    document.body.classList.add(`breakpoint-${currentBreakpoint}`);
}

/**
 * アプリケーション状態の初期化
 */
function initializeAppState() {
    // アプリケーションの基本状態
    window.TestCombinationGenerator = {
        version: '1.0.0',
        initialized: true,
        factors: [],
        testCases: [],
        currentAlgorithm: null,
        
        // 設定
        config: {
            maxFactors: 20,
            maxLevelsPerFactor: 50,
            maxCombinations: 100000
        }
    };
    
    // ResultsTableManager の初期化
    if (!resultsTableManager) {
        resultsTableManager = new ResultsTableManager();
    }
    
    // CoverageCalculator の初期化
    if (!coverageCalculator) {
        coverageCalculator = new CoverageCalculator();
    }
    
    // アクセシビリティ機能の初期化
    initializeAccessibilityFeatures();
    
    // キーボードナビゲーションの初期化
    initializeKeyboardNavigation();
    
    console.log('アプリケーション状態が初期化されました', window.TestCombinationGenerator);
}

/**
 * アクセシビリティ機能の初期化
 */
function initializeAccessibilityFeatures() {
    // ARIA ライブリージョンの設定
    const liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
    
    // フォーカス管理の改善
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // 高コントラストモードの検出
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
        document.body.classList.add('high-contrast');
    }
    
    // 動きの軽減設定の検出
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    console.log('アクセシビリティ機能が初期化されました');
}

/**
 * キーボードナビゲーションの初期化
 */
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // Escキーでモーダルやオーバーレイを閉じる
        if (event.key === 'Escape') {
            closeActiveModals();
        }
        
        // Ctrl+Enterでメイン操作を実行
        if (event.ctrlKey && event.key === 'Enter') {
            const generateBtn = document.getElementById('generate-btn');
            if (generateBtn && !generateBtn.disabled) {
                generateBtn.click();
            }
        }
        
        // Alt+数字でアルゴリズム選択
        if (event.altKey && event.key >= '1' && event.key <= '3') {
            const algorithms = ['pairwise', 'threeway', 'allcombinations'];
            const index = parseInt(event.key) - 1;
            if (algorithms[index]) {
                selectAlgorithm(algorithms[index]);
            }
        }
    });
}

/**
 * フォーカスイン時の処理
 */
function handleFocusIn(event) {
    const element = event.target;
    
    // フォーカス可視化の改善
    if (element.matches('button, input, select, textarea, [tabindex]')) {
        element.classList.add('focus-visible');
    }
    
    // コンテキストヘルプの表示
    showContextualHelp(element);
}

/**
 * フォーカスアウト時の処理
 */
function handleFocusOut(event) {
    const element = event.target;
    element.classList.remove('focus-visible');
    hideContextualHelp();
}

/**
 * コンテキストヘルプの表示
 */
function showContextualHelp(element) {
    const helpText = element.getAttribute('aria-describedby');
    if (helpText) {
        const helpElement = document.getElementById(helpText);
        if (helpElement) {
            helpElement.classList.add('help-visible');
        }
    }
}

/**
 * コンテキストヘルプの非表示
 */
function hideContextualHelp() {
    document.querySelectorAll('.help-visible').forEach(el => {
        el.classList.remove('help-visible');
    });
}

/**
 * アクティブなモーダルを閉じる
 */
function closeActiveModals() {
    // Bootstrap モーダルを閉じる
    const activeModals = document.querySelectorAll('.modal.show');
    activeModals.forEach(modal => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) {
            bsModal.hide();
        }
    });
    
    // ローディングオーバーレイを閉じる
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay && loadingOverlay.style.display !== 'none') {
        toggleLoading(false);
    }
}

/**
 * ARIAライブリージョンでの通知
 */
function announceToScreenReader(message) {
    const liveRegion = document.getElementById('aria-live-region');
    if (liveRegion) {
        liveRegion.textContent = message;
        
        // 短時間後にクリア
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 1000);
    }
}

/**
 * アルゴリズム選択機能
 */
function selectAlgorithm(algorithmType) {
    // 前の選択をクリア
    document.querySelectorAll('.algorithm-card').forEach(card => {
        card.classList.remove('selected', 'border-primary', 'border-info', 'border-warning');
    });
    
    document.querySelectorAll('[id^="btn-"]').forEach(btn => {
        btn.textContent = '選択';
        btn.classList.remove('btn-primary', 'btn-info', 'btn-warning');
        btn.classList.add('btn-outline-primary', 'btn-outline-info', 'btn-outline-warning');
    });
    
    // 新しい選択を適用
    const selectedCard = document.querySelector(`[data-algorithm="${algorithmType}"]`);
    const selectedBtn = document.getElementById(`btn-${algorithmType}`);
    
    if (selectedCard && selectedBtn) {
        // カードのスタイル更新
        selectedCard.classList.add('selected');
        
        // ボタンのスタイル更新
        selectedBtn.textContent = '選択済み';
        
        switch (algorithmType) {
            case 'pairwise':
                selectedCard.classList.add('border-primary');
                selectedBtn.classList.remove('btn-outline-primary');
                selectedBtn.classList.add('btn-primary');
                break;
            case 'threeway':
                selectedCard.classList.add('border-info');
                selectedBtn.classList.remove('btn-outline-info');
                selectedBtn.classList.add('btn-info');
                break;
            case 'allcombinations':
                selectedCard.classList.add('border-warning');
                selectedBtn.classList.remove('btn-outline-warning');
                selectedBtn.classList.add('btn-warning');
                break;
        }
    }
    
    // アプリケーション状態を更新
    window.TestCombinationGenerator.currentAlgorithm = algorithmType;
    console.log('Algorithm set to:', algorithmType);
    
    // アルゴリズム詳細を表示
    showAlgorithmDetails(algorithmType);
    
    // 生成ボタンの状態を更新
    console.log('Calling updateGenerateButtonState from selectAlgorithm');
    updateGenerateButtonState();
    
    // 生成予測を更新
    updateGenerationEstimate();
    
    // スクリーンリーダーに通知
    const algorithmNames = {
        'pairwise': 'ペアワイズテスト',
        'threeway': '3因子間網羅',
        'allcombinations': '全組み合わせ'
    };
    announceToScreenReader(`${algorithmNames[algorithmType]}が選択されました`);
    
    console.log(`アルゴリズムが選択されました: ${algorithmType}`);
}

/**
 * アルゴリズム詳細の表示
 */
function showAlgorithmDetails(algorithmType) {
    const detailsElement = document.getElementById('algorithm-details');
    const nameElement = document.getElementById('algorithm-name');
    const descriptionElement = document.getElementById('algorithm-description');
    const requirementsElement = document.getElementById('min-factors');
    
    const algorithmInfo = {
        'pairwise': {
            name: 'ペアワイズテスト（2因子間網羅）',
            description: '全ての2因子の組み合わせを最小限のテストケースで網羅します。効率的で実用的なテスト手法です。',
            minFactors: '2因子以上'
        },
        'threeway': {
            name: '3因子間網羅',
            description: '全ての3因子の組み合わせを網羅します。より高いカバレッジを提供しますが、テストケース数が増加します。',
            minFactors: '3因子以上'
        },
        'allcombinations': {
            name: '全組み合わせ（全網羅）',
            description: '全ての因子・水準の組み合わせを生成します。完全なカバレッジですが、大量のテストケースが生成される可能性があります。',
            minFactors: '1因子以上'
        }
    };
    
    const info = algorithmInfo[algorithmType];
    if (info) {
        nameElement.textContent = info.name;
        descriptionElement.textContent = info.description;
        requirementsElement.textContent = info.minFactors;
        detailsElement.style.display = 'block';
    }
}

/**
 * 生成ボタンの状態更新
 */
function updateGenerateButtonState() {
    console.log('=== updateGenerateButtonState called ===');
    
    const generateBtn = document.getElementById('generate-btn');
    const generateHelp = document.getElementById('generate-help');
    
    if (!generateBtn || !generateHelp) {
        console.error('Button elements not found:', { generateBtn: !!generateBtn, generateHelp: !!generateHelp });
        return;
    }
    
    const factors = window.TestCombinationGenerator?.factors || [];
    const algorithm = window.TestCombinationGenerator?.currentAlgorithm;
    
    console.log('Current state:', {
        factorsLength: factors.length,
        algorithm: algorithm,
        factors: factors
    });
    
    // 簡略化されたロジック
    let canGenerate = false;
    let helpText = '';
    
    if (factors.length === 0) {
        helpText = '因子を追加してください';
        canGenerate = false;
    } else if (!algorithm) {
        helpText = 'アルゴリズムを選択してください';
        canGenerate = false;
    } else {
        // アルゴリズム要件チェック（簡略化）
        switch (algorithm) {
            case 'pairwise':
                canGenerate = factors.length >= 2;
                helpText = canGenerate ? '生成準備完了' : '最低2つの因子が必要です';
                break;
            case 'threeway':
                canGenerate = factors.length >= 3;
                helpText = canGenerate ? '生成準備完了' : '最低3つの因子が必要です';
                break;
            case 'allcombinations':
                canGenerate = factors.length >= 1;
                helpText = canGenerate ? '生成準備完了' : '最低1つの因子が必要です';
                break;
            default:
                canGenerate = false;
                helpText = 'アルゴリズムを選択してください';
        }
    }
    
    console.log('Decision:', { canGenerate, helpText });
    
    // ボタン状態を更新
    generateBtn.disabled = !canGenerate;
    generateHelp.textContent = helpText;
    
    // アクセシビリティ属性の更新
    generateBtn.setAttribute('aria-describedby', 'generate-help');
    if (canGenerate) {
        generateBtn.removeAttribute('aria-disabled');
    } else {
        generateBtn.setAttribute('aria-disabled', 'true');
    }
    
    console.log('Button updated:', { disabled: generateBtn.disabled, helpText: generateHelp.textContent });
}

/**
 * 生成予測の更新
 */
function updateGenerationEstimate() {
    const estimateElement = document.getElementById('generation-estimate');
    const factors = window.TestCombinationGenerator.factors || [];
    const algorithm = window.TestCombinationGenerator.currentAlgorithm;
    
    if (factors.length === 0 || !algorithm) {
        estimateElement.style.display = 'none';
        return;
    }
    
    try {
        const estimate = calculateGenerationEstimate(factors, algorithm);
        
        document.getElementById('estimated-cases').textContent = estimate.testCases.toLocaleString();
        document.getElementById('estimated-reduction').textContent = estimate.reduction;
        document.getElementById('estimated-time').textContent = estimate.executionTime;
        
        estimateElement.style.display = 'block';
        
    } catch (error) {
        console.warn('生成予測の計算でエラーが発生しました:', error);
        estimateElement.style.display = 'none';
    }
}

/**
 * 生成予測の計算
 */
function calculateGenerationEstimate(factors, algorithm) {
    // 全組み合わせ数を計算
    const totalCombinations = factors.reduce((total, factor) => {
        return total * (factor.levels ? factor.levels.length : 2);
    }, 1);
    
    let estimatedTestCases;
    let reduction;
    
    switch (algorithm) {
        case 'pairwise':
            // ペアワイズの概算（経験的公式）
            const maxLevels = Math.max(...factors.map(f => f.levels ? f.levels.length : 2));
            estimatedTestCases = Math.max(maxLevels, Math.ceil(Math.log2(totalCombinations) * factors.length));
            break;
            
        case 'threeway':
            // 3因子間網羅の概算
            estimatedTestCases = Math.min(totalCombinations, Math.pow(Math.max(...factors.map(f => f.levels ? f.levels.length : 2)), 2) * factors.length);
            break;
            
        case 'allcombinations':
            estimatedTestCases = totalCombinations;
            break;
            
        default:
            estimatedTestCases = totalCombinations;
    }
    
    // 削減率の計算
    if (totalCombinations > 0) {
        const reductionPercent = ((totalCombinations - estimatedTestCases) / totalCombinations * 100);
        reduction = reductionPercent > 0 ? `${reductionPercent.toFixed(1)}%削減` : '削減なし';
    } else {
        reduction = '-';
    }
    
    // 実行時間の予測（概算）
    let executionTime;
    if (estimatedTestCases < 100) {
        executionTime = '< 1秒';
    } else if (estimatedTestCases < 1000) {
        executionTime = '1-3秒';
    } else if (estimatedTestCases < 10000) {
        executionTime = '3-10秒';
    } else {
        executionTime = '10秒以上';
    }
    
    return {
        testCases: estimatedTestCases,
        reduction: reduction,
        executionTime: executionTime
    };
}

/**
 * ウィンドウリサイズ時の処理
 */
window.addEventListener('resize', function() {
    // レスポンシブレイアウトの再確認
    checkResponsiveLayout();
});

/**
 * 包括的エラーハンドリングシステム
 */

// エラータイプの定義
const ErrorTypes = {
    VALIDATION: 'validation',
    ALGORITHM: 'algorithm',
    FILE_PROCESSING: 'file_processing',
    MEMORY: 'memory',
    NETWORK: 'network',
    SYSTEM: 'system',
    USER_INPUT: 'user_input'
};

// エラー重要度の定義
const ErrorSeverity = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
};

/**
 * エラーハンドリングマネージャー
 */
class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogSize = 100;
        this.setupGlobalErrorHandlers();
    }
    
    /**
     * グローバルエラーハンドラーの設定
     */
    setupGlobalErrorHandlers() {
        // 未処理のJavaScriptエラー
        window.addEventListener('error', (event) => {
            this.handleError({
                type: ErrorTypes.SYSTEM,
                severity: ErrorSeverity.HIGH,
                message: 'システムエラーが発生しました',
                details: event.error?.message || 'Unknown error',
                stack: event.error?.stack,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // 未処理のPromise拒否
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: ErrorTypes.SYSTEM,
                severity: ErrorSeverity.HIGH,
                message: '非同期処理でエラーが発生しました',
                details: event.reason?.message || event.reason || 'Unknown promise rejection',
                stack: event.reason?.stack
            });
        });
    }
    
    /**
     * エラーの処理
     * @param {Object} errorInfo - エラー情報
     */
    handleError(errorInfo) {
        const error = {
            id: this.generateErrorId(),
            timestamp: new Date().toISOString(),
            type: errorInfo.type || ErrorTypes.SYSTEM,
            severity: errorInfo.severity || ErrorSeverity.MEDIUM,
            message: errorInfo.message || 'エラーが発生しました',
            details: errorInfo.details || '',
            stack: errorInfo.stack || '',
            context: errorInfo.context || {},
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // エラーログに追加
        this.addToErrorLog(error);
        
        // コンソールに出力
        this.logToConsole(error);
        
        // ユーザーに表示
        this.showUserFriendlyError(error);
        
        // 重要なエラーの場合は追加処理
        if (error.severity === ErrorSeverity.CRITICAL) {
            this.handleCriticalError(error);
        }
        
        return error.id;
    }
    
    /**
     * エラーIDの生成
     * @returns {string} エラーID
     */
    generateErrorId() {
        return 'ERR_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    
    /**
     * エラーログに追加
     * @param {Object} error - エラー情報
     */
    addToErrorLog(error) {
        this.errorLog.unshift(error);
        
        // ログサイズ制限
        if (this.errorLog.length > this.maxLogSize) {
            this.errorLog = this.errorLog.slice(0, this.maxLogSize);
        }
        
        // ローカルストレージに保存（デバッグ用）
        try {
            localStorage.setItem('errorLog', JSON.stringify(this.errorLog.slice(0, 10)));
        } catch (e) {
            // ローカルストレージエラーは無視
        }
    }
    
    /**
     * コンソールにログ出力
     * @param {Object} error - エラー情報
     */
    logToConsole(error) {
        const logMethod = error.severity === ErrorSeverity.CRITICAL ? 'error' :
                         error.severity === ErrorSeverity.HIGH ? 'error' :
                         error.severity === ErrorSeverity.MEDIUM ? 'warn' : 'log';
        
        console[logMethod](`[${error.id}] ${error.type.toUpperCase()}: ${error.message}`);
        
        if (error.details) {
            console[logMethod]('詳細:', error.details);
        }
        
        if (error.stack) {
            console[logMethod]('スタックトレース:', error.stack);
        }
        
        if (Object.keys(error.context).length > 0) {
            console[logMethod]('コンテキスト:', error.context);
        }
    }
    
    /**
     * ユーザーフレンドリーなエラー表示
     * @param {Object} error - エラー情報
     */
    showUserFriendlyError(error) {
        const userMessage = this.getUserFriendlyMessage(error);
        const toastType = error.severity === ErrorSeverity.CRITICAL ? 'error' :
                         error.severity === ErrorSeverity.HIGH ? 'error' :
                         error.severity === ErrorSeverity.MEDIUM ? 'warning' : 'info';
        
        showToast(userMessage, toastType);
        
        // 詳細エラー情報を表示するオプション
        if (error.severity >= ErrorSeverity.HIGH) {
            this.showDetailedErrorModal(error);
        }
    }
    
    /**
     * ユーザーフレンドリーなメッセージの生成
     * @param {Object} error - エラー情報
     * @returns {string} ユーザーフレンドリーなメッセージ
     */
    getUserFriendlyMessage(error) {
        const messageMap = {
            [ErrorTypes.VALIDATION]: {
                [ErrorSeverity.LOW]: '入力内容を確認してください',
                [ErrorSeverity.MEDIUM]: '入力データに問題があります。修正してから再実行してください',
                [ErrorSeverity.HIGH]: '入力データが無効です。正しい形式で入力してください'
            },
            [ErrorTypes.ALGORITHM]: {
                [ErrorSeverity.LOW]: 'アルゴリズムの実行で軽微な問題が発生しました',
                [ErrorSeverity.MEDIUM]: 'テスト組み合わせの生成中にエラーが発生しました。入力データを確認してください',
                [ErrorSeverity.HIGH]: 'アルゴリズムの実行に失敗しました。因子と水準の設定を見直してください',
                [ErrorSeverity.CRITICAL]: 'アルゴリズムの実行で重大なエラーが発生しました。ページを再読み込みしてください'
            },
            [ErrorTypes.FILE_PROCESSING]: {
                [ErrorSeverity.LOW]: 'ファイル処理で軽微な問題が発生しました',
                [ErrorSeverity.MEDIUM]: 'ファイルの読み込み中にエラーが発生しました。ファイル形式を確認してください',
                [ErrorSeverity.HIGH]: 'ファイルの処理に失敗しました。正しいCSVファイルを選択してください',
                [ErrorSeverity.CRITICAL]: 'ファイル処理で重大なエラーが発生しました'
            },
            [ErrorTypes.MEMORY]: {
                [ErrorSeverity.MEDIUM]: 'メモリ使用量が多くなっています。因子数や水準数を減らすことを検討してください',
                [ErrorSeverity.HIGH]: 'メモリ不足のため処理を継続できません。データサイズを小さくしてください',
                [ErrorSeverity.CRITICAL]: 'メモリ不足により処理が中断されました'
            },
            [ErrorTypes.SYSTEM]: {
                [ErrorSeverity.LOW]: 'システムで軽微な問題が発生しました',
                [ErrorSeverity.MEDIUM]: 'システムエラーが発生しました。しばらく待ってから再試行してください',
                [ErrorSeverity.HIGH]: 'システムで重大なエラーが発生しました。ページを再読み込みしてください',
                [ErrorSeverity.CRITICAL]: 'システムで致命的なエラーが発生しました。ブラウザを再起動してください'
            },
            [ErrorTypes.USER_INPUT]: {
                [ErrorSeverity.LOW]: '入力内容を確認してください',
                [ErrorSeverity.MEDIUM]: '入力データに問題があります',
                [ErrorSeverity.HIGH]: '入力データが正しくありません'
            }
        };
        
        const typeMessages = messageMap[error.type] || messageMap[ErrorTypes.SYSTEM];
        return typeMessages[error.severity] || typeMessages[ErrorSeverity.MEDIUM] || error.message;
    }
    
    /**
     * 詳細エラーモーダルの表示
     * @param {Object} error - エラー情報
     */
    showDetailedErrorModal(error) {
        // 既存のエラーモーダルを削除
        const existingModal = document.getElementById('error-detail-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        const modalHtml = `
            <div class="modal fade" id="error-detail-modal" tabindex="-1" aria-labelledby="errorModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title" id="errorModalLabel">
                                <i class="bi bi-exclamation-triangle me-2"></i>
                                エラー詳細 (${error.id})
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row mb-3">
                                <div class="col-sm-3"><strong>エラータイプ:</strong></div>
                                <div class="col-sm-9">
                                    <span class="badge bg-secondary">${error.type}</span>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-sm-3"><strong>重要度:</strong></div>
                                <div class="col-sm-9">
                                    <span class="badge ${this.getSeverityBadgeClass(error.severity)}">${error.severity}</span>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-sm-3"><strong>発生時刻:</strong></div>
                                <div class="col-sm-9">${new Date(error.timestamp).toLocaleString('ja-JP')}</div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-sm-3"><strong>メッセージ:</strong></div>
                                <div class="col-sm-9">${error.message}</div>
                            </div>
                            ${error.details ? `
                                <div class="row mb-3">
                                    <div class="col-sm-3"><strong>詳細:</strong></div>
                                    <div class="col-sm-9"><code>${error.details}</code></div>
                                </div>
                            ` : ''}
                            ${Object.keys(error.context).length > 0 ? `
                                <div class="row mb-3">
                                    <div class="col-sm-3"><strong>コンテキスト:</strong></div>
                                    <div class="col-sm-9">
                                        <pre class="bg-light p-2 rounded"><code>${JSON.stringify(error.context, null, 2)}</code></pre>
                                    </div>
                                </div>
                            ` : ''}
                            <div class="alert alert-info">
                                <h6 class="alert-heading">対処方法:</h6>
                                ${this.getSuggestions(error)}
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-secondary" onclick="errorHandler.copyErrorToClipboard('${error.id}')">
                                <i class="bi bi-clipboard me-1"></i>
                                エラー情報をコピー
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('error-detail-modal'));
        modal.show();
    }
    
    /**
     * 重要度バッジのクラスを取得
     * @param {string} severity - 重要度
     * @returns {string} バッジクラス
     */
    getSeverityBadgeClass(severity) {
        const classMap = {
            [ErrorSeverity.LOW]: 'bg-info',
            [ErrorSeverity.MEDIUM]: 'bg-warning',
            [ErrorSeverity.HIGH]: 'bg-danger',
            [ErrorSeverity.CRITICAL]: 'bg-dark'
        };
        return classMap[severity] || 'bg-secondary';
    }
    
    /**
     * エラーに対する対処方法の提案
     * @param {Object} error - エラー情報
     * @returns {string} 対処方法のHTML
     */
    getSuggestions(error) {
        const suggestionMap = {
            [ErrorTypes.VALIDATION]: [
                '入力データの形式を確認してください',
                '因子名に重複がないか確認してください',
                '各因子に最低2つの水準が設定されているか確認してください'
            ],
            [ErrorTypes.ALGORITHM]: [
                '因子数と水準数を確認してください',
                'メモリ使用量が多い場合は、因子数や水準数を減らしてください',
                '問題が続く場合は、ページを再読み込みしてください'
            ],
            [ErrorTypes.FILE_PROCESSING]: [
                'CSVファイルの形式が正しいか確認してください',
                'ファイルサイズが大きすぎないか確認してください',
                'ファイルの文字エンコーディングがUTF-8であることを確認してください'
            ],
            [ErrorTypes.MEMORY]: [
                '因子数や水準数を減らしてください',
                'ブラウザの他のタブを閉じてメモリを解放してください',
                '全組み合わせ生成の代わりにペアワイズテストを使用してください'
            ],
            [ErrorTypes.SYSTEM]: [
                'ページを再読み込みしてください',
                'ブラウザのキャッシュをクリアしてください',
                '別のブラウザで試してください'
            ]
        };
        
        const suggestions = suggestionMap[error.type] || suggestionMap[ErrorTypes.SYSTEM];
        return '<ul><li>' + suggestions.join('</li><li>') + '</li></ul>';
    }
    
    /**
     * エラー情報をクリップボードにコピー
     * @param {string} errorId - エラーID
     */
    copyErrorToClipboard(errorId) {
        const error = this.errorLog.find(e => e.id === errorId);
        if (!error) return;
        
        const errorText = `
エラーID: ${error.id}
タイプ: ${error.type}
重要度: ${error.severity}
発生時刻: ${new Date(error.timestamp).toLocaleString('ja-JP')}
メッセージ: ${error.message}
詳細: ${error.details}
コンテキスト: ${JSON.stringify(error.context, null, 2)}
ユーザーエージェント: ${error.userAgent}
URL: ${error.url}
        `.trim();
        
        navigator.clipboard.writeText(errorText).then(() => {
            showToast('エラー情報をクリップボードにコピーしました', 'success');
        }).catch(() => {
            showToast('クリップボードへのコピーに失敗しました', 'warning');
        });
    }
    
    /**
     * 重要なエラーの処理
     * @param {Object} error - エラー情報
     */
    handleCriticalError(error) {
        // 重要なエラーの場合は、アプリケーション状態をリセット
        console.error('重要なエラーが発生しました。アプリケーション状態をリセットします。', error);
        
        // 進行中の処理をキャンセル
        this.cancelOngoingOperations();
        
        // UI状態をリセット
        this.resetUIState();
    }
    
    /**
     * 進行中の処理をキャンセル
     */
    cancelOngoingOperations() {
        // プログレス表示を非表示
        hideProgressMessage();
        
        const cancellableProgress = document.getElementById('cancellable-progress-container');
        if (cancellableProgress) {
            cancellableProgress.style.display = 'none';
        }
    }
    
    /**
     * UI状態をリセット
     */
    resetUIState() {
        // ローディング状態を解除
        document.body.classList.remove('loading');
        
        // 無効化されたボタンを有効化
        document.querySelectorAll('button[disabled]').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    /**
     * エラーログの取得
     * @returns {Array} エラーログ
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * エラーログのクリア
     */
    clearErrorLog() {
        this.errorLog = [];
        try {
            localStorage.removeItem('errorLog');
        } catch (e) {
            // 無視
        }
    }
}

// グローバルエラーハンドラーのインスタンス化
const errorHandler = new ErrorHandler();

/**
 * アルゴリズム実行のラッパー関数
 * @param {Function} algorithmFunction - 実行するアルゴリズム関数
 * @param {Array<Factor>} factors - 因子配列
 * @param {string} algorithmName - アルゴリズム名
 * @param {Object} options - オプション
 * @returns {Promise<Array<TestCase>>} 生成されたテストケース配列
 */
async function executeAlgorithmSafely(algorithmFunction, factors, algorithmName, options = {}) {
    const startTime = Date.now();
    let progressController = null;
    
    try {
        // プログレス表示開始
        if (options.showProgress !== false) {
            const operationId = `algorithm-${algorithmName}-${Date.now()}`;
            progressController = progressManager.startOperation(operationId, {
                message: `${algorithmName}を実行中...`,
                allowCancel: true,
                stages: options.stages || [`${algorithmName}実行`, '結果検証']
            });
        }
        
        // 事前バリデーション
        if (!Array.isArray(factors) || factors.length === 0) {
            throw new Error('有効な因子データが必要です');
        }
        
        // メモリ使用量の事前チェック
        const availableMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
        if (availableMemory > 1024 * 1024 * 1024) { // 1GB
            errorHandler.handleError({
                type: ErrorTypes.MEMORY,
                severity: ErrorSeverity.HIGH,
                message: 'メモリ使用量が多くなっています',
                details: `現在のメモリ使用量: ${Math.round(availableMemory / 1024 / 1024)}MB`,
                context: { 
                    algorithm: algorithmName,
                    memoryUsage: availableMemory
                }
            });
        }
        
        // アルゴリズム実行
        let testCases;
        if (options.async) {
            // 非同期実行
            testCases = await new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if (progressController && progressController.cancelled) {
                            reject(new Error('処理がキャンセルされました'));
                            return;
                        }
                        
                        if (progressController) {
                            progressController.updateProgress(`${algorithmName}を実行中...`, 50);
                        }
                        
                        const result = algorithmFunction(factors, options);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, 100);
            });
        } else {
            // 同期実行
            testCases = algorithmFunction(factors, options);
        }
        
        // 結果の検証
        if (!Array.isArray(testCases)) {
            throw new Error('アルゴリズムが無効な結果を返しました');
        }
        
        const executionTime = Date.now() - startTime;
        
        // 成功ログ
        console.log(`${algorithmName}実行完了:`, {
            testCaseCount: testCases.length,
            factorCount: factors.length,
            executionTime: `${executionTime}ms`
        });
        
        // プログレス完了
        if (progressController) {
            progressController.complete(`${algorithmName}完了`);
        }
        
        return testCases;
        
    } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // プログレス非表示
        if (progressController) {
            progressController.cancel();
        }
        
        // エラーの種類を判定
        let errorType = ErrorTypes.ALGORITHM;
        let severity = ErrorSeverity.HIGH;
        
        if (error.message.includes('メモリ') || error.message.includes('memory')) {
            errorType = ErrorTypes.MEMORY;
        } else if (error.message.includes('キャンセル')) {
            errorType = ErrorTypes.USER_INPUT;
            severity = ErrorSeverity.LOW;
        } else if (error.message.includes('バリデーション') || error.message.includes('validation')) {
            errorType = ErrorTypes.VALIDATION;
        }
        
        // エラーハンドリング
        const errorId = errorHandler.handleError({
            type: errorType,
            severity: severity,
            message: `${algorithmName}の実行でエラーが発生しました`,
            details: error.message,
            stack: error.stack,
            context: { 
                algorithm: algorithmName,
                factorCount: factors?.length || 0,
                executionTime: executionTime,
                options: options
            }
        });
        
        // エラーを再スロー
        throw error;
    }
}

/**
 * ファイル処理のラッパー関数
 * @param {Function} fileFunction - 実行するファイル処理関数
 * @param {File} file - 処理するファイル
 * @param {string} operationName - 操作名
 * @returns {Promise<any>} 処理結果
 */
async function executeFileOperationSafely(fileFunction, file, operationName) {
    try {
        // ファイルの基本チェック
        if (!file) {
            throw new Error('ファイルが選択されていません');
        }
        
        // ファイルサイズチェック
        if (file.size > 50 * 1024 * 1024) { // 50MB
            errorHandler.handleError({
                type: ErrorTypes.FILE_PROCESSING,
                severity: ErrorSeverity.HIGH,
                message: 'ファイルサイズが大きすぎます',
                details: `ファイルサイズ: ${Math.round(file.size / 1024 / 1024)}MB`,
                context: { 
                    filename: file.name,
                    fileSize: file.size,
                    maxSize: 50 * 1024 * 1024,
                    operation: operationName
                }
            });
            throw new Error('ファイルサイズが大きすぎます（50MB以下にしてください）');
        }
        
        // ファイル形式チェック
        if (operationName.includes('CSV') && !file.name.toLowerCase().endsWith('.csv')) {
            errorHandler.handleError({
                type: ErrorTypes.FILE_PROCESSING,
                severity: ErrorSeverity.MEDIUM,
                message: 'ファイル形式が正しくありません',
                details: `ファイル名: ${file.name}`,
                context: { 
                    filename: file.name,
                    expectedExtension: '.csv',
                    operation: operationName
                }
            });
            // 警告として表示するが処理は続行
            showToast('ファイル拡張子が.csvではありませんが、処理を続行します', 'warning');
        }
        
        // ファイル処理実行
        const result = await fileFunction(file);
        
        // 成功ログ
        console.log(`${operationName}完了:`, {
            filename: file.name,
            fileSize: file.size
        });
        
        return result;
        
    } catch (error) {
        // エラーハンドリング
        errorHandler.handleError({
            type: ErrorTypes.FILE_PROCESSING,
            severity: ErrorSeverity.HIGH,
            message: `${operationName}でエラーが発生しました`,
            details: error.message,
            stack: error.stack,
            context: { 
                filename: file?.name || 'unknown',
                fileSize: file?.size || 0,
                operation: operationName
            }
        });
        
        // エラーを再スロー
        throw error;
    }
}

/**
 * エラーメッセージの表示（後方互換性のため）
 * @param {string} message - エラーメッセージ
 * @param {string} type - エラータイプ
 * @param {string} severity - 重要度
 * @param {Object} context - コンテキスト情報
 */
function showErrorMessage(message, type = ErrorTypes.SYSTEM, severity = ErrorSeverity.MEDIUM, context = {}) {
    return errorHandler.handleError({
        type: type,
        severity: severity,
        message: message,
        context: context
    });
}

/**
 * 成功メッセージの表示
 * @param {string} message - 成功メッセージ
 */
function showSuccessMessage(message) {
    console.log('成功:', message);
    showToast(message, 'success');
}

/**
 * トースト通知の表示
 * @param {string} message - メッセージ
 * @param {string} type - タイプ ('success', 'error', 'info', 'warning')
 */
function showToast(message, type = 'info') {
    // トーストコンテナを取得または作成
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '9999';
        document.body.appendChild(toastContainer);
    }
    
    // トーストの色とアイコンを設定
    const typeConfig = {
        success: { bgClass: 'bg-success', icon: 'bi-check-circle' },
        error: { bgClass: 'bg-danger', icon: 'bi-exclamation-triangle' },
        warning: { bgClass: 'bg-warning', icon: 'bi-exclamation-triangle' },
        info: { bgClass: 'bg-info', icon: 'bi-info-circle' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    // トースト要素を作成
    const toastId = 'toast_' + Date.now();
    const toastElement = document.createElement('div');
    toastElement.id = toastId;
    toastElement.className = 'toast';
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
        <div class="toast-header ${config.bgClass} text-white">
            <i class="${config.icon} me-2"></i>
            <strong class="me-auto">${type === 'error' ? 'エラー' : type === 'success' ? '成功' : '通知'}</strong>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${message.replace(/\n/g, '<br>')}
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    
    // Bootstrap Toast を初期化して表示
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: type === 'error' ? 8000 : 5000
    });
    
    toast.show();
    
    // トーストが非表示になったら要素を削除
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

/**
 * 高度なプログレス表示とローディング機能
 */

/**
 * ローディング状態の表示/非表示
 * @param {boolean} show - 表示するかどうか
 * @param {string} message - ローディングメッセージ
 * @param {Object} options - オプション
 */
function toggleLoading(show, message = '処理中...', options = {}) {
    const loadingOverlay = document.getElementById('loading-overlay');
    
    if (show) {
        // ローディングオーバーレイを作成または更新
        if (!loadingOverlay) {
            createLoadingOverlay(message, options);
        } else {
            updateLoadingOverlay(message, options);
        }
        
        // ボタンを無効化
        disableInteractiveElements(true);
        
        // ボディにローディングクラスを追加
        document.body.classList.add('loading');
        
    } else {
        // ローディングオーバーレイを非表示
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
        
        // ボタンを有効化
        disableInteractiveElements(false);
        
        // ボディからローディングクラスを削除
        document.body.classList.remove('loading');
    }
}

/**
 * ローディングオーバーレイの作成
 * @param {string} message - メッセージ
 * @param {Object} options - オプション
 */
function createLoadingOverlay(message, options = {}) {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    
    const spinnerType = options.spinnerType || 'border';
    const showProgress = options.showProgress !== false;
    const allowCancel = options.allowCancel === true;
    
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner">
                <div class="spinner-${spinnerType} text-primary" role="status">
                    <span class="visually-hidden">読み込み中...</span>
                </div>
            </div>
            <div class="loading-message">${message}</div>
            ${showProgress ? `
                <div class="loading-progress mt-3">
                    <div class="progress">
                        <div class="progress-bar progress-bar-striped progress-bar-animated" 
                             role="progressbar" style="width: 0%" 
                             aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <div class="progress-text mt-2">
                        <span class="progress-percentage">0%</span>
                        <span class="progress-eta" style="display: none;"></span>
                    </div>
                </div>
            ` : ''}
            ${allowCancel ? `
                <div class="loading-actions mt-3">
                    <button type="button" class="btn btn-outline-danger btn-sm" id="cancel-loading-btn">
                        <i class="bi bi-x-circle me-1"></i>
                        キャンセル
                    </button>
                </div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // キャンセルボタンのイベントリスナー
    if (allowCancel) {
        const cancelBtn = document.getElementById('cancel-loading-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (window.currentOperation && window.currentOperation.cancel) {
                    window.currentOperation.cancel();
                }
                toggleLoading(false);
                showToast('処理がキャンセルされました', 'info');
            });
        }
    }
    
    overlay.style.display = 'flex';
}

/**
 * ローディングオーバーレイの更新
 * @param {string} message - メッセージ
 * @param {Object} options - オプション
 */
function updateLoadingOverlay(message, options = {}) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    
    const messageElement = overlay.querySelector('.loading-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    overlay.style.display = 'flex';
}

/**
 * プログレス更新
 * @param {number} percentage - 進捗率（0-100）
 * @param {string} message - メッセージ
 * @param {Object} options - オプション
 */
function updateProgress(percentage, message = null, options = {}) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    
    // メッセージ更新
    if (message) {
        const messageElement = overlay.querySelector('.loading-message');
        if (messageElement) {
            messageElement.textContent = message;
        }
    }
    
    // プログレスバー更新
    const progressBar = overlay.querySelector('.progress-bar');
    const progressPercentage = overlay.querySelector('.progress-percentage');
    
    if (progressBar && progressPercentage) {
        const clampedPercentage = Math.max(0, Math.min(100, percentage));
        
        progressBar.style.width = `${clampedPercentage}%`;
        progressBar.setAttribute('aria-valuenow', clampedPercentage);
        progressPercentage.textContent = `${Math.round(clampedPercentage)}%`;
        
        // ETA（推定残り時間）の計算と表示
        if (options.startTime && clampedPercentage > 5 && clampedPercentage < 95) {
            const elapsed = Date.now() - options.startTime;
            const estimatedTotal = (elapsed / clampedPercentage) * 100;
            const remaining = estimatedTotal - elapsed;
            
            const etaElement = overlay.querySelector('.progress-eta');
            if (etaElement && remaining > 1000) {
                const remainingSeconds = Math.round(remaining / 1000);
                
                if (remainingSeconds > 60) {
                    const minutes = Math.floor(remainingSeconds / 60);
                    const seconds = remainingSeconds % 60;
                    etaElement.textContent = ` - 残り約 ${minutes}分${seconds}秒`;
                } else {
                    etaElement.textContent = ` - 残り約 ${remainingSeconds}秒`;
                }
                etaElement.style.display = 'inline';
            }
        }
    }
}

/**
 * インタラクティブ要素の有効/無効化
 * @param {boolean} disable - 無効化するかどうか
 */
function disableInteractiveElements(disable) {
    // ボタンの無効化/有効化
    const buttons = document.querySelectorAll('button:not(#cancel-loading-btn)');
    buttons.forEach(button => {
        button.disabled = disable;
    });
    
    // 入力フィールドの無効化/有効化
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.disabled = disable;
    });
    
    // ファイル入力の無効化/有効化
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
        input.disabled = disable;
    });
}

/**
 * 高度なプログレス表示クラス
 */
class AdvancedProgressManager {
    constructor() {
        this.operations = new Map();
        this.currentOperationId = null;
    }
    
    /**
     * 新しい操作を開始
     * @param {string} operationId - 操作ID
     * @param {Object} options - オプション
     * @returns {Object} 操作制御オブジェクト
     */
    startOperation(operationId, options = {}) {
        const operation = {
            id: operationId,
            startTime: Date.now(),
            cancelled: false,
            stages: options.stages || [],
            currentStage: 0,
            totalStages: options.stages ? options.stages.length : 1,
            message: options.message || '処理中...',
            allowCancel: options.allowCancel !== false,
            
            // 操作制御メソッド
            updateProgress: (percentage, message, stageIndex) => {
                if (operation.cancelled) return;
                
                let adjustedPercentage = percentage;
                
                // ステージベースの進捗計算
                if (operation.stages.length > 0 && stageIndex !== undefined) {
                    operation.currentStage = stageIndex;
                    const stageProgress = percentage / 100;
                    adjustedPercentage = ((stageIndex + stageProgress) / operation.totalStages) * 100;
                }
                
                const displayMessage = message || 
                    (operation.stages[operation.currentStage] ? 
                        `${operation.stages[operation.currentStage]} (${operation.currentStage + 1}/${operation.totalStages})` : 
                        operation.message);
                
                updateProgress(adjustedPercentage, displayMessage, {
                    startTime: operation.startTime
                });
            },
            
            setStage: (stageIndex, message) => {
                if (operation.cancelled) return;
                
                operation.currentStage = stageIndex;
                const stageMessage = message || operation.stages[stageIndex] || operation.message;
                const stagePercentage = (stageIndex / operation.totalStages) * 100;
                
                operation.updateProgress(0, stageMessage, stageIndex);
            },
            
            cancel: () => {
                operation.cancelled = true;
                this.endOperation(operationId);
                showToast('処理がキャンセルされました', 'info');
            },
            
            complete: (message) => {
                if (operation.cancelled) return;
                
                updateProgress(100, message || '完了');
                setTimeout(() => {
                    this.endOperation(operationId);
                }, 1000);
            }
        };
        
        this.operations.set(operationId, operation);
        this.currentOperationId = operationId;
        
        // グローバル操作参照を設定（キャンセル用）
        window.currentOperation = operation;
        
        // ローディング表示開始
        toggleLoading(true, operation.message, {
            showProgress: true,
            allowCancel: operation.allowCancel
        });
        
        return operation;
    }
    
    /**
     * 操作を終了
     * @param {string} operationId - 操作ID
     */
    endOperation(operationId) {
        const operation = this.operations.get(operationId);
        if (!operation) return;
        
        this.operations.delete(operationId);
        
        if (this.currentOperationId === operationId) {
            this.currentOperationId = null;
            window.currentOperation = null;
        }
        
        // ローディング非表示
        toggleLoading(false);
    }
    
    /**
     * 現在の操作を取得
     * @returns {Object|null} 現在の操作
     */
    getCurrentOperation() {
        return this.currentOperationId ? this.operations.get(this.currentOperationId) : null;
    }
    
    /**
     * 全ての操作をキャンセル
     */
    cancelAllOperations() {
        for (const operation of this.operations.values()) {
            operation.cancel();
        }
    }
}

// グローバルプログレスマネージャーのインスタンス化
const progressManager = new AdvancedProgressManager();

/**
 * アルゴリズム実行用のプログレス付きラッパー
 * @param {string} algorithmType - アルゴリズムタイプ
 * @param {Array<Factor>} factors - 因子配列
 * @param {Object} options - オプション
 * @returns {Promise<Array<TestCase>>} テストケース配列
 */
async function runAlgorithmWithProgress(algorithmType, factors, options = {}) {
    const algorithmNames = {
        'pairwise': 'ペアワイズテスト',
        'threeway': '3因子間網羅テスト',
        'allcombinations': '全組み合わせテスト'
    };
    
    const algorithmName = algorithmNames[algorithmType] || algorithmType;
    const operationId = `${algorithmType}-${Date.now()}`;
    
    const stages = [
        '入力データ検証',
        `${algorithmName}実行`,
        '結果検証',
        '結果表示準備'
    ];
    
    const operation = progressManager.startOperation(operationId, {
        message: `${algorithmName}を準備中...`,
        allowCancel: true,
        stages: stages
    });
    
    try {
        // ステージ1: 入力データ検証
        operation.setStage(0, '入力データを検証中...');
        await new Promise(resolve => setTimeout(resolve, 200)); // UI更新のための短い待機
        
        if (operation.cancelled) {
            throw new Error('処理がキャンセルされました');
        }
        
        // ステージ2: アルゴリズム実行
        operation.setStage(1, `${algorithmName}を実行中...`);
        
        let testCases;
        switch (algorithmType) {
            case 'pairwise':
                const pairwiseGenerator = new PairwiseGenerator();
                testCases = await executeWithProgress(
                    () => pairwiseGenerator.generate(factors),
                    operation,
                    1
                );
                break;
                
            case 'threeway':
                const threewayGenerator = new ThreeWayGenerator();
                testCases = await executeWithProgress(
                    () => threewayGenerator.generate(factors),
                    operation,
                    1
                );
                break;
                
            case 'allcombinations':
                const allCombinationsGenerator = new AllCombinationsGenerator();
                testCases = await executeWithProgress(
                    () => allCombinationsGenerator.generate(factors, options.forceGenerate),
                    operation,
                    1
                );
                break;
                
            default:
                throw new Error(`未知のアルゴリズムタイプ: ${algorithmType}`);
        }
        
        if (operation.cancelled) {
            throw new Error('処理がキャンセルされました');
        }
        
        // ステージ3: 結果検証
        operation.setStage(2, '結果を検証中...');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!Array.isArray(testCases) || testCases.length === 0) {
            throw new Error('有効なテストケースが生成されませんでした');
        }
        
        // ステージ4: 結果表示準備
        operation.setStage(3, '結果表示を準備中...');
        operation.updateProgress(90, '結果表示を準備中...', 3);
        
        // 結果表示
        if (resultsTableManager) {
            resultsTableManager.displayResults(testCases, factors, { algorithmType });
        }
        
        operation.complete(`${algorithmName}が完了しました（${testCases.length}件のテストケース）`);
        
        return testCases;
        
    } catch (error) {
        operation.cancel();
        throw error;
    }
}

/**
 * プログレス付きでアルゴリズムを実行
 * @param {Function} algorithmFunction - アルゴリズム関数
 * @param {Object} operation - 操作オブジェクト
 * @param {number} stageIndex - ステージインデックス
 * @returns {Promise<any>} 実行結果
 */
async function executeWithProgress(algorithmFunction, operation, stageIndex) {
    return new Promise((resolve, reject) => {
        // 非同期実行でUIをブロックしない
        setTimeout(() => {
            try {
                if (operation.cancelled) {
                    reject(new Error('処理がキャンセルされました'));
                    return;
                }
                
                // プログレス更新
                operation.updateProgress(20, undefined, stageIndex);
                
                // アルゴリズム実行
                const result = algorithmFunction();
                
                if (operation.cancelled) {
                    reject(new Error('処理がキャンセルされました'));
                    return;
                }
                
                operation.updateProgress(100, undefined, stageIndex);
                resolve(result);
                
            } catch (error) {
                reject(error);
            }
        }, 100);
    });
}

/**
 * ファイル処理用のプログレス付きラッパー
 * @param {File} file - 処理するファイル
 * @param {string} operationType - 操作タイプ
 * @returns {Promise<any>} 処理結果
 */
async function processFileWithProgress(file, operationType = 'CSVファイル処理') {
    const operationId = `file-${operationType}-${Date.now()}`;
    
    const stages = [
        'ファイル検証',
        'ファイル読み込み',
        'データ解析',
        '結果適用'
    ];
    
    const operation = progressManager.startOperation(operationId, {
        message: `${operationType}を準備中...`,
        allowCancel: false, // ファイル処理は通常キャンセル不可
        stages: stages
    });
    
    try {
        // ステージ1: ファイル検証
        operation.setStage(0, 'ファイルを検証中...');
        await new Promise(resolve => setTimeout(resolve, 200));
        
        if (!file) {
            throw new Error('ファイルが選択されていません');
        }
        
        // ステージ2: ファイル読み込み
        operation.setStage(1, 'ファイルを読み込み中...');
        
        const fileContent = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                operation.updateProgress(80, 'ファイル読み込み完了', 1);
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('ファイルの読み込みに失敗しました'));
            };
            
            reader.onprogress = (e) => {
                if (e.lengthComputable) {
                    const progress = (e.loaded / e.total) * 100;
                    operation.updateProgress(progress, 'ファイルを読み込み中...', 1);
                }
            };
            
            reader.readAsText(file);
        });
        
        // ステージ3: データ解析
        operation.setStage(2, 'データを解析中...');
        
        if (!inputManager) {
            inputManager = new InputManager();
        }
        
        const parsedData = inputManager.parseCSV(fileContent);
        
        if (!parsedData.success) {
            throw new Error(parsedData.error);
        }
        
        // ステージ4: 結果適用
        operation.setStage(3, '結果を適用中...');
        operation.updateProgress(90, '結果を適用中...', 3);
        
        inputManager.loadFactorsFromCSV(parsedData.factors);
        
        operation.complete(`${operationType}が完了しました（${parsedData.factors.length}個の因子）`);
        
        return parsedData;
        
    } catch (error) {
        operation.cancel();
        throw error;
    }
}

/**
 * プログレス表示（後方互換性のため）
 * @param {string} message - プログレスメッセージ
 * @param {number} percentage - 進捗率（0-100）
 */
function showProgressMessage(message, percentage = 0) {
    // 新しいプログレスシステムを使用
    if (!window.currentProgressOperation) {
        window.currentProgressOperation = progressManager.startOperation('legacy-progress', {
            message: message,
            allowCancel: false
        });
    }
    
    window.currentProgressOperation.updateProgress(percentage, message);
}

/**
 * プログレス表示を非表示（後方互換性のため）
 */
function hideProgressMessage() {
    if (window.currentProgressOperation) {
        progressManager.endOperation('legacy-progress');
        window.currentProgressOperation = null;
    }
}

/**
 * キャンセル可能なプログレス表示（後方互換性のため）
 * @param {string} message - プログレスメッセージ
 * @param {number} percentage - 進捗率（0-100）
 * @returns {Object} プログレス制御オブジェクト
 */
function showCancellableProgress(message, percentage = 0) {
    const operationId = 'cancellable-' + Date.now();
    const operation = progressManager.startOperation(operationId, {
        message: message,
        allowCancel: true
    });
    
    // 後方互換性のためのラッパーオブジェクト
    const controller = {
        cancelled: false,
        
        updateProgress(newMessage, newPercentage) {
            if (this.cancelled || operation.cancelled) {
                this.cancelled = true;
                return;
            }
            
            operation.updateProgress(newPercentage, newMessage);
        },
        
        hide() {
            progressManager.endOperation(operationId);
        }
    };
    
    // キャンセル状態の同期
    const originalCancel = operation.cancel;
    operation.cancel = () => {
        controller.cancelled = true;
        originalCancel();
    };
    
    // 初期値を設定
    controller.updateProgress(message, percentage);
    
    return controller;
}

/**
 * Factor クラス - 因子（テスト対象の機能や条件を表す変数）を表現
 */
class Factor {
    /**
     * Factor のコンストラクタ
     * @param {string} name - 因子名
     * @param {Array<string>} levels - 水準の配列
     */
    constructor(name, levels) {
        this.id = this.generateId();
        this.name = name;
        this.levels = Array.isArray(levels) ? levels : [];
    }
    
    /**
     * ユニークIDの生成
     * @returns {string} ユニークID
     */
    generateId() {
        return 'factor_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }
    
    /**
     * 因子データのバリデーション
     * @returns {Object} バリデーション結果 {isValid: boolean, errors: Array<string>}
     */
    validate() {
        const errors = [];
        
        // 因子名のチェック
        if (!this.name || typeof this.name !== 'string' || this.name.trim() === '') {
            errors.push('因子名は必須です');
        }
        
        // 水準のチェック
        if (!Array.isArray(this.levels) || this.levels.length < 2) {
            errors.push('各因子には最低2つの水準が必要です');
        }
        
        // 水準の重複チェック
        const uniqueLevels = new Set(this.levels.map(level => level.toString().trim()));
        if (uniqueLevels.size !== this.levels.length) {
            errors.push('水準に重複があります');
        }
        
        // 空の水準チェック
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
    
    /**
     * 水準数を取得
     * @returns {number} 水準数
     */
    getLevelCount() {
        return this.levels.length;
    }
    
    /**
     * 因子の文字列表現
     * @returns {string} 因子の文字列表現
     */
    toString() {
        return `${this.name}: [${this.levels.join(', ')}]`;
    }
    
    /**
     * 因子データのクローン
     * @returns {Factor} クローンされた因子
     */
    clone() {
        return new Factor(this.name, [...this.levels]);
    }
}

/**
 * TestCase クラス - テストケース（因子と水準の組み合わせ）を表現
 */
class TestCase {
    /**
     * TestCase のコンストラクタ
     * @param {Map<string, string>|Object} combinations - 因子IDと水準の組み合わせ
     */
    constructor(combinations) {
        this.id = this.generateId();
        this.combinations = combinations instanceof Map ? combinations : new Map(Object.entries(combinations || {}));
    }
    
    /**
     * ユニークIDの生成
     * @returns {string} ユニークID
     */
    generateId() {
        return 'testcase_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    }
    
    /**
     * 指定した因子の水準を取得
     * @param {string} factorId - 因子ID
     * @returns {string|undefined} 水準値
     */
    getLevel(factorId) {
        return this.combinations.get(factorId);
    }
    
    /**
     * 指定した因子の水準を設定
     * @param {string} factorId - 因子ID
     * @param {string} level - 水準値
     */
    setLevel(factorId, level) {
        this.combinations.set(factorId, level);
    }
    
    /**
     * テストケースの文字列表現
     * @returns {string} テストケースの文字列表現
     */
    toString() {
        const combinations = Array.from(this.combinations.entries())
            .map(([factorId, level]) => `${factorId}=${level}`)
            .join(', ');
        return `TestCase[${combinations}]`;
    }
    
    /**
     * CSV行形式での出力
     * @param {Array<Factor>} factorOrder - 因子の順序配列
     * @returns {string} CSV行文字列
     */
    toCSVRow(factorOrder) {
        if (!Array.isArray(factorOrder)) {
            throw new Error('factorOrder must be an array of Factor objects');
        }
        
        const values = factorOrder.map(factor => {
            const level = this.combinations.get(factor.id);
            return level !== undefined ? this.escapeCSVValue(level) : '';
        });
        
        return values.join(',');
    }
    
    /**
     * CSV値のエスケープ処理
     * @param {string} value - エスケープする値
     * @returns {string} エスケープされた値
     */
    escapeCSVValue(value) {
        const stringValue = value.toString();
        
        // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            // ダブルクォートをエスケープ（""に変換）
            const escapedValue = stringValue.replace(/"/g, '""');
            return `"${escapedValue}"`;
        }
        
        return stringValue;
    }
    
    /**
     * テストケースのバリデーション
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} バリデーション結果 {isValid: boolean, errors: Array<string>}
     */
    validate(factors) {
        const errors = [];
        
        if (!Array.isArray(factors)) {
            errors.push('因子配列が必要です');
            return { isValid: false, errors };
        }
        
        // 全ての因子に対して水準が設定されているかチェック
        for (const factor of factors) {
            const level = this.combinations.get(factor.id);
            
            if (level === undefined || level === null) {
                errors.push(`因子 "${factor.name}" の水準が設定されていません`);
                continue;
            }
            
            // 設定された水準が因子の有効な水準かチェック
            if (!factor.levels.includes(level.toString())) {
                errors.push(`因子 "${factor.name}" に無効な水準 "${level}" が設定されています`);
            }
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
    
    /**
     * テストケースのクローン
     * @returns {TestCase} クローンされたテストケース
     */
    clone() {
        return new TestCase(new Map(this.combinations));
    }
    
    /**
     * 2つのテストケースが等しいかチェック
     * @param {TestCase} other - 比較対象のテストケース
     * @returns {boolean} 等しいかどうか
     */
    equals(other) {
        if (!(other instanceof TestCase)) {
            return false;
        }
        
        if (this.combinations.size !== other.combinations.size) {
            return false;
        }
        
        for (const [factorId, level] of this.combinations) {
            if (other.combinations.get(factorId) !== level) {
                return false;
            }
        }
        
        return true;
    }
}

// グローバル InputManager インスタンス
let inputManager;

/**
 * 因子を追加する関数（HTMLから呼び出される）
 */
function addFactor() {
    console.log('addFactor called');
    if (!window.inputManager) {
        window.inputManager = new InputManager();
        inputManager = window.inputManager;
        console.log('InputManager created');
    }
    const factorId = window.inputManager.addFactor();
    console.log('Factor added with ID:', factorId);
    console.log('Current factors count:', window.inputManager.factors.length);
}

/**
 * 全ての因子をクリアする関数（HTMLから呼び出される）
 */
function clearAllFactors() {
    if (!window.inputManager) {
        window.inputManager = new InputManager();
        inputManager = window.inputManager;
    }
    
    if (confirm('全ての因子データを削除しますか？')) {
        window.inputManager.clearAll();
    }
}

/**
 * CSVファイルアップロードハンドラ（HTMLから呼び出される）
 * @param {Event} event - ファイル選択イベント
 */
async function handleCSVFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        await processFileWithProgress(file, 'CSVファイル読み込み');
        showToast('CSVファイルの読み込みが完了しました', 'success');
    } catch (error) {
        console.error('CSVファイル処理エラー:', error);
        showErrorMessage(error.message, ErrorTypes.FILE_PROCESSING, ErrorSeverity.HIGH);
    }
}

/**
 * ペアワイズテスト実行（HTMLから呼び出される）
 */
async function runPairwiseTest() {
    if (!inputManager || !inputManager.factors || inputManager.factors.length < 2) {
        showErrorMessage('ペアワイズテストには最低2つの因子が必要です', ErrorTypes.VALIDATION, ErrorSeverity.MEDIUM);
        return;
    }
    
    try {
        await runAlgorithmWithProgress('pairwise', inputManager.factors);
        showToast('ペアワイズテストが完了しました', 'success');
    } catch (error) {
        console.error('ペアワイズテスト実行エラー:', error);
        showErrorMessage(error.message, ErrorTypes.ALGORITHM, ErrorSeverity.HIGH);
    }
}

/**
 * 3因子間網羅テスト実行（HTMLから呼び出される）
 */
async function runThreewayTest() {
    if (!inputManager || !inputManager.factors || inputManager.factors.length < 3) {
        showErrorMessage('3因子間網羅テストには最低3つの因子が必要です', ErrorTypes.VALIDATION, ErrorSeverity.MEDIUM);
        return;
    }
    
    try {
        await runAlgorithmWithProgress('threeway', inputManager.factors);
        showToast('3因子間網羅テストが完了しました', 'success');
    } catch (error) {
        console.error('3因子間網羅テスト実行エラー:', error);
        showErrorMessage(error.message, ErrorTypes.ALGORITHM, ErrorSeverity.HIGH);
    }
}

/**
 * 全組み合わせテスト実行（HTMLから呼び出される）
 */
async function runAllCombinationsTest(forceGenerate = false) {
    if (!inputManager || !inputManager.factors || inputManager.factors.length === 0) {
        showErrorMessage('全組み合わせテストには最低1つの因子が必要です', ErrorTypes.VALIDATION, ErrorSeverity.MEDIUM);
        return;
    }
    
    try {
        await runAlgorithmWithProgress('allcombinations', inputManager.factors, { forceGenerate });
        showToast('全組み合わせテストが完了しました', 'success');
    } catch (error) {
        console.error('全組み合わせテスト実行エラー:', error);
        
        // 大容量データセットの警告の場合は確認ダイアログを表示
        if (error.message.includes('組み合わせ数が多すぎます') || error.message.includes('メモリ不足')) {
            const confirmMessage = `${error.message}\n\n強制実行しますか？（処理に時間がかかる可能性があります）`;
            if (confirm(confirmMessage)) {
                try {
                    await runAlgorithmWithProgress('allcombinations', inputManager.factors, { forceGenerate: true });
                    showToast('全組み合わせテストが完了しました', 'success');
                } catch (forceError) {
                    showErrorMessage(forceError.message, ErrorTypes.ALGORITHM, ErrorSeverity.HIGH);
                }
            }
        } else {
            showErrorMessage(error.message, ErrorTypes.ALGORITHM, ErrorSeverity.HIGH);
        }
    }
}

/**
 * サンプルCSVダウンロード関数（HTMLから呼び出される）
 */
function downloadSampleCSV() {
    const sampleData = [
        ['ブラウザ', 'OS', '画面サイズ'],
        ['Chrome', 'Windows', 'デスクトップ'],
        ['Firefox', 'Mac', 'タブレット'],
        ['Safari', 'iOS', 'モバイル'],
        ['Edge', 'Linux', '']
    ];
    
    const csvContent = sampleData.map(row => 
        row.map(cell => {
            // CSVエスケープ処理
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample_factors.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
}

/**
 * ResultsTableManager クラス - テスト結果表示テーブルの管理
 */
class ResultsTableManager {
    constructor() {
        this.testCases = [];
        this.factors = [];
        this.filteredTestCases = [];
        this.currentPage = 1;
        this.itemsPerPage = 25;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        
        this.initializeEventListeners();
    }
    
    /**
     * イベントリスナーの初期化
     */
    initializeEventListeners() {
        // ページ読み込み時にURLパラメータをチェック
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('test') === 'true') {
            // テストモードの場合、サンプルデータを表示
            setTimeout(() => this.loadSampleData(), 1000);
        }
    }
    
    /**
     * テスト結果を表示
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @param {Object} metadata - メタデータ（アルゴリズム名など）
     */
    displayResults(testCases, factors, metadata = {}) {
        if (!Array.isArray(testCases) || !Array.isArray(factors)) {
            console.error('無効なデータが渡されました');
            return;
        }
        
        this.testCases = testCases;
        this.factors = factors;
        this.filteredTestCases = [...testCases];
        this.currentPage = 1;
        this.searchQuery = '';
        
        // UI要素の表示/非表示を切り替え
        document.getElementById('no-results-message').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';
        document.getElementById('results-controls').style.display = 'flex';
        
        // カバレッジ情報を表示
        this.displayCoverageInfo(testCases, factors, metadata.algorithmType || 'unknown');
        
        // テーブルヘッダーを生成
        this.generateTableHeader();
        
        // 検索フィールドをクリア
        document.getElementById('results-search').value = '';
        
        // テーブルを更新
        this.updateTable();
        
        console.log(`結果表示: ${testCases.length}件のテストケース, ${factors.length}個の因子`);
    }
    
    /**
     * カバレッジ情報の表示
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @param {string} algorithmType - アルゴリズムタイプ
     */
    displayCoverageInfo(testCases, factors, algorithmType) {
        if (!coverageCalculator) {
            coverageCalculator = new CoverageCalculator();
        }
        
        const coverage = coverageCalculator.calculateCoverage(testCases, factors, algorithmType);
        const statsContainer = document.getElementById('coverage-stats');
        statsContainer.innerHTML = '';
        
        // 基本統計情報
        const basicStats = [
            {
                value: coverage.testCaseCount,
                label: 'テストケース数',
                description: '生成されたテストケースの総数',
                type: 'primary'
            },
            {
                value: coverage.factorCount,
                label: '因子数',
                description: 'テスト対象の因子の数',
                type: 'info'
            },
            {
                value: coverage.totalCombinations.toLocaleString(),
                label: '全組み合わせ数',
                description: '全ての因子・水準の組み合わせ数',
                type: 'warning'
            },
            {
                value: `${Math.round(coverage.reductionRate)}%`,
                label: '削減率',
                description: '全組み合わせからの削減率',
                type: 'success'
            }
        ];
        
        // ペアワイズカバレッジ情報
        if (coverage.pairwiseCoverage && factors.length >= 2) {
            basicStats.push({
                value: `${coverage.pairwiseCoverage.coverageRate}%`,
                label: 'ペアワイズカバレッジ',
                description: `${coverage.pairwiseCoverage.coveredPairs}/${coverage.pairwiseCoverage.totalPairs} ペア`,
                type: coverage.pairwiseCoverage.coverageRate >= 95 ? 'success' : 
                      coverage.pairwiseCoverage.coverageRate >= 85 ? 'info' : 'warning',
                progress: coverage.pairwiseCoverage.coverageRate
            });
        }
        
        // 3因子間カバレッジ情報
        if (coverage.threewayCovarage && factors.length >= 3) {
            basicStats.push({
                value: `${coverage.threewayCovarage.coverageRate}%`,
                label: '3因子間カバレッジ',
                description: `${coverage.threewayCovarage.coveredTriples}/${coverage.threewayCovarage.totalTriples} トリプル`,
                type: coverage.threewayCovarage.coverageRate >= 95 ? 'success' : 
                      coverage.threewayCovarage.coverageRate >= 85 ? 'info' : 'warning',
                progress: coverage.threewayCovarage.coverageRate
            });
        }
        
        // 効率性指標
        if (coverage.efficiency > 1) {
            basicStats.push({
                value: `${Math.round(coverage.efficiency)}x`,
                label: '効率性',
                description: '全組み合わせに対する効率倍率',
                type: coverage.efficiency >= 10 ? 'success' : 
                      coverage.efficiency >= 5 ? 'info' : 'warning'
            });
        }
        
        // 統計カードを生成
        basicStats.forEach((stat, index) => {
            const colClass = basicStats.length <= 4 ? 'col-md-3 col-sm-6' : 
                           basicStats.length <= 6 ? 'col-lg-2 col-md-4 col-sm-6' : 'col-xl-2 col-lg-3 col-md-4 col-sm-6';
            
            const statCard = document.createElement('div');
            statCard.className = `${colClass} mb-3`;
            
            const progressBar = stat.progress !== undefined ? 
                this.createProgressBar(stat.progress) : '';
            
            statCard.innerHTML = `
                <div class="coverage-stat stat-${stat.type}">
                    <span class="coverage-stat-value">${stat.value}</span>
                    <div class="coverage-stat-label">${stat.label}</div>
                    <div class="coverage-stat-description">${stat.description}</div>
                    ${progressBar}
                </div>
            `;
            
            statsContainer.appendChild(statCard);
        });
        
        // アルゴリズム情報バッジを追加
        if (algorithmType !== 'unknown') {
            const algorithmInfo = document.createElement('div');
            algorithmInfo.className = 'col-12 mt-2';
            
            const badgeClass = algorithmType === 'pairwise' ? 'badge-pairwise' :
                              algorithmType === 'threeway' ? 'badge-threeway' :
                              algorithmType === 'allcombinations' ? 'badge-allcombinations' : '';
            
            const algorithmName = algorithmType === 'pairwise' ? 'ペアワイズテスト' :
                                 algorithmType === 'threeway' ? '3因子間網羅テスト' :
                                 algorithmType === 'allcombinations' ? '全組み合わせテスト' : algorithmType;
            
            algorithmInfo.innerHTML = `
                <div class="text-center">
                    <span class="algorithm-badge ${badgeClass}">
                        <i class="bi bi-cpu me-1"></i>
                        ${algorithmName}
                    </span>
                </div>
            `;
            
            statsContainer.appendChild(algorithmInfo);
        }
    }
    
    /**
     * プログレスバーの作成
     * @param {number} percentage - パーセンテージ
     * @returns {string} プログレスバーHTML
     */
    createProgressBar(percentage) {
        if (!coverageCalculator) {
            coverageCalculator = new CoverageCalculator();
        }
        
        const quality = coverageCalculator.evaluateCoverageQuality(percentage);
        
        return `
            <div class="coverage-progress">
                <div class="coverage-progress-bar ${quality.className}" 
                     style="width: ${Math.min(percentage, 100)}%"
                     title="${quality.description}: ${percentage}%">
                </div>
            </div>
        `;
    }
    
    /**
     * テーブルヘッダーの生成
     */
    generateTableHeader() {
        const headerRow = document.getElementById('results-table-header');
        headerRow.innerHTML = '';
        
        // テストケース番号列
        const numberHeader = document.createElement('th');
        numberHeader.textContent = 'No.';
        numberHeader.className = 'test-case-number';
        numberHeader.style.width = '80px';
        headerRow.appendChild(numberHeader);
        
        // 因子列
        this.factors.forEach((factor, index) => {
            const th = document.createElement('th');
            th.textContent = factor.name;
            th.className = 'sortable';
            th.dataset.column = index;
            th.style.cursor = 'pointer';
            th.addEventListener('click', () => this.sortTable(index));
            headerRow.appendChild(th);
        });
    }
    
    /**
     * テーブルの更新
     */
    updateTable() {
        this.updateTableBody();
        this.updatePagination();
        this.updateResultsInfo();
    }
    
    /**
     * テーブルボディの更新
     */
    updateTableBody() {
        const tbody = document.getElementById('results-table-body');
        tbody.innerHTML = '';
        
        const startIndex = this.itemsPerPage === -1 ? 0 : (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = this.itemsPerPage === -1 ? this.filteredTestCases.length : startIndex + this.itemsPerPage;
        const pageTestCases = this.filteredTestCases.slice(startIndex, endIndex);
        
        pageTestCases.forEach((testCase, index) => {
            const row = document.createElement('tr');
            
            // テストケース番号
            const numberCell = document.createElement('td');
            numberCell.textContent = startIndex + index + 1;
            numberCell.className = 'test-case-number';
            row.appendChild(numberCell);
            
            // 因子の値
            this.factors.forEach(factor => {
                const cell = document.createElement('td');
                const level = testCase.getLevel(factor.id);
                cell.textContent = level || '';
                
                // 検索ハイライト
                if (this.searchQuery && level && level.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    cell.innerHTML = this.highlightSearchTerm(level, this.searchQuery);
                }
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
        
        // 結果が空の場合
        if (this.filteredTestCases.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = this.factors.length + 1;
            cell.className = 'results-empty';
            cell.textContent = this.searchQuery ? '検索条件に一致する結果がありません' : 'テストケースがありません';
            row.appendChild(cell);
            tbody.appendChild(row);
        }
    }
    
    /**
     * 検索語句のハイライト
     * @param {string} text - 対象テキスト
     * @param {string} query - 検索語句
     * @returns {string} ハイライト済みHTML
     */
    highlightSearchTerm(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }
    
    /**
     * ページネーションの更新
     */
    updatePagination() {
        const pagination = document.getElementById('results-pagination');
        pagination.innerHTML = '';
        
        if (this.itemsPerPage === -1 || this.filteredTestCases.length <= this.itemsPerPage) {
            return; // ページネーション不要
        }
        
        const totalPages = Math.ceil(this.filteredTestCases.length / this.itemsPerPage);
        
        // 前へボタン
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevItem.innerHTML = '<a class="page-link" href="#" aria-label="前へ"><span aria-hidden="true">&laquo;</span></a>';
        if (this.currentPage > 1) {
            prevItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage - 1);
            });
        }
        pagination.appendChild(prevItem);
        
        // ページ番号
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            const firstItem = document.createElement('li');
            firstItem.className = 'page-item';
            firstItem.innerHTML = '<a class="page-link" href="#">1</a>';
            firstItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(1);
            });
            pagination.appendChild(firstItem);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            if (i !== this.currentPage) {
                pageItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.goToPage(i);
                });
            }
            pagination.appendChild(pageItem);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('li');
                ellipsis.className = 'page-item disabled';
                ellipsis.innerHTML = '<span class="page-link">...</span>';
                pagination.appendChild(ellipsis);
            }
            
            const lastItem = document.createElement('li');
            lastItem.className = 'page-item';
            lastItem.innerHTML = `<a class="page-link" href="#">${totalPages}</a>`;
            lastItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(totalPages);
            });
            pagination.appendChild(lastItem);
        }
        
        // 次へボタン
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        nextItem.innerHTML = '<a class="page-link" href="#" aria-label="次へ"><span aria-hidden="true">&raquo;</span></a>';
        if (this.currentPage < totalPages) {
            nextItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.goToPage(this.currentPage + 1);
            });
        }
        pagination.appendChild(nextItem);
    }
    
    /**
     * 結果情報の更新
     */
    updateResultsInfo() {
        const info = document.getElementById('results-info');
        const total = this.testCases.length;
        const filtered = this.filteredTestCases.length;
        
        if (this.searchQuery) {
            info.textContent = `${filtered}件の結果 (全${total}件中)`;
        } else {
            info.textContent = `${total}件の結果`;
        }
        
        if (this.itemsPerPage !== -1 && filtered > this.itemsPerPage) {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
            const endIndex = Math.min(this.currentPage * this.itemsPerPage, filtered);
            info.textContent += ` - ${startIndex}〜${endIndex}件目を表示`;
        }
    }
    
    /**
     * ページ移動
     * @param {number} page - 移動先ページ番号
     */
    goToPage(page) {
        this.currentPage = page;
        this.updateTable();
    }
    
    /**
     * テーブルソート
     * @param {number} columnIndex - ソート対象列のインデックス
     */
    sortTable(columnIndex) {
        const factor = this.factors[columnIndex];
        
        if (this.sortColumn === columnIndex) {
            // 同じ列の場合は方向を切り替え
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            // 新しい列の場合は昇順から開始
            this.sortColumn = columnIndex;
            this.sortDirection = 'asc';
        }
        
        // ソート実行
        this.filteredTestCases.sort((a, b) => {
            const valueA = a.getLevel(factor.id) || '';
            const valueB = b.getLevel(factor.id) || '';
            
            const comparison = valueA.localeCompare(valueB, 'ja', { numeric: true });
            return this.sortDirection === 'asc' ? comparison : -comparison;
        });
        
        // ヘッダーのソート表示を更新
        this.updateSortHeaders();
        
        // 1ページ目に戻る
        this.currentPage = 1;
        this.updateTable();
    }
    
    /**
     * ソートヘッダーの表示更新
     */
    updateSortHeaders() {
        const headers = document.querySelectorAll('#results-table-header th.sortable');
        headers.forEach((header, index) => {
            header.classList.remove('sort-asc', 'sort-desc');
            if (index === this.sortColumn) {
                header.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        });
    }
    
    /**
     * 結果のフィルタリング
     * @param {string} query - 検索クエリ
     */
    filterResults(query) {
        this.searchQuery = query.trim();
        
        if (!this.searchQuery) {
            this.filteredTestCases = [...this.testCases];
        } else {
            this.filteredTestCases = this.testCases.filter(testCase => {
                return this.factors.some(factor => {
                    const level = testCase.getLevel(factor.id);
                    return level && level.toLowerCase().includes(this.searchQuery.toLowerCase());
                });
            });
        }
        
        // 1ページ目に戻る
        this.currentPage = 1;
        this.updateTable();
    }
    
    /**
     * 表示件数の変更
     * @param {number} itemsPerPage - 1ページあたりの表示件数
     */
    setItemsPerPage(itemsPerPage) {
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.updateTable();
    }
    
    /**
     * 結果のクリア
     */
    clearResults() {
        this.testCases = [];
        this.factors = [];
        this.filteredTestCases = [];
        this.currentPage = 1;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.searchQuery = '';
        
        // UI要素の表示/非表示を切り替え
        document.getElementById('results-container').style.display = 'none';
        document.getElementById('results-controls').style.display = 'none';
        document.getElementById('no-results-message').style.display = 'block';
        
        // カバレッジ情報をクリア
        document.getElementById('coverage-stats').innerHTML = '';
        
        // 検索フィールドをクリア
        document.getElementById('results-search').value = '';
        document.getElementById('results-per-page').value = '25';
        
        console.log('結果をクリアしました');
    }
    
    /**
     * CSVエクスポート用のデータ生成
     * @param {string} algorithmType - アルゴリズムタイプ ('pairwise', 'threeway', 'allcombinations')
     * @returns {string} CSV文字列
     */
    generateCSVData(algorithmType = 'unknown') {
        if (this.testCases.length === 0) {
            return '';
        }
        
        // ヘッダー行（因子名のみ、テストケース番号は除外）
        const headers = this.factors.map(f => f.name);
        const csvRows = [headers];
        
        // データ行
        this.testCases.forEach((testCase) => {
            const row = this.factors.map(factor => testCase.getLevel(factor.id) || '');
            csvRows.push(row);
        });
        
        // CSV文字列に変換（適切なエスケープ処理）
        return csvRows.map(row => 
            row.map(cell => this.escapeCSVCell(cell)).join(',')
        ).join('\n');
    }
    
    /**
     * CSV セルのエスケープ処理
     * @param {any} cell - セルの値
     * @returns {string} エスケープされたCSV値
     */
    escapeCSVCell(cell) {
        const cellStr = cell.toString();
        
        // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
            // ダブルクォートをエスケープ（""に変換）
            const escapedValue = cellStr.replace(/"/g, '""');
            return `"${escapedValue}"`;
        }
        
        return cellStr;
    }
    
    /**
     * CSVファイル名を生成
     * @param {string} algorithmType - アルゴリズムタイプ
     * @returns {string} ファイル名
     */
    generateCSVFilename(algorithmType = 'unknown') {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
        
        // アルゴリズムタイプに応じたプレフィックス
        const algorithmPrefix = {
            'pairwise': 'pairwise',
            'threeway': '3way',
            'allcombinations': 'allcomb',
            'unknown': 'testcases'
        };
        
        const prefix = algorithmPrefix[algorithmType] || 'testcases';
        return `${prefix}_${timestamp}.csv`;
    }
    
    /**
     * サンプルデータの読み込み（テスト用）
     */
    loadSampleData() {
        // サンプル因子を作成
        const sampleFactors = [
            new Factor('ブラウザ', ['Chrome', 'Firefox', 'Safari', 'Edge']),
            new Factor('OS', ['Windows', 'Mac', 'Linux']),
            new Factor('画面サイズ', ['デスクトップ', 'タブレット', 'モバイル'])
        ];
        
        // サンプルテストケースを生成
        const sampleTestCases = [
            new TestCase(new Map([
                [sampleFactors[0].id, 'Chrome'],
                [sampleFactors[1].id, 'Windows'],
                [sampleFactors[2].id, 'デスクトップ']
            ])),
            new TestCase(new Map([
                [sampleFactors[0].id, 'Firefox'],
                [sampleFactors[1].id, 'Mac'],
                [sampleFactors[2].id, 'タブレット']
            ])),
            new TestCase(new Map([
                [sampleFactors[0].id, 'Safari'],
                [sampleFactors[1].id, 'Linux'],
                [sampleFactors[2].id, 'モバイル']
            ])),
            new TestCase(new Map([
                [sampleFactors[0].id, 'Edge'],
                [sampleFactors[1].id, 'Windows'],
                [sampleFactors[2].id, 'タブレット']
            ])),
            new TestCase(new Map([
                [sampleFactors[0].id, 'Chrome'],
                [sampleFactors[1].id, 'Mac'],
                [sampleFactors[2].id, 'モバイル']
            ])),
            new TestCase(new Map([
                [sampleFactors[0].id, 'Firefox'],
                [sampleFactors[1].id, 'Linux'],
                [sampleFactors[2].id, 'デスクトップ']
            ]))
        ];
        
        // 結果を表示
        this.displayResults(sampleTestCases, sampleFactors, { algorithmType: 'pairwise' });
    }
}

/**
 * CoverageCalculator クラス - カバレッジ情報の計算
 */
class CoverageCalculator {
    constructor() {
        this.debugMode = false;
    }
    
    /**
     * 総合的なカバレッジ情報を計算
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @param {string} algorithmType - アルゴリズムタイプ ('pairwise', 'threeway', 'allcombinations')
     * @returns {Object} カバレッジ情報
     */
    calculateCoverage(testCases, factors, algorithmType = 'unknown') {
        if (!Array.isArray(testCases) || !Array.isArray(factors)) {
            throw new Error('無効なデータが渡されました');
        }
        
        const coverage = {
            algorithmType: algorithmType,
            testCaseCount: testCases.length,
            factorCount: factors.length,
            totalCombinations: this.calculateTotalCombinations(factors),
            pairwiseCoverage: null,
            threewayCovarage: null,
            reductionRate: 0,
            efficiency: 0
        };
        
        // 全組み合わせ数との比較で削減率を計算
        if (coverage.totalCombinations > 0) {
            coverage.reductionRate = ((coverage.totalCombinations - coverage.testCaseCount) / coverage.totalCombinations) * 100;
            coverage.efficiency = (coverage.totalCombinations / Math.max(coverage.testCaseCount, 1));
        }
        
        // ペアワイズカバレッジの計算
        if (factors.length >= 2) {
            coverage.pairwiseCoverage = this.calculatePairwiseCoverage(testCases, factors);
        }
        
        // 3因子間カバレッジの計算
        if (factors.length >= 3) {
            coverage.threewayCovarage = this.calculateThreewayCoverage(testCases, factors);
        }
        
        if (this.debugMode) {
            console.log('カバレッジ計算結果:', coverage);
        }
        
        return coverage;
    }
    
    /**
     * 全組み合わせ数を計算
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 全組み合わせ数
     */
    calculateTotalCombinations(factors) {
        return factors.reduce((total, factor) => total * factor.levels.length, 1);
    }
    
    /**
     * ペアワイズカバレッジを計算
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} ペアワイズカバレッジ情報
     */
    calculatePairwiseCoverage(testCases, factors) {
        const allPairs = this.generateAllPairs(factors);
        const coveredPairs = this.getCoveredPairs(testCases, factors);
        
        const coverageRate = allPairs.size > 0 ? (coveredPairs.size / allPairs.size) * 100 : 0;
        
        return {
            totalPairs: allPairs.size,
            coveredPairs: coveredPairs.size,
            uncoveredPairs: allPairs.size - coveredPairs.size,
            coverageRate: Math.round(coverageRate * 100) / 100
        };
    }
    
    /**
     * 3因子間カバレッジを計算
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} 3因子間カバレッジ情報
     */
    calculateThreewayCoverage(testCases, factors) {
        const allTriples = this.generateAllTriples(factors);
        const coveredTriples = this.getCoveredTriples(testCases, factors);
        
        const coverageRate = allTriples.size > 0 ? (coveredTriples.size / allTriples.size) * 100 : 0;
        
        return {
            totalTriples: allTriples.size,
            coveredTriples: coveredTriples.size,
            uncoveredTriples: allTriples.size - coveredTriples.size,
            coverageRate: Math.round(coverageRate * 100) / 100
        };
    }
    
    /**
     * 全ペアを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} 全ペアのセット
     */
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
    
    /**
     * 全トリプルを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} 全トリプルのセット
     */
    generateAllTriples(factors) {
        const allTriples = new Set();
        
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                for (let k = j + 1; k < factors.length; k++) {
                    const factor1 = factors[i];
                    const factor2 = factors[j];
                    const factor3 = factors[k];
                    
                    for (const level1 of factor1.levels) {
                        for (const level2 of factor2.levels) {
                            for (const level3 of factor3.levels) {
                                const tripleKey = this.createTripleKey(
                                    factor1.id, level1,
                                    factor2.id, level2,
                                    factor3.id, level3
                                );
                                allTriples.add(tripleKey);
                            }
                        }
                    }
                }
            }
        }
        
        return allTriples;
    }
    
    /**
     * カバー済みペアを取得
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} カバー済みペアのセット
     */
    getCoveredPairs(testCases, factors) {
        const coveredPairs = new Set();
        
        for (const testCase of testCases) {
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
        }
        
        return coveredPairs;
    }
    
    /**
     * カバー済みトリプルを取得
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} カバー済みトリプルのセット
     */
    getCoveredTriples(testCases, factors) {
        const coveredTriples = new Set();
        
        for (const testCase of testCases) {
            for (let i = 0; i < factors.length; i++) {
                for (let j = i + 1; j < factors.length; j++) {
                    for (let k = j + 1; k < factors.length; k++) {
                        const factor1 = factors[i];
                        const factor2 = factors[j];
                        const factor3 = factors[k];
                        const level1 = testCase.getLevel(factor1.id);
                        const level2 = testCase.getLevel(factor2.id);
                        const level3 = testCase.getLevel(factor3.id);
                        
                        if (level1 !== undefined && level2 !== undefined && level3 !== undefined) {
                            const tripleKey = this.createTripleKey(
                                factor1.id, level1,
                                factor2.id, level2,
                                factor3.id, level3
                            );
                            coveredTriples.add(tripleKey);
                        }
                    }
                }
            }
        }
        
        return coveredTriples;
    }
    
    /**
     * ペアキーの生成
     * @param {string} factorId1 - 第1因子ID
     * @param {string} level1 - 第1因子の水準
     * @param {string} factorId2 - 第2因子ID
     * @param {string} level2 - 第2因子の水準
     * @returns {string} ペアキー
     */
    createPairKey(factorId1, level1, factorId2, level2) {
        if (factorId1 > factorId2) {
            [factorId1, level1, factorId2, level2] = [factorId2, level2, factorId1, level1];
        }
        return `${factorId1}:${level1}|${factorId2}:${level2}`;
    }
    
    /**
     * トリプルキーの生成
     * @param {string} factorId1 - 第1因子ID
     * @param {string} level1 - 第1因子の水準
     * @param {string} factorId2 - 第2因子ID
     * @param {string} level2 - 第2因子の水準
     * @param {string} factorId3 - 第3因子ID
     * @param {string} level3 - 第3因子の水準
     * @returns {string} トリプルキー
     */
    createTripleKey(factorId1, level1, factorId2, level2, factorId3, level3) {
        const items = [
            { id: factorId1, level: level1 },
            { id: factorId2, level: level2 },
            { id: factorId3, level: level3 }
        ].sort((a, b) => a.id.localeCompare(b.id));
        
        return items.map(item => `${item.id}:${item.level}`).join('|');
    }
    
    /**
     * カバレッジ品質の評価
     * @param {number} coverageRate - カバレッジ率（%）
     * @returns {Object} 品質評価情報
     */
    evaluateCoverageQuality(coverageRate) {
        let quality, className, description;
        
        if (coverageRate >= 100) {
            quality = 'excellent';
            className = 'progress-excellent';
            description = '完全カバー';
        } else if (coverageRate >= 95) {
            quality = 'excellent';
            className = 'progress-excellent';
            description = '優秀';
        } else if (coverageRate >= 85) {
            quality = 'good';
            className = 'progress-good';
            description = '良好';
        } else if (coverageRate >= 70) {
            quality = 'fair';
            className = 'progress-fair';
            description = '普通';
        } else if (coverageRate >= 50) {
            quality = 'poor';
            className = 'progress-poor';
            description = '不十分';
        } else {
            quality = 'bad';
            className = 'progress-bad';
            description = '要改善';
        }
        
        return { quality, className, description };
    }
}

// グローバル ResultsTableManager インスタンス
let resultsTableManager;
let coverageCalculator;

/**
 * 表示件数変更ハンドラ（HTMLから呼び出される）
 */
function updateResultsPerPage() {
    if (!resultsTableManager) {
        resultsTableManager = new ResultsTableManager();
    }
    
    const select = document.getElementById('results-per-page');
    const itemsPerPage = parseInt(select.value);
    resultsTableManager.setItemsPerPage(itemsPerPage);
}

/**
 * 結果フィルタリングハンドラ（HTMLから呼び出される）
 */
function filterResults() {
    if (!resultsTableManager) {
        resultsTableManager = new ResultsTableManager();
    }
    
    const searchInput = document.getElementById('results-search');
    resultsTableManager.filterResults(searchInput.value);
}

/**
 * 結果クリアハンドラ（HTMLから呼び出される）
 */
function clearResults() {
    if (!resultsTableManager) {
        resultsTableManager = new ResultsTableManager();
    }
    
    if (confirm('表示中の結果をクリアしますか？')) {
        resultsTableManager.clearResults();
    }
}

/**
 * CSV出力ハンドラ（HTMLから呼び出される）
 * @param {string} algorithmType - アルゴリズムタイプ（オプション）
 */
function exportResultsToCSV(algorithmType = null) {
    if (!resultsTableManager) {
        console.error('ResultsTableManager が初期化されていません');
        showErrorMessage('結果データが見つかりません');
        return;
    }
    
    // アルゴリズムタイプを取得（グローバル状態から）
    const currentAlgorithmType = algorithmType || 
        (window.TestCombinationGenerator && window.TestCombinationGenerator.currentAlgorithm) || 
        'unknown';
    
    try {
        const csvData = resultsTableManager.generateCSVData(currentAlgorithmType);
        if (!csvData) {
            showErrorMessage('出力する結果がありません');
            return;
        }
        
        // Blob APIを使用してCSVファイルを生成
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // ファイル名を生成（日時・網羅タイプ含む）
        const filename = resultsTableManager.generateCSVFilename(currentAlgorithmType);
        
        // ダウンロードリンクを作成して実行
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // メモリクリーンアップ
        URL.revokeObjectURL(url);
        
        // 成功メッセージを表示
        showSuccessMessage(`CSVファイル "${filename}" をダウンロードしました`);
        
        console.log(`CSV出力完了: ${filename} (${currentAlgorithmType})`);
        
    } catch (error) {
        console.error('CSV出力エラー:', error);
        showErrorMessage('CSVファイルの生成中にエラーが発生しました');
    }
}

/**
 * 全組み合わせデータのCSV出力ハンドラ（HTMLから呼び出される）
 */
function exportAllCombinationsToCSV() {
    if (!inputManager || !inputManager.factors || inputManager.factors.length === 0) {
        showErrorMessage('因子データが見つかりません。まず因子を入力してください。');
        return;
    }
    
    try {
        // 全組み合わせ数を計算
        const allCombinationsGenerator = new AllCombinationsGenerator();
        const totalCombinations = allCombinationsGenerator.calculateTotalCombinations(inputManager.factors);
        const memoryEstimate = allCombinationsGenerator.estimateMemoryUsage(inputManager.factors);
        
        // 大容量ファイル警告とリスク評価
        let warningMessage = '';
        let riskLevel = 'low';
        
        if (totalCombinations > 1000000) {
            riskLevel = 'critical';
            warningMessage = `⚠️ 危険: 全組み合わせ数が ${totalCombinations.toLocaleString()} 件と極めて大きいです。\n` +
                           `推定メモリ使用量: ${memoryEstimate.formatted}\n` +
                           'ブラウザがクラッシュする可能性があります。\n' +
                           'ペアワイズテストまたは3因子間網羅テストの使用を強く推奨します。\n\n' +
                           '本当に続行しますか？';
        } else if (totalCombinations > 100000) {
            riskLevel = 'high';
            warningMessage = `⚠️ 警告: 全組み合わせ数が ${totalCombinations.toLocaleString()} 件と非常に大きいです。\n` +
                           `推定メモリ使用量: ${memoryEstimate.formatted}\n` +
                           'CSVファイルのサイズが大きくなり、処理に時間がかかります。\n\n' +
                           '続行しますか？';
        } else if (totalCombinations > 10000) {
            riskLevel = 'medium';
            warningMessage = `注意: 全組み合わせ数が ${totalCombinations.toLocaleString()} 件です。\n` +
                           `推定メモリ使用量: ${memoryEstimate.formatted}\n` +
                           '処理に少し時間がかかる可能性があります。\n\n' +
                           '続行しますか？';
        }
        
        if (warningMessage) {
            const confirmed = confirm(warningMessage);
            if (!confirmed) {
                return;
            }
        }
        
        // キャンセル可能なプログレス表示を開始
        const progressController = showCancellableProgress('全組み合わせ生成の準備中...', 0);
        
        // 非同期で全組み合わせを生成（大容量ファイル処理の最適化）
        setTimeout(() => {
            try {
                if (progressController.cancelled) return;
                
                progressController.updateProgress('全組み合わせを生成中...', 10);
                
                // 大容量データの場合はチャンク処理を使用
                if (totalCombinations > 50000) {
                    generateAllCombinationsWithChunks(inputManager.factors, progressController);
                } else {
                    // 通常処理
                    const testCases = allCombinationsGenerator.generate(inputManager.factors, true);
                    
                    if (progressController.cancelled) return;
                    progressController.updateProgress('CSVデータを生成中...', 60);
                    
                    setTimeout(() => {
                        if (progressController.cancelled) return;
                        
                        try {
                            // 最適化されたCSV生成
                            const csvData = generateOptimizedAllCombinationsCSV(testCases, inputManager.factors, progressController);
                            
                            if (progressController.cancelled) return;
                            progressController.updateProgress('ファイルをダウンロード中...', 90);
                            
                            downloadCSVFile(csvData, 'allcombinations', testCases.length, progressController);
                            
                        } catch (error) {
                            progressController.hide();
                            console.error('CSV生成エラー:', error);
                            showErrorMessage('CSVデータの生成中にエラーが発生しました');
                        }
                    }, 50);
                }
                
            } catch (error) {
                progressController.hide();
                console.error('全組み合わせ生成エラー:', error);
                showErrorMessage('全組み合わせの生成中にエラーが発生しました');
            }
        }, 100);
        
    } catch (error) {
        console.error('全組み合わせCSV出力エラー:', error);
        showErrorMessage('全組み合わせCSV出力の準備中にエラーが発生しました');
    }
}

/**
 * 大容量データ用のチャンク処理による全組み合わせ生成
 * @param {Array<Factor>} factors - 因子配列
 * @param {Object} progressController - プログレス制御オブジェクト
 */
function generateAllCombinationsWithChunks(factors, progressController) {
    const allCombinationsGenerator = new AllCombinationsGenerator();
    const chunkSize = 10000; // チャンクサイズ
    const totalCombinations = allCombinationsGenerator.calculateTotalCombinations(factors);
    
    let allTestCases = [];
    let processedCount = 0;
    
    // チャンク処理用のイテレータを作成
    const iterator = allCombinationsGenerator.generateCartesianProductIterator(factors);
    
    function processNextChunk() {
        if (progressController.cancelled) return;
        
        const chunk = [];
        let chunkCount = 0;
        
        // チャンクサイズ分のデータを処理
        while (chunkCount < chunkSize && processedCount < totalCombinations) {
            const result = iterator.next();
            if (result.done) break;
            
            chunk.push(result.value);
            chunkCount++;
            processedCount++;
        }
        
        if (chunk.length > 0) {
            allTestCases = allTestCases.concat(chunk);
            
            // プログレス更新
            const progress = 10 + (processedCount / totalCombinations) * 50; // 10-60%
            progressController.updateProgress(
                `全組み合わせを生成中... (${processedCount.toLocaleString()}/${totalCombinations.toLocaleString()})`,
                progress
            );
            
            // 次のチャンクを非同期で処理
            if (processedCount < totalCombinations) {
                setTimeout(processNextChunk, 10);
            } else {
                // 生成完了、CSV作成へ
                if (progressController.cancelled) return;
                progressController.updateProgress('CSVデータを生成中...', 60);
                
                setTimeout(() => {
                    if (progressController.cancelled) return;
                    
                    try {
                        const csvData = generateOptimizedAllCombinationsCSV(allTestCases, factors, progressController);
                        
                        if (progressController.cancelled) return;
                        progressController.updateProgress('ファイルをダウンロード中...', 90);
                        
                        downloadCSVFile(csvData, 'allcombinations', allTestCases.length, progressController);
                        
                    } catch (error) {
                        progressController.hide();
                        console.error('CSV生成エラー:', error);
                        showErrorMessage('CSVデータの生成中にエラーが発生しました');
                    }
                }, 50);
            }
        }
    }
    
    // チャンク処理を開始
    processNextChunk();
}

/**
 * 最適化されたCSVデータ生成（大容量ファイル対応）
 * @param {Array<TestCase>} testCases - テストケース配列
 * @param {Array<Factor>} factors - 因子配列
 * @param {Object} progressController - プログレス制御オブジェクト
 * @returns {string} CSV文字列
 */
function generateOptimizedAllCombinationsCSV(testCases, factors, progressController) {
    if (!Array.isArray(testCases) || !Array.isArray(factors)) {
        throw new Error('無効なデータが渡されました');
    }
    
    // ヘッダー行
    const headers = factors.map(f => f.name);
    let csvContent = headers.map(header => escapeCSVCell(header)).join(',') + '\n';
    
    // データ行を効率的に処理
    const chunkSize = 5000;
    let processedRows = 0;
    
    for (let i = 0; i < testCases.length; i += chunkSize) {
        if (progressController.cancelled) {
            throw new Error('処理がキャンセルされました');
        }
        
        const chunk = testCases.slice(i, Math.min(i + chunkSize, testCases.length));
        
        // チャンク内の行を処理
        const chunkRows = chunk.map(testCase => {
            const row = factors.map(factor => testCase.getLevel(factor.id) || '');
            return row.map(cell => escapeCSVCell(cell)).join(',');
        });
        
        csvContent += chunkRows.join('\n') + (i + chunkSize < testCases.length ? '\n' : '');
        processedRows += chunk.length;
        
        // プログレス更新（60-85%の範囲）
        const progress = 60 + (processedRows / testCases.length) * 25;
        progressController.updateProgress(
            `CSVデータを生成中... (${processedRows.toLocaleString()}/${testCases.length.toLocaleString()})`,
            progress
        );
        
        // UIをブロックしないように少し待機（同期処理なので省略）
    }
    
    return csvContent;
}

/**
 * CSVファイルのダウンロード処理
 * @param {string} csvData - CSVデータ
 * @param {string} type - ファイルタイプ
 * @param {number} recordCount - レコード数
 * @param {Object} progressController - プログレス制御オブジェクト
 */
function downloadCSVFile(csvData, type, recordCount, progressController) {
    try {
        // Blob APIを使用してCSVファイルを生成
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        // ファイル名を生成
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '').replace('T', '_');
        const filename = `${type}_${timestamp}.csv`;
        
        // ダウンロードリンクを作成して実行
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // メモリクリーンアップ
        URL.revokeObjectURL(url);
        
        // プログレス完了
        progressController.updateProgress('ダウンロード完了', 100);
        setTimeout(() => progressController.hide(), 2000);
        
        // 成功メッセージを表示
        const fileSizeMB = (csvData.length / (1024 * 1024)).toFixed(2);
        showSuccessMessage(
            `CSVファイル "${filename}" をダウンロードしました\n` +
            `${recordCount.toLocaleString()} 件のテストケース (${fileSizeMB} MB)`
        );
        
        console.log(`CSV出力完了: ${filename} (${recordCount}件, ${fileSizeMB}MB)`);
        
    } catch (error) {
        progressController.hide();
        console.error('ダウンロードエラー:', error);
        showErrorMessage('ファイルのダウンロード中にエラーが発生しました');
    }
}

/**
 * 全組み合わせ用のCSVデータを生成
 * @param {Array<TestCase>} testCases - テストケース配列
 * @param {Array<Factor>} factors - 因子配列
 * @returns {string} CSV文字列
 */
function generateAllCombinationsCSV(testCases, factors) {
    if (!Array.isArray(testCases) || !Array.isArray(factors)) {
        throw new Error('無効なデータが渡されました');
    }
    
    // ヘッダー行（因子名のみ）
    const headers = factors.map(f => f.name);
    const csvRows = [headers];
    
    // データ行
    testCases.forEach((testCase) => {
        const row = factors.map(factor => testCase.getLevel(factor.id) || '');
        csvRows.push(row);
    });
    
    // CSV文字列に変換（適切なエスケープ処理）
    return csvRows.map(row => 
        row.map(cell => escapeCSVCell(cell)).join(',')
    ).join('\n');
}

/**
 * CSV セルのエスケープ処理（共通関数）
 * @param {any} cell - セルの値
 * @returns {string} エスケープされたCSV値
 */
function escapeCSVCell(cell) {
    const cellStr = cell.toString();
    
    // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
    if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
        // ダブルクォートをエスケープ（""に変換）
        const escapedValue = cellStr.replace(/"/g, '""');
        return `"${escapedValue}"`;
    }
    
    return cellStr;
}

/**
 * PairwiseGenerator クラス - IPOGアルゴリズムによるペアワイズテスト生成
 */
class PairwiseGenerator {
    constructor() {
        this.debugMode = false;
    }
    
    /**
     * ペアワイズテストケースを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} 生成されたテストケース配列
     */
    generate(factors) {
        try {
            // 入力パラメータの検証
            if (!Array.isArray(factors)) {
                throw new Error('因子配列が必要です');
            }
            
            if (factors.length < 2) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.HIGH,
                    message: 'ペアワイズテストには最低2つの因子が必要です',
                    context: { factorCount: factors.length, algorithm: 'pairwise' }
                });
                throw new Error('ペアワイズテストには最低2つの因子が必要です');
            }
            
            // 因子のバリデーション
            const validationErrors = [];
            for (const factor of factors) {
                const validation = factor.validate();
                if (!validation.isValid) {
                    validationErrors.push(`因子 "${factor.name}": ${validation.errors.join(', ')}`);
                }
            }
            
            if (validationErrors.length > 0) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.HIGH,
                    message: '因子のバリデーションに失敗しました',
                    details: validationErrors.join('; '),
                    context: { 
                        algorithm: 'pairwise',
                        factorCount: factors.length,
                        validationErrors: validationErrors
                    }
                });
                throw new Error(`因子のバリデーションエラー: ${validationErrors.join('; ')}`);
            }
            
            // メモリ使用量の事前チェック
            const estimatedMemory = this.estimateMemoryUsage(factors);
            if (estimatedMemory > 500 * 1024 * 1024) { // 500MB
                errorHandler.handleError({
                    type: ErrorTypes.MEMORY,
                    severity: ErrorSeverity.HIGH,
                    message: 'メモリ使用量が多すぎます',
                    details: `推定メモリ使用量: ${Math.round(estimatedMemory / 1024 / 1024)}MB`,
                    context: { 
                        algorithm: 'pairwise',
                        estimatedMemory: estimatedMemory,
                        factorCount: factors.length
                    }
                });
                throw new Error('メモリ使用量が多すぎるため、処理を中断しました');
            }
        } catch (error) {
            // 既にerrorHandlerで処理されたエラーは再スロー
            if (error.message.includes('ペアワイズテストには最低') || 
                error.message.includes('因子のバリデーションエラー') ||
                error.message.includes('メモリ使用量が多すぎる')) {
                throw error;
            }
            
            // 予期しないエラーをハンドル
            errorHandler.handleError({
                type: ErrorTypes.ALGORITHM,
                severity: ErrorSeverity.HIGH,
                message: 'ペアワイズアルゴリズムの初期化でエラーが発生しました',
                details: error.message,
                stack: error.stack,
                context: { 
                    algorithm: 'pairwise',
                    factorCount: factors?.length || 0
                }
            });
            throw new Error('ペアワイズアルゴリズムの実行に失敗しました');
        }
        
        if (this.debugMode) {
            console.log('ペアワイズ生成開始:', factors.map(f => `${f.name}(${f.levels.length})`));
        }
        
        // IPOGアルゴリズムの実行
        const testCases = this.executeIPOG(factors);
        
        if (this.debugMode) {
            console.log(`ペアワイズ生成完了: ${testCases.length}件のテストケース`);
        }
        
        return testCases;
    }
    
    /**
     * IPOGアルゴリズムの実行
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} 生成されたテストケース配列
     */
    executeIPOG(factors) {
        // 最初の2因子で初期テストセットを構築
        let testCases = this.buildInitialTestSet(factors[0], factors[1]);
        
        // 残りの因子を1つずつ追加
        for (let i = 2; i < factors.length; i++) {
            testCases = this.extendTestSet(testCases, factors.slice(0, i), factors[i]);
        }
        
        return testCases;
    }
    
    /**
     * 初期テストセットの構築（最初の2因子）
     * @param {Factor} factor1 - 第1因子
     * @param {Factor} factor2 - 第2因子
     * @returns {Array<TestCase>} 初期テストケース配列
     */
    buildInitialTestSet(factor1, factor2) {
        const testCases = [];
        
        // 全ての組み合わせを生成（2因子なので全網羅）
        for (const level1 of factor1.levels) {
            for (const level2 of factor2.levels) {
                const combinations = new Map();
                combinations.set(factor1.id, level1);
                combinations.set(factor2.id, level2);
                testCases.push(new TestCase(combinations));
            }
        }
        
        if (this.debugMode) {
            console.log(`初期テストセット構築: ${testCases.length}件 (${factor1.name} x ${factor2.name})`);
        }
        
        return testCases;
    }
    
    /**
     * 新しい因子を追加してテストセットを拡張
     * @param {Array<TestCase>} existingTests - 既存のテストケース
     * @param {Array<Factor>} existingFactors - 既存の因子配列
     * @param {Factor} newFactor - 新しく追加する因子
     * @returns {Array<TestCase>} 拡張されたテストケース配列
     */
    extendTestSet(existingTests, existingFactors, newFactor) {
        // 新しい因子の各水準に対して、既存テストを拡張
        const extendedTests = [];
        
        // 各既存テストケースを新因子の最初の水準で拡張
        for (const testCase of existingTests) {
            const newTestCase = testCase.clone();
            newTestCase.setLevel(newFactor.id, newFactor.levels[0]);
            extendedTests.push(newTestCase);
        }
        
        // 未カバーのペアを特定して追加テストケースを生成
        const uncoveredPairs = this.findUncoveredPairs(extendedTests, [...existingFactors, newFactor]);
        const additionalTests = this.generateAdditionalTests(uncoveredPairs, [...existingFactors, newFactor]);
        
        extendedTests.push(...additionalTests);
        
        if (this.debugMode) {
            console.log(`因子拡張: ${newFactor.name} 追加後 ${extendedTests.length}件 (追加: ${additionalTests.length}件)`);
        }
        
        return extendedTests;
    }
    
    /**
     * 未カバーのペアを特定
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} 未カバーのペア文字列のセット
     */
    findUncoveredPairs(testCases, factors) {
        // 全ての可能なペアを生成
        const allPairs = this.generateAllPairs(factors);
        
        // カバー済みのペアを特定
        const coveredPairs = new Set();
        
        for (const testCase of testCases) {
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
        }
        
        // 未カバーのペアを特定
        const uncoveredPairs = new Set();
        for (const pair of allPairs) {
            if (!coveredPairs.has(pair)) {
                uncoveredPairs.add(pair);
            }
        }
        
        return uncoveredPairs;
    }
    
    /**
     * 全ての可能なペアを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} 全ペア文字列のセット
     */
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
    
    /**
     * ペアキーの生成
     * @param {string} factorId1 - 第1因子ID
     * @param {string} level1 - 第1因子の水準
     * @param {string} factorId2 - 第2因子ID
     * @param {string} level2 - 第2因子の水準
     * @returns {string} ペアキー
     */
    createPairKey(factorId1, level1, factorId2, level2) {
        // 因子IDの順序を統一（辞書順）
        if (factorId1 > factorId2) {
            [factorId1, level1, factorId2, level2] = [factorId2, level2, factorId1, level1];
        }
        return `${factorId1}:${level1}|${factorId2}:${level2}`;
    }
    
    /**
     * 未カバーペアをカバーする追加テストケースを生成
     * @param {Set<string>} uncoveredPairs - 未カバーのペア
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} 追加テストケース配列
     */
    generateAdditionalTests(uncoveredPairs, factors) {
        const additionalTests = [];
        const remainingPairs = new Set(uncoveredPairs);
        
        while (remainingPairs.size > 0) {
            // 貪欲アルゴリズム: 最も多くの未カバーペアをカバーするテストケースを生成
            const bestTestCase = this.findBestTestCase(remainingPairs, factors);
            
            if (bestTestCase) {
                additionalTests.push(bestTestCase);
                
                // カバーされたペアを削除
                const coveredPairs = this.getCoveredPairs(bestTestCase, factors);
                for (const pair of coveredPairs) {
                    remainingPairs.delete(pair);
                }
            } else {
                // 無限ループ防止
                break;
            }
        }
        
        return additionalTests;
    }
    
    /**
     * 最も多くの未カバーペアをカバーするテストケースを見つける
     * @param {Set<string>} uncoveredPairs - 未カバーのペア
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase|null} 最適なテストケース
     */
    findBestTestCase(uncoveredPairs, factors) {
        let bestTestCase = null;
        let maxCoverage = 0;
        
        // 全ての可能な組み合わせを試行（制限付き）
        const maxAttempts = Math.min(1000, this.calculateTotalCombinations(factors));
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const testCase = this.generateRandomTestCase(factors);
            const coverage = this.countCoveredPairs(testCase, uncoveredPairs, factors);
            
            if (coverage > maxCoverage) {
                maxCoverage = coverage;
                bestTestCase = testCase;
            }
            
            // 完全カバーが見つかったら早期終了
            if (coverage === uncoveredPairs.size) {
                break;
            }
        }
        
        return bestTestCase;
    }
    
    /**
     * ランダムなテストケースを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase} ランダムテストケース
     */
    generateRandomTestCase(factors) {
        const combinations = new Map();
        
        for (const factor of factors) {
            const randomLevel = factor.levels[Math.floor(Math.random() * factor.levels.length)];
            combinations.set(factor.id, randomLevel);
        }
        
        return new TestCase(combinations);
    }
    
    /**
     * テストケースがカバーする未カバーペア数をカウント
     * @param {TestCase} testCase - テストケース
     * @param {Set<string>} uncoveredPairs - 未カバーのペア
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} カバーするペア数
     */
    countCoveredPairs(testCase, uncoveredPairs, factors) {
        let count = 0;
        
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                const factor1 = factors[i];
                const factor2 = factors[j];
                const level1 = testCase.getLevel(factor1.id);
                const level2 = testCase.getLevel(factor2.id);
                
                if (level1 !== undefined && level2 !== undefined) {
                    const pairKey = this.createPairKey(factor1.id, level1, factor2.id, level2);
                    if (uncoveredPairs.has(pairKey)) {
                        count++;
                    }
                }
            }
        }
        
        return count;
    }
    
    /**
     * テストケースがカバーするペアを取得
     * @param {TestCase} testCase - テストケース
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} カバーするペアのセット
     */
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
    
    /**
     * 総組み合わせ数を計算
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 総組み合わせ数
     */
    calculateTotalCombinations(factors) {
        return factors.reduce((total, factor) => total * factor.levels.length, 1);
    }
    
    /**
     * ペアワイズカバレッジを計算
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} カバレッジ情報
     */
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
        const totalCombinations = this.calculateTotalCombinations(factors);
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
    /**
     * メモリ使用量の推定
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 推定メモリ使用量（バイト）
     */
    estimateMemoryUsage(factors) {
        if (!Array.isArray(factors) || factors.length === 0) {
            return 0;
        }
        
        try {
            // ペアの総数を計算
            let totalPairs = 0;
            for (let i = 0; i < factors.length; i++) {
                for (let j = i + 1; j < factors.length; j++) {
                    totalPairs += factors[i].getLevelCount() * factors[j].getLevelCount();
                }
            }
            
            // 推定テストケース数（経験的な値）
            const estimatedTestCases = Math.min(totalPairs, Math.pow(factors.reduce((max, f) => Math.max(max, f.getLevelCount()), 0), 2));
            
            // メモリ使用量の推定
            // - 各テストケース: 約200バイト（オブジェクトオーバーヘッド含む）
            // - 各ペア: 約100バイト
            // - その他のデータ構造: 約50%のオーバーヘッド
            const testCaseMemory = estimatedTestCases * 200;
            const pairMemory = totalPairs * 100;
            const overhead = (testCaseMemory + pairMemory) * 0.5;
            
            return testCaseMemory + pairMemory + overhead;
        } catch (error) {
            // エラーが発生した場合は安全な値を返す
            return factors.length * 1024 * 1024; // 因子数 × 1MB
        }
    }
}

/**
 * ThreeWayGenerator クラス - 3因子間網羅テスト生成
 */
class ThreeWayGenerator {
    constructor() {
        this.debugMode = false;
    }
    
    /**
     * 3因子間網羅テストケースを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} 生成されたテストケース配列
     */
    generate(factors) {
        try {
            // 入力パラメータの検証
            if (!Array.isArray(factors)) {
                throw new Error('因子配列が必要です');
            }
            
            if (factors.length < 3) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.HIGH,
                    message: '3因子間網羅テストには最低3つの因子が必要です',
                    context: { factorCount: factors.length, algorithm: 'threeway' }
                });
                throw new Error('3因子間網羅テストには最低3つの因子が必要です');
            }
            
            // 因子のバリデーション
            const validationErrors = [];
            for (const factor of factors) {
                const validation = factor.validate();
                if (!validation.isValid) {
                    validationErrors.push(`因子 "${factor.name}": ${validation.errors.join(', ')}`);
                }
            }
            
            if (validationErrors.length > 0) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.HIGH,
                    message: '因子のバリデーションに失敗しました',
                    details: validationErrors.join('; '),
                    context: { 
                        algorithm: 'threeway',
                        factorCount: factors.length,
                        validationErrors: validationErrors
                    }
                });
                throw new Error(`因子のバリデーションエラー: ${validationErrors.join('; ')}`);
            }
            
            // メモリ使用量の事前チェック
            const estimatedMemory = this.estimateMemoryUsage(factors);
            if (estimatedMemory > 1024 * 1024 * 1024) { // 1GB
                errorHandler.handleError({
                    type: ErrorTypes.MEMORY,
                    severity: ErrorSeverity.HIGH,
                    message: 'メモリ使用量が多すぎます',
                    details: `推定メモリ使用量: ${Math.round(estimatedMemory / 1024 / 1024)}MB`,
                    context: { 
                        algorithm: 'threeway',
                        estimatedMemory: estimatedMemory,
                        factorCount: factors.length
                    }
                });
                throw new Error('メモリ使用量が多すぎるため、処理を中断しました');
            }
        } catch (error) {
            // 既にerrorHandlerで処理されたエラーは再スロー
            if (error.message.includes('3因子間網羅テストには最低') || 
                error.message.includes('因子のバリデーションエラー') ||
                error.message.includes('メモリ使用量が多すぎる')) {
                throw error;
            }
            
            // 予期しないエラーをハンドル
            errorHandler.handleError({
                type: ErrorTypes.ALGORITHM,
                severity: ErrorSeverity.HIGH,
                message: '3因子間網羅アルゴリズムの初期化でエラーが発生しました',
                details: error.message,
                stack: error.stack,
                context: { 
                    algorithm: 'threeway',
                    factorCount: factors?.length || 0
                }
            });
            throw new Error('3因子間網羅アルゴリズムの実行に失敗しました');
        }
        
        if (this.debugMode) {
            console.log('3因子間網羅生成開始:', factors.map(f => `${f.name}(${f.levels.length})`));
        }
        
        // 全トリプルを生成
        const allTriples = this.generateAllTriples(factors);
        
        if (this.debugMode) {
            console.log(`生成対象トリプル数: ${allTriples.size}`);
        }
        
        // 貪欲アルゴリズムでカバリングアレイを構築
        const testCases = this.buildCoveringArray(allTriples, factors);
        
        if (this.debugMode) {
            console.log(`3因子間網羅生成完了: ${testCases.length}件のテストケース`);
        }
        
        return testCases;
    }
    
    /**
     * 全ての3因子組み合わせ（トリプル）を生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} 全トリプル文字列のセット
     */
    generateAllTriples(factors) {
        const allTriples = new Set();
        
        // 3因子の全組み合わせを生成
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                for (let k = j + 1; k < factors.length; k++) {
                    const factor1 = factors[i];
                    const factor2 = factors[j];
                    const factor3 = factors[k];
                    
                    // 各因子の水準の全組み合わせ
                    for (const level1 of factor1.levels) {
                        for (const level2 of factor2.levels) {
                            for (const level3 of factor3.levels) {
                                const tripleKey = this.createTripleKey(
                                    factor1.id, level1,
                                    factor2.id, level2,
                                    factor3.id, level3
                                );
                                allTriples.add(tripleKey);
                            }
                        }
                    }
                }
            }
        }
        
        return allTriples;
    }
    
    /**
     * トリプルキーの生成
     * @param {string} factorId1 - 第1因子ID
     * @param {string} level1 - 第1因子の水準
     * @param {string} factorId2 - 第2因子ID
     * @param {string} level2 - 第2因子の水準
     * @param {string} factorId3 - 第3因子ID
     * @param {string} level3 - 第3因子の水準
     * @returns {string} トリプルキー
     */
    createTripleKey(factorId1, level1, factorId2, level2, factorId3, level3) {
        // 因子IDの順序を統一（辞書順）
        const items = [
            { id: factorId1, level: level1 },
            { id: factorId2, level: level2 },
            { id: factorId3, level: level3 }
        ].sort((a, b) => a.id.localeCompare(b.id));
        
        return items.map(item => `${item.id}:${item.level}`).join('|');
    }
    
    /**
     * 貪欲アルゴリズムによるカバリングアレイ構築
     * @param {Set<string>} allTriples - 全トリプルのセット
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} カバリングアレイ
     */
    buildCoveringArray(allTriples, factors) {
        const testCases = [];
        const remainingTriples = new Set(allTriples);
        
        // 初期テストケースを生成（ペアワイズベース）
        const pairwiseGenerator = new PairwiseGenerator();
        const initialTests = pairwiseGenerator.generate(factors);
        
        // 初期テストケースでカバーされるトリプルを除去
        for (const testCase of initialTests) {
            const coveredTriples = this.getCoveredTriples(testCase, factors);
            for (const triple of coveredTriples) {
                remainingTriples.delete(triple);
            }
            testCases.push(testCase);
        }
        
        if (this.debugMode) {
            console.log(`初期ペアワイズテスト: ${initialTests.length}件, 残りトリプル: ${remainingTriples.size}`);
        }
        
        // 残りのトリプルをカバーする追加テストケースを生成
        let iterationCount = 0;
        const maxIterations = Math.min(1000, remainingTriples.size);
        
        while (remainingTriples.size > 0 && iterationCount < maxIterations) {
            const bestTestCase = this.findBestTestCaseForTriples(remainingTriples, factors);
            
            if (bestTestCase) {
                testCases.push(bestTestCase);
                
                // カバーされたトリプルを削除
                const coveredTriples = this.getCoveredTriples(bestTestCase, factors);
                let removedCount = 0;
                for (const triple of coveredTriples) {
                    if (remainingTriples.delete(triple)) {
                        removedCount++;
                    }
                }
                
                if (this.debugMode && removedCount > 0) {
                    console.log(`追加テスト${iterationCount + 1}: ${removedCount}トリプルをカバー, 残り: ${remainingTriples.size}`);
                }
                
                // 進歩がない場合は終了
                if (removedCount === 0) {
                    break;
                }
            } else {
                break;
            }
            
            iterationCount++;
        }
        
        if (remainingTriples.size > 0) {
            console.warn(`警告: ${remainingTriples.size}個のトリプルが未カバーです`);
        }
        
        return testCases;
    }
    
    /**
     * 最も多くの未カバートリプルをカバーするテストケースを見つける
     * @param {Set<string>} uncoveredTriples - 未カバーのトリプル
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase|null} 最適なテストケース
     */
    findBestTestCaseForTriples(uncoveredTriples, factors) {
        let bestTestCase = null;
        let maxCoverage = 0;
        
        // 制限付きランダム探索
        const maxAttempts = Math.min(2000, uncoveredTriples.size * 10);
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const testCase = this.generateRandomTestCase(factors);
            const coverage = this.countCoveredTriples(testCase, uncoveredTriples, factors);
            
            if (coverage > maxCoverage) {
                maxCoverage = coverage;
                bestTestCase = testCase;
            }
            
            // 十分なカバレッジが得られたら早期終了
            if (coverage >= Math.min(10, uncoveredTriples.size)) {
                break;
            }
        }
        
        // ランダム探索で見つからない場合は、決定的アプローチを試行
        if (maxCoverage === 0 && uncoveredTriples.size > 0) {
            bestTestCase = this.generateDeterministicTestCase(uncoveredTriples, factors);
        }
        
        return bestTestCase;
    }
    
    /**
     * 決定的アプローチでテストケースを生成
     * @param {Set<string>} uncoveredTriples - 未カバーのトリプル
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase|null} 生成されたテストケース
     */
    generateDeterministicTestCase(uncoveredTriples, factors) {
        if (uncoveredTriples.size === 0) return null;
        
        // 最初の未カバートリプルを取得
        const firstTriple = uncoveredTriples.values().next().value;
        const testCase = this.createTestCaseFromTriple(firstTriple, factors);
        
        return testCase;
    }
    
    /**
     * トリプルからテストケースを作成
     * @param {string} tripleKey - トリプルキー
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase} 作成されたテストケース
     */
    createTestCaseFromTriple(tripleKey, factors) {
        const combinations = new Map();
        
        // トリプルキーを解析
        const parts = tripleKey.split('|');
        const tripleFactors = new Map();
        
        for (const part of parts) {
            const [factorId, level] = part.split(':');
            tripleFactors.set(factorId, level);
        }
        
        // 全ての因子に値を設定
        for (const factor of factors) {
            if (tripleFactors.has(factor.id)) {
                combinations.set(factor.id, tripleFactors.get(factor.id));
            } else {
                // トリプルに含まれない因子はランダムに設定
                const randomLevel = factor.levels[Math.floor(Math.random() * factor.levels.length)];
                combinations.set(factor.id, randomLevel);
            }
        }
        
        return new TestCase(combinations);
    }
    
    /**
     * ランダムなテストケースを生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {TestCase} ランダムテストケース
     */
    generateRandomTestCase(factors) {
        const combinations = new Map();
        
        for (const factor of factors) {
            const randomLevel = factor.levels[Math.floor(Math.random() * factor.levels.length)];
            combinations.set(factor.id, randomLevel);
        }
        
        return new TestCase(combinations);
    }
    
    /**
     * テストケースがカバーするトリプルを取得
     * @param {TestCase} testCase - テストケース
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Set<string>} カバーするトリプルのセット
     */
    getCoveredTriples(testCase, factors) {
        const coveredTriples = new Set();
        
        // 3因子の全組み合わせをチェック
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                for (let k = j + 1; k < factors.length; k++) {
                    const factor1 = factors[i];
                    const factor2 = factors[j];
                    const factor3 = factors[k];
                    
                    const level1 = testCase.getLevel(factor1.id);
                    const level2 = testCase.getLevel(factor2.id);
                    const level3 = testCase.getLevel(factor3.id);
                    
                    if (level1 !== undefined && level2 !== undefined && level3 !== undefined) {
                        const tripleKey = this.createTripleKey(
                            factor1.id, level1,
                            factor2.id, level2,
                            factor3.id, level3
                        );
                        coveredTriples.add(tripleKey);
                    }
                }
            }
        }
        
        return coveredTriples;
    }
    
    /**
     * テストケースがカバーする未カバートリプル数をカウント
     * @param {TestCase} testCase - テストケース
     * @param {Set<string>} uncoveredTriples - 未カバーのトリプル
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} カバーするトリプル数
     */
    countCoveredTriples(testCase, uncoveredTriples, factors) {
        let count = 0;
        
        for (let i = 0; i < factors.length; i++) {
            for (let j = i + 1; j < factors.length; j++) {
                for (let k = j + 1; k < factors.length; k++) {
                    const factor1 = factors[i];
                    const factor2 = factors[j];
                    const factor3 = factors[k];
                    
                    const level1 = testCase.getLevel(factor1.id);
                    const level2 = testCase.getLevel(factor2.id);
                    const level3 = testCase.getLevel(factor3.id);
                    
                    if (level1 !== undefined && level2 !== undefined && level3 !== undefined) {
                        const tripleKey = this.createTripleKey(
                            factor1.id, level1,
                            factor2.id, level2,
                            factor3.id, level3
                        );
                        if (uncoveredTriples.has(tripleKey)) {
                            count++;
                        }
                    }
                }
            }
        }
        
        return count;
    }
    
    /**
     * 3因子間網羅カバレッジを計算
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} カバレッジ情報
     */
    calculateCoverage(testCases, factors) {
        const allTriples = this.generateAllTriples(factors);
        const coveredTriples = new Set();
        
        for (const testCase of testCases) {
            const triples = this.getCoveredTriples(testCase, factors);
            for (const triple of triples) {
                coveredTriples.add(triple);
            }
        }
        
        const coverageRate = allTriples.size > 0 ? (coveredTriples.size / allTriples.size) * 100 : 0;
        const totalCombinations = this.calculateTotalCombinations(factors);
        const reductionRate = totalCombinations > 0 ? ((totalCombinations - testCases.length) / totalCombinations) * 100 : 0;
        
        return {
            totalTriples: allTriples.size,
            coveredTriples: coveredTriples.size,
            coverageRate: Math.round(coverageRate * 100) / 100,
            testCaseCount: testCases.length,
            totalCombinations: totalCombinations,
            reductionRate: Math.round(reductionRate * 100) / 100
        };
    }
    
    /**
     * 総組み合わせ数を計算
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 総組み合わせ数
     */
    calculateTotalCombinations(factors) {
        return factors.reduce((total, factor) => total * factor.levels.length, 1);
    }
    /**
     * メモリ使用量の推定
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 推定メモリ使用量（バイト）
     */
    estimateMemoryUsage(factors) {
        if (!Array.isArray(factors) || factors.length === 0) {
            return 0;
        }
        
        try {
            // トリプルの総数を計算
            let totalTriples = 0;
            for (let i = 0; i < factors.length; i++) {
                for (let j = i + 1; j < factors.length; j++) {
                    for (let k = j + 1; k < factors.length; k++) {
                        totalTriples += factors[i].getLevelCount() * factors[j].getLevelCount() * factors[k].getLevelCount();
                    }
                }
            }
            
            // 推定テストケース数（経験的な値、3因子間網羅は複雑）
            const maxLevels = factors.reduce((max, f) => Math.max(max, f.getLevelCount()), 0);
            const estimatedTestCases = Math.min(totalTriples, Math.pow(maxLevels, 3));
            
            // メモリ使用量の推定
            // - 各テストケース: 約200バイト
            // - 各トリプル: 約150バイト
            // - その他のデータ構造: 約100%のオーバーヘッド（3因子間は複雑）
            const testCaseMemory = estimatedTestCases * 200;
            const tripleMemory = totalTriples * 150;
            const overhead = (testCaseMemory + tripleMemory) * 1.0;
            
            return testCaseMemory + tripleMemory + overhead;
        } catch (error) {
            // エラーが発生した場合は安全な値を返す
            return factors.length * 2 * 1024 * 1024; // 因子数 × 2MB
        }
    }
}

/**
 * AllCombinationsGenerator クラス - 全組み合わせ生成
 */
class AllCombinationsGenerator {
    constructor() {
        this.debugMode = false;
        this.maxSafeCombinations = 100000; // 安全な組み合わせ数の上限
        this.maxWarningCombinations = 1000000; // 警告を出す組み合わせ数の上限
    }
    
    /**
     * 全組み合わせテストケースを生成
     * @param {Array<Factor>} factors - 因子配列
     * @param {boolean} forceGenerate - 大規模データでも強制生成するか
     * @returns {Array<TestCase>} 生成されたテストケース配列
     */
    generate(factors, forceGenerate = false) {
        try {
            // 入力パラメータの検証
            if (!Array.isArray(factors)) {
                throw new Error('因子配列が必要です');
            }
            
            if (factors.length === 0) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.MEDIUM,
                    message: '全組み合わせ生成には最低1つの因子が必要です',
                    context: { factorCount: factors.length, algorithm: 'allcombinations' }
                });
                throw new Error('全組み合わせ生成には最低1つの因子が必要です');
            }
            
            // 因子のバリデーション
            const validationErrors = [];
            for (const factor of factors) {
                const validation = factor.validate();
                if (!validation.isValid) {
                    validationErrors.push(`因子 "${factor.name}": ${validation.errors.join(', ')}`);
                }
            }
            
            if (validationErrors.length > 0) {
                errorHandler.handleError({
                    type: ErrorTypes.VALIDATION,
                    severity: ErrorSeverity.HIGH,
                    message: '因子のバリデーションに失敗しました',
                    details: validationErrors.join('; '),
                    context: { 
                        algorithm: 'allcombinations',
                        factorCount: factors.length,
                        validationErrors: validationErrors
                    }
                });
                throw new Error(`因子のバリデーションエラー: ${validationErrors.join('; ')}`);
            }
            
            // 組み合わせ数の計算と警告チェック
            let totalCombinations, memoryEstimate;
            try {
                totalCombinations = this.calculateTotalCombinations(factors);
                memoryEstimate = this.estimateMemoryUsage(totalCombinations, factors);
            } catch (calcError) {
                errorHandler.handleError({
                    type: ErrorTypes.ALGORITHM,
                    severity: ErrorSeverity.HIGH,
                    message: '組み合わせ数の計算でエラーが発生しました',
                    details: calcError.message,
                    context: { 
                        algorithm: 'allcombinations',
                        factorCount: factors.length
                    }
                });
                throw new Error('組み合わせ数の計算に失敗しました');
            }
            
            if (this.debugMode) {
                console.log('全組み合わせ生成開始:', factors.map(f => `${f.name}(${f.levels.length})`));
                console.log(`総組み合わせ数: ${totalCombinations.toLocaleString()}`);
                console.log(`推定メモリ使用量: ${memoryEstimate.formatted}`);
            }
            
            // 大規模データセットの警告
            if (!forceGenerate) {
                const warningResult = this.checkLargeDatasetWarning(totalCombinations, memoryEstimate);
                if (warningResult.shouldWarn) {
                    errorHandler.handleError({
                        type: ErrorTypes.MEMORY,
                        severity: ErrorSeverity.HIGH,
                        message: '大容量データセットの警告',
                        details: warningResult.message,
                        context: { 
                            algorithm: 'allcombinations',
                            totalCombinations: totalCombinations,
                            memoryEstimate: memoryEstimate
                        }
                    });
                    throw new Error(warningResult.message);
                }
            }
        } catch (error) {
            // 既にerrorHandlerで処理されたエラーは再スロー
            if (error.message.includes('全組み合わせ生成には最低') || 
                error.message.includes('因子のバリデーションエラー') ||
                error.message.includes('組み合わせ数の計算に失敗') ||
                error.message.includes('メモリ不足') ||
                error.message.includes('組み合わせ数が多すぎます')) {
                throw error;
            }
            
            // 予期しないエラーをハンドル
            errorHandler.handleError({
                type: ErrorTypes.ALGORITHM,
                severity: ErrorSeverity.HIGH,
                message: '全組み合わせアルゴリズムの初期化でエラーが発生しました',
                details: error.message,
                stack: error.stack,
                context: { 
                    algorithm: 'allcombinations',
                    factorCount: factors?.length || 0
                }
            });
            throw new Error('全組み合わせアルゴリズムの実行に失敗しました');
        }
        
        // デカルト積による全組み合わせ生成
        const testCases = this.generateCartesianProduct(factors);
        
        if (this.debugMode) {
            console.log(`全組み合わせ生成完了: ${testCases.length}件のテストケース`);
        }
        
        return testCases;
    }
    
    /**
     * 総組み合わせ数を計算
     * @param {Array<Factor>} factors - 因子配列
     * @returns {number} 総組み合わせ数
     */
    calculateTotalCombinations(factors) {
        if (factors.length === 0) return 0;
        
        let total = 1;
        for (const factor of factors) {
            // オーバーフロー防止
            if (total > Number.MAX_SAFE_INTEGER / factor.levels.length) {
                return Number.MAX_SAFE_INTEGER;
            }
            total *= factor.levels.length;
        }
        
        return total;
    }
    
    /**
     * メモリ使用量を推定
     * @param {number} totalCombinations - 総組み合わせ数
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} メモリ使用量情報
     */
    estimateMemoryUsage(totalCombinations, factors) {
        // 1つのテストケースあたりの推定メモリ使用量（バイト）
        const avgLevelLength = factors.reduce((sum, factor) => {
            const avgLength = factor.levels.reduce((s, level) => s + level.length, 0) / factor.levels.length;
            return sum + avgLength;
        }, 0) / factors.length;
        
        // オブジェクトオーバーヘッドを含む推定サイズ
        const bytesPerTestCase = (avgLevelLength * factors.length * 2) + 200; // 文字列 + オブジェクトオーバーヘッド
        const totalBytes = totalCombinations * bytesPerTestCase;
        
        return {
            bytes: totalBytes,
            formatted: this.formatBytes(totalBytes),
            bytesPerTestCase: bytesPerTestCase
        };
    }
    
    /**
     * バイト数を人間が読みやすい形式にフォーマット
     * @param {number} bytes - バイト数
     * @returns {string} フォーマットされた文字列
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * 大規模データセットの警告チェック
     * @param {number} totalCombinations - 総組み合わせ数
     * @param {Object} memoryEstimate - メモリ使用量推定
     * @returns {Object} 警告結果
     */
    checkLargeDatasetWarning(totalCombinations, memoryEstimate) {
        const result = {
            shouldWarn: false,
            level: 'none',
            message: ''
        };
        
        if (totalCombinations > this.maxWarningCombinations) {
            result.shouldWarn = true;
            result.level = 'critical';
            result.message = `組み合わせ数が非常に大きすぎます（${totalCombinations.toLocaleString()}件）。` +
                           `ブラウザがフリーズする可能性があります。` +
                           `推定メモリ使用量: ${memoryEstimate.formatted}`;
        } else if (totalCombinations > this.maxSafeCombinations) {
            result.shouldWarn = true;
            result.level = 'warning';
            result.message = `組み合わせ数が大きいです（${totalCombinations.toLocaleString()}件）。` +
                           `処理に時間がかかる可能性があります。` +
                           `推定メモリ使用量: ${memoryEstimate.formatted}`;
        } else if (memoryEstimate.bytes > 100 * 1024 * 1024) { // 100MB
            result.shouldWarn = true;
            result.level = 'warning';
            result.message = `推定メモリ使用量が大きいです（${memoryEstimate.formatted}）。` +
                           `処理に時間がかかる可能性があります。`;
        }
        
        return result;
    }
    
    /**
     * デカルト積による全組み合わせ生成
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Array<TestCase>} 全組み合わせテストケース配列
     */
    generateCartesianProduct(factors) {
        if (factors.length === 0) return [];
        
        const testCases = [];
        const totalCombinations = this.calculateTotalCombinations(factors);
        
        // 進捗報告用
        let processedCount = 0;
        const reportInterval = Math.max(1, Math.floor(totalCombinations / 100));
        
        // 再帰的にデカルト積を生成
        this.generateCombinationsRecursive(factors, 0, new Map(), testCases, (count) => {
            processedCount = count;
            if (this.debugMode && count % reportInterval === 0) {
                const progress = ((count / totalCombinations) * 100).toFixed(1);
                console.log(`生成進捗: ${progress}% (${count.toLocaleString()}/${totalCombinations.toLocaleString()})`);
            }
        });
        
        return testCases;
    }
    
    /**
     * 再帰的な組み合わせ生成
     * @param {Array<Factor>} factors - 因子配列
     * @param {number} factorIndex - 現在の因子インデックス
     * @param {Map} currentCombination - 現在の組み合わせ
     * @param {Array<TestCase>} results - 結果配列
     * @param {Function} progressCallback - 進捗コールバック
     */
    generateCombinationsRecursive(factors, factorIndex, currentCombination, results, progressCallback) {
        // ベースケース: 全ての因子を処理した
        if (factorIndex >= factors.length) {
            const testCase = new TestCase(new Map(currentCombination));
            results.push(testCase);
            
            if (progressCallback) {
                progressCallback(results.length);
            }
            return;
        }
        
        // 現在の因子の全ての水準を試行
        const currentFactor = factors[factorIndex];
        for (const level of currentFactor.levels) {
            currentCombination.set(currentFactor.id, level);
            
            // 次の因子へ再帰
            this.generateCombinationsRecursive(
                factors, 
                factorIndex + 1, 
                currentCombination, 
                results, 
                progressCallback
            );
            
            // バックトラック（現在の水準を削除）
            currentCombination.delete(currentFactor.id);
        }
    }
    
    /**
     * 効率的な全組み合わせ生成（イテレータ版）
     * 大規模データセット用の遅延評価版
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Generator<TestCase>} テストケースジェネレータ
     */
    * generateCartesianProductIterator(factors) {
        if (factors.length === 0) return;
        
        const levelIndices = new Array(factors.length).fill(0);
        const maxIndices = factors.map(factor => factor.levels.length - 1);
        
        let hasMore = true;
        let count = 0;
        
        while (hasMore) {
            // 現在のインデックスに基づいてテストケースを生成
            const combinations = new Map();
            for (let i = 0; i < factors.length; i++) {
                const factor = factors[i];
                const level = factor.levels[levelIndices[i]];
                combinations.set(factor.id, level);
            }
            
            yield new TestCase(combinations);
            count++;
            
            // 次のインデックスの組み合わせを計算
            hasMore = this.incrementIndices(levelIndices, maxIndices);
            
            // 進捗報告
            if (this.debugMode && count % 10000 === 0) {
                console.log(`生成済み: ${count.toLocaleString()}件`);
            }
        }
    }
    
    /**
     * インデックス配列をインクリメント（進位法）
     * @param {Array<number>} indices - 現在のインデックス配列
     * @param {Array<number>} maxIndices - 最大インデックス配列
     * @returns {boolean} まだ組み合わせが残っているか
     */
    incrementIndices(indices, maxIndices) {
        for (let i = indices.length - 1; i >= 0; i--) {
            if (indices[i] < maxIndices[i]) {
                indices[i]++;
                return true;
            } else {
                indices[i] = 0;
            }
        }
        return false;
    }
    
    /**
     * 全組み合わせカバレッジを計算（常に100%）
     * @param {Array<TestCase>} testCases - テストケース配列
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} カバレッジ情報
     */
    calculateCoverage(testCases, factors) {
        const totalCombinations = this.calculateTotalCombinations(factors);
        
        return {
            totalCombinations: totalCombinations,
            testCaseCount: testCases.length,
            coverageRate: 100.0, // 全組み合わせなので常に100%
            reductionRate: 0.0,  // 削減なし
            isComplete: testCases.length === totalCombinations
        };
    }
    
    /**
     * 組み合わせ数の事前チェック
     * @param {Array<Factor>} factors - 因子配列
     * @returns {Object} チェック結果
     */
    preCheckCombinations(factors) {
        const totalCombinations = this.calculateTotalCombinations(factors);
        const memoryEstimate = this.estimateMemoryUsage(totalCombinations, factors);
        const warningResult = this.checkLargeDatasetWarning(totalCombinations, memoryEstimate);
        
        return {
            totalCombinations: totalCombinations,
            memoryEstimate: memoryEstimate,
            warning: warningResult,
            canGenerate: !warningResult.shouldWarn || warningResult.level !== 'critical',
            recommendation: this.getRecommendation(totalCombinations, factors.length)
        };
    }
    
    /**
     * 推奨事項を取得
     * @param {number} totalCombinations - 総組み合わせ数
     * @param {number} factorCount - 因子数
     * @returns {string} 推奨事項
     */
    getRecommendation(totalCombinations, factorCount) {
        if (totalCombinations <= 1000) {
            return '組み合わせ数が少ないため、全組み合わせ生成が適しています。';
        } else if (totalCombinations <= 10000) {
            return '適度な組み合わせ数です。全組み合わせまたはペアワイズテストを検討してください。';
        } else if (totalCombinations <= 100000) {
            return '組み合わせ数が多いため、ペアワイズテストを推奨します。';
        } else if (factorCount >= 3) {
            return '組み合わせ数が非常に多いため、ペアワイズまたは3因子間網羅テストを強く推奨します。';
        } else {
            return '組み合わせ数が非常に多いため、ペアワイズテストを強く推奨します。';
        }
    }
}

// デバッグ用の情報出力
/**
 * テスト結果をクリアする関数
 */
function clearTestResults() {
    const testResults = document.getElementById('test-results');
    if (testResults) {
        testResults.textContent = 'テスト結果がここに表示されます...';
    }
}

/**
 * テストセクションの表示/非表示を制御
 */
function initializeTestSection() {
    const urlParams = new URLSearchParams(window.location.search);
    const showTests = urlParams.get('test') === 'true';
    
    const testSection = document.getElementById('test-section');
    if (testSection && showTests) {
        testSection.style.display = 'block';
        
        // コンソール出力をテスト結果エリアにも表示
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const testResults = document.getElementById('test-results');
        
        console.log = function(...args) {
            originalConsoleLog.apply(console, args);
            if (testResults) {
                testResults.textContent += args.join(' ') + '\n';
                testResults.scrollTop = testResults.scrollHeight;
            }
        };
        
        console.error = function(...args) {
            originalConsoleError.apply(console, args);
            if (testResults) {
                testResults.textContent += '❌ ' + args.join(' ') + '\n';
                testResults.scrollTop = testResults.scrollHeight;
            }
        };
    }
}

// テストセクションの初期化を追加
document.addEventListener('DOMContentLoaded', function() {
    console.log('テスト組み合わせ生成ツールが初期化されました');
    
    // Bootstrap tooltips の初期化
    initializeBootstrapComponents();
    
    // レスポンシブ対応の確認
    checkResponsiveLayout();
    
    // テストセクションの初期化
    initializeTestSection();
    
    // InputManager の初期化
    window.inputManager = new InputManager();
    inputManager = window.inputManager; // 後方互換性のため
    console.log('InputManager initialized:', !!window.inputManager);
    
    // 初期状態でボタン状態を更新（少し遅延させる）
    setTimeout(() => {
        console.log('=== 初期化時のボタン状態更新 ===');
        console.log('TestCombinationGenerator:', window.TestCombinationGenerator);
        console.log('window.inputManager:', !!window.inputManager);
        console.log('inputManager.factors:', window.inputManager?.factors?.length);
        updateGenerateButtonState();
    }, 100);
});

/**
 * InputManager クラス - 因子・水準入力フォームの管理
 */
class InputManager {
    constructor() {
        this.factors = [];
        this.factorCounter = 0;
        this.validationErrors = [];
    }
    
    /**
     * 新しい因子を追加
     * @param {string} name - 因子名
     * @param {Array<string>} levels - 水準配列
     * @returns {string} 追加された因子のID
     */
    addFactor(name = '', levels = []) {
        this.factorCounter++;
        const factorId = `factor_${this.factorCounter}`;
        
        const factor = new Factor(name || `因子${this.factorCounter}`, levels);
        factor.id = factorId; // IDを上書き
        
        this.factors.push(factor);
        this.renderFactorForm(factor);
        this.updateUI();
        
        return factorId;
    }
    
    /**
     * 因子を削除
     * @param {string} factorId - 削除する因子のID
     */
    removeFactor(factorId) {
        this.factors = this.factors.filter(factor => factor.id !== factorId);
        
        // DOM要素を削除
        const factorElement = document.getElementById(`factor-${factorId}`);
        if (factorElement) {
            factorElement.remove();
        }
        
        this.updateUI();
    }
    
    /**
     * 因子を更新
     * @param {string} factorId - 更新する因子のID
     * @param {string} name - 新しい因子名
     * @param {Array<string>} levels - 新しい水準配列
     */
    updateFactor(factorId, name, levels) {
        const factor = this.factors.find(f => f.id === factorId);
        if (factor) {
            factor.name = name;
            factor.levels = levels;
            this.validateInput();
            this.updateSummary();
        }
    }
    
    /**
     * 入力データのバリデーション
     * @returns {Object} バリデーション結果
     */
    validateInput() {
        this.validationErrors = [];
        const factorValidationResults = new Map();
        
        // 因子数チェック
        if (this.factors.length === 0) {
            this.validationErrors.push('最低1つの因子が必要です');
        }
        
        // 因子名重複チェック（詳細版）
        const factorNames = this.factors.map(f => f.name.trim().toLowerCase());
        const duplicateIndices = new Set();
        
        factorNames.forEach((name, index) => {
            if (name && factorNames.indexOf(name) !== index) {
                duplicateIndices.add(index);
                duplicateIndices.add(factorNames.indexOf(name));
            }
        });
        
        if (duplicateIndices.size > 0) {
            this.validationErrors.push('因子名に重複があります');
        }
        
        // 各因子のバリデーション
        this.factors.forEach((factor, index) => {
            const validation = factor.validate();
            const factorErrors = [];
            
            // 因子固有のエラー
            if (!validation.isValid) {
                factorErrors.push(...validation.errors);
            }
            
            // 重複チェック（個別因子レベル）
            if (duplicateIndices.has(index)) {
                factorErrors.push('因子名が他の因子と重複しています');
            }
            
            // 水準数の詳細チェック
            if (factor.levels.length === 0) {
                factorErrors.push('水準が入力されていません');
            } else if (factor.levels.length === 1) {
                factorErrors.push('最低2つの水準が必要です（現在: 1つ）');
            }
            
            // 水準の長さチェック
            const longLevels = factor.levels.filter(level => level.length > 50);
            if (longLevels.length > 0) {
                factorErrors.push('水準名が長すぎます（50文字以下にしてください）');
            }
            
            // 因子名の長さチェック
            if (factor.name.length > 30) {
                factorErrors.push('因子名が長すぎます（30文字以下にしてください）');
            }
            
            // 水準数の上限チェック
            if (factor.levels.length > 20) {
                factorErrors.push(`水準数が多すぎます（20個以下にしてください、現在: ${factor.levels.length}個）`);
            }
            
            factorValidationResults.set(factor.id, {
                isValid: factorErrors.length === 0,
                errors: factorErrors
            });
            
            // グローバルエラーリストに追加
            if (factorErrors.length > 0) {
                factorErrors.forEach(error => {
                    this.validationErrors.push(`因子${index + 1} (${factor.name || '名前なし'}): ${error}`);
                });
            }
        });
        
        // 個別因子のバリデーション結果を表示
        this.displayIndividualFactorValidation(factorValidationResults);
        
        // 全体のバリデーションエラーを表示
        this.displayValidationErrors();
        
        return {
            isValid: this.validationErrors.length === 0,
            errors: this.validationErrors,
            factorValidation: factorValidationResults
        };
    }
    
    /**
     * 個別因子のバリデーション結果を表示
     * @param {Map} factorValidationResults - 因子ごとのバリデーション結果
     */
    displayIndividualFactorValidation(factorValidationResults) {
        for (const [factorId, validation] of factorValidationResults) {
            const validationDiv = document.getElementById(`factor-validation-${factorId}`);
            const factorDiv = document.getElementById(`factor-${factorId}`);
            
            if (!validationDiv || !factorDiv) continue;
            
            if (validation.isValid) {
                // バリデーション成功
                validationDiv.style.display = 'none';
                factorDiv.classList.remove('border-danger');
                factorDiv.classList.add('border-success');
                
                // 入力フィールドのスタイルを更新
                const nameInput = document.getElementById(`name-${factorId}`);
                const levelsInput = document.getElementById(`levels-${factorId}`);
                
                if (nameInput) {
                    nameInput.classList.remove('is-invalid');
                    nameInput.classList.add('is-valid');
                }
                if (levelsInput) {
                    levelsInput.classList.remove('is-invalid');
                    levelsInput.classList.add('is-valid');
                }
            } else {
                // バリデーションエラー
                factorDiv.classList.remove('border-success');
                factorDiv.classList.add('border-danger');
                
                const errorsList = validation.errors
                    .map(error => `<li class="small">${error}</li>`)
                    .join('');
                
                validationDiv.innerHTML = `
                    <div class="alert alert-danger alert-sm py-2">
                        <ul class="mb-0 small">
                            ${errorsList}
                        </ul>
                    </div>
                `;
                validationDiv.style.display = 'block';
                
                // 入力フィールドのスタイルを更新
                const nameInput = document.getElementById(`name-${factorId}`);
                const levelsInput = document.getElementById(`levels-${factorId}`);
                
                if (nameInput) {
                    nameInput.classList.remove('is-valid');
                    nameInput.classList.add('is-invalid');
                }
                if (levelsInput) {
                    levelsInput.classList.remove('is-valid');
                    levelsInput.classList.add('is-invalid');
                }
            }
        }
    }
    
    /**
     * 単一因子のバリデーション
     * @param {string} factorId - 因子ID
     */
    validateSingleFactor(factorId) {
        const factor = this.factors.find(f => f.id === factorId);
        if (!factor) return;
        
        const validation = factor.validate();
        const factorValidationResults = new Map();
        factorValidationResults.set(factorId, validation);
        
        this.displayIndividualFactorValidation(factorValidationResults);
    }
    
    /**
     * 因子データを取得
     * @returns {Array<Factor>} 因子配列
     */
    getFactorsData() {
        return this.factors.map(factor => factor.clone());
    }
    
    /**
     * 全ての因子をクリア
     */
    clearAll() {
        this.factors = [];
        this.factorCounter = 0;
        this.validationErrors = [];
        
        const container = document.getElementById('factors-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // バリデーションエラー表示もクリア
        const errorsDiv = document.getElementById('validation-errors');
        if (errorsDiv) {
            errorsDiv.style.display = 'none';
        }
        
        this.updateUI();
    }
    
    /**
     * 入力データの完全性チェック
     * @returns {Object} 完全性チェック結果
     */
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
        
        // 警告とレコメンデーション
        if (result.factorCount < 2) {
            result.recommendations.push('ペアワイズテストには最低2つの因子が必要です');
        }
        
        if (result.totalCombinations > 100000) {
            result.warnings.push('組み合わせ数が非常に大きくなります。処理に時間がかかる可能性があります');
        }
        
        if (result.totalCombinations > 1000000) {
            result.warnings.push('組み合わせ数が100万を超えています。ブラウザがフリーズする可能性があります');
        }
        
        const factorsWithManyLevels = validFactors.filter(f => f.getLevelCount() > 10);
        if (factorsWithManyLevels.length > 0) {
            result.warnings.push(`水準数が多い因子があります: ${factorsWithManyLevels.map(f => f.name).join(', ')}`);
        }
        
        return result;
    }
    
    /**
     * バリデーション状態のリセット
     */
    resetValidationState() {
        this.validationErrors = [];
        
        // 全ての因子の視覚的バリデーション状態をリセット
        this.factors.forEach(factor => {
            const factorDiv = document.getElementById(`factor-${factor.id}`);
            const validationDiv = document.getElementById(`factor-validation-${factor.id}`);
            const nameInput = document.getElementById(`name-${factor.id}`);
            const levelsInput = document.getElementById(`levels-${factor.id}`);
            
            if (factorDiv) {
                factorDiv.classList.remove('border-success', 'border-danger');
            }
            if (validationDiv) {
                validationDiv.style.display = 'none';
            }
            if (nameInput) {
                nameInput.classList.remove('is-valid', 'is-invalid');
            }
            if (levelsInput) {
                levelsInput.classList.remove('is-valid', 'is-invalid');
            }
        });
        
        const errorsDiv = document.getElementById('validation-errors');
        if (errorsDiv) {
            errorsDiv.style.display = 'none';
        }
    }
    
    /**
     * 因子フォームをレンダリング
     * @param {Factor} factor - レンダリングする因子
     */
    renderFactorForm(factor) {
        const container = document.getElementById('factors-container');
        if (!container) return;
        
        const factorDiv = document.createElement('div');
        factorDiv.id = `factor-${factor.id}`;
        factorDiv.className = 'factor-form mb-3 p-3 border rounded';
        
        factorDiv.innerHTML = `
            <div class="row align-items-start">
                <div class="col-md-4">
                    <label for="name-${factor.id}" class="form-label">因子名</label>
                    <input type="text" class="form-control" id="name-${factor.id}" 
                           value="${factor.name}" placeholder="因子名を入力"
                           oninput="inputManager.handleFactorNameChange('${factor.id}', this.value)">
                </div>
                <div class="col-md-7">
                    <label for="levels-${factor.id}" class="form-label">
                        水準 <small class="text-muted">(カンマ区切りで入力)</small>
                    </label>
                    <input type="text" class="form-control" id="levels-${factor.id}" 
                           value="${factor.levels.join(', ')}" 
                           placeholder="水準1, 水準2, 水準3..."
                           oninput="inputManager.handleLevelsChange('${factor.id}', this.value)">
                    <div class="form-text">
                        各因子には最低2つの水準が必要です
                    </div>
                </div>
                <div class="col-md-1">
                    <label class="form-label">&nbsp;</label>
                    <div class="d-grid">
                        <button type="button" class="btn btn-outline-danger btn-sm" 
                                onclick="inputManager.removeFactor('${factor.id}')"
                                title="この因子を削除">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div id="factor-validation-${factor.id}" class="mt-2" style="display: none;">
                <!-- 因子別バリデーションエラー -->
            </div>
        `;
        
        container.appendChild(factorDiv);
    }
    
    /**
     * 因子名変更ハンドラ
     * @param {string} factorId - 因子ID
     * @param {string} name - 新しい因子名
     */
    handleFactorNameChange(factorId, name) {
        const factor = this.factors.find(f => f.id === factorId);
        if (factor) {
            factor.name = name.trim();
            
            // リアルタイムバリデーション
            this.validateSingleFactor(factorId);
            
            // 全体バリデーション（重複チェックのため）
            setTimeout(() => {
                this.validateInput();
                this.updateUI(); // グローバル状態を更新
            }, 100);
        }
    }
    
    /**
     * 水準変更ハンドラ
     * @param {string} factorId - 因子ID
     * @param {string} levelsString - カンマ区切りの水準文字列
     */
    handleLevelsChange(factorId, levelsString) {
        const factor = this.factors.find(f => f.id === factorId);
        if (factor) {
            // カンマ区切りで分割し、空白をトリム
            const levels = levelsString
                .split(/[,、]/)
                .map(level => level.trim())
                .filter(level => level.length > 0);
            
            factor.levels = levels;
            
            // リアルタイムバリデーション
            this.validateSingleFactor(factorId);
            
            // 全体バリデーションとサマリー更新
            setTimeout(() => {
                this.validateInput();
                this.updateUI(); // グローバル状態を更新
            }, 100);
        }
    }
    
    /**
     * UIの更新
     */
    updateUI() {
        console.log('InputManager.updateUI called, factors count:', this.factors.length);
        
        const noFactorsMessage = document.getElementById('no-factors-message');
        const clearBtn = document.getElementById('clear-factors-btn');
        
        if (this.factors.length === 0) {
            if (noFactorsMessage) noFactorsMessage.style.display = 'block';
            if (clearBtn) clearBtn.style.display = 'none';
        } else {
            if (noFactorsMessage) noFactorsMessage.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'block';
        }
        
        // グローバル状態を同期
        console.log('updateUI: Syncing factors, this.factors.length:', this.factors.length);
        if (window.TestCombinationGenerator) {
            window.TestCombinationGenerator.factors = [...this.factors];
            console.log('Global factors updated:', window.TestCombinationGenerator.factors.length);
        } else {
            console.error('window.TestCombinationGenerator not found');
        }
        
        this.updateSummary();
        
        // ボタン状態を更新
        if (typeof updateGenerateButtonState === 'function') {
            console.log('Calling updateGenerateButtonState from updateUI');
            updateGenerateButtonState();
        } else {
            console.error('updateGenerateButtonState function not found');
        }
        
        // 生成予測を更新
        if (typeof updateGenerationEstimate === 'function') {
            updateGenerationEstimate();
        }
    }
    
    /**
     * サマリーの更新
     */
    updateSummary() {
        const summaryDiv = document.getElementById('factors-summary');
        const summaryContent = document.getElementById('summary-content');
        
        if (!summaryDiv || !summaryContent) return;
        
        if (this.factors.length === 0) {
            summaryDiv.style.display = 'none';
            return;
        }
        
        const validFactors = this.factors.filter(f => f.validate().isValid);
        const totalCombinations = validFactors.length > 0 ? 
            validFactors.reduce((total, factor) => total * factor.getLevelCount(), 1) : 0;
        
        summaryContent.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <strong>因子数:</strong> ${this.factors.length}<br>
                    <strong>有効な因子:</strong> ${validFactors.length}
                </div>
                <div class="col-md-6">
                    <strong>全組み合わせ数:</strong> ${totalCombinations.toLocaleString()}
                    ${totalCombinations > 10000 ? '<span class="text-warning">⚠️ 大規模</span>' : ''}
                </div>
            </div>
        `;
        
        summaryDiv.style.display = 'block';
    }
    
    /**
     * CSVファイルのアップロード処理
     * @param {File} file - アップロードされたCSVファイル
     */
    handleCSVUpload(file) {
        // ファイル形式チェック
        if (!this.validateCSVFile(file)) {
            return;
        }
        
        // 処理状況表示
        this.showCSVProcessingStatus('ファイルを読み込み中...', 'info');
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csvText = e.target.result;
                
                // ファイルサイズチェック
                if (csvText.length > 10 * 1024 * 1024) { // 10MB制限
                    errorHandler.handleError({
                        type: ErrorTypes.FILE_PROCESSING,
                        severity: ErrorSeverity.HIGH,
                        message: 'CSVファイルが大きすぎます',
                        details: `ファイルサイズ: ${Math.round(csvText.length / 1024 / 1024)}MB`,
                        context: { 
                            filename: file.name,
                            fileSize: csvText.length,
                            maxSize: 10 * 1024 * 1024
                        }
                    });
                    this.showCSVProcessingStatus(
                        'CSVファイルが大きすぎます（10MB以下にしてください）',
                        'error'
                    );
                    return;
                }
                
                // 空ファイルチェック
                if (!csvText || csvText.trim().length === 0) {
                    errorHandler.handleError({
                        type: ErrorTypes.FILE_PROCESSING,
                        severity: ErrorSeverity.MEDIUM,
                        message: 'CSVファイルが空です',
                        context: { 
                            filename: file.name,
                            fileSize: csvText.length
                        }
                    });
                    this.showCSVProcessingStatus(
                        'CSVファイルが空です。データを含むファイルを選択してください',
                        'error'
                    );
                    return;
                }
                
                const parsedData = this.parseCSV(csvText);
                
                if (parsedData.success) {
                    this.loadFactorsFromCSV(parsedData.factors);
                    this.showCSVProcessingStatus(
                        `CSVファイルから ${parsedData.factors.length} 個の因子を読み込みました`, 
                        'success'
                    );
                    
                    // 成功ログ
                    console.log('CSV読み込み成功:', {
                        filename: file.name,
                        factorCount: parsedData.factors.length,
                        fileSize: csvText.length
                    });
                } else {
                    errorHandler.handleError({
                        type: ErrorTypes.FILE_PROCESSING,
                        severity: ErrorSeverity.MEDIUM,
                        message: 'CSVファイルの解析に失敗しました',
                        details: parsedData.error,
                        context: { 
                            filename: file.name,
                            fileSize: csvText.length,
                            error: parsedData.error
                        }
                    });
                    
                    this.showCSVProcessingStatus(
                        `CSVファイルの解析に失敗しました: ${parsedData.error}`, 
                        'error'
                    );
                }
            } catch (error) {
                errorHandler.handleError({
                    type: ErrorTypes.FILE_PROCESSING,
                    severity: ErrorSeverity.HIGH,
                    message: 'CSVファイルの処理中に予期しないエラーが発生しました',
                    details: error.message,
                    stack: error.stack,
                    context: { 
                        filename: file.name,
                        fileSize: file.size
                    }
                });
                
                this.showCSVProcessingStatus(
                    `ファイル処理中にエラーが発生しました: ${error.message}`, 
                    'error'
                );
            }
        };
        
        reader.onerror = (error) => {
            errorHandler.handleError({
                type: ErrorTypes.FILE_PROCESSING,
                severity: ErrorSeverity.HIGH,
                message: 'ファイルの読み込みに失敗しました',
                details: 'FileReader API エラー',
                context: { 
                    filename: file.name,
                    fileSize: file.size,
                    error: error
                }
            });
            
            this.showCSVProcessingStatus(
                'ファイルの読み込みに失敗しました。ファイルが破損している可能性があります', 
                'error'
            );
        };
        
        // UTF-8として読み込み
        reader.readAsText(file, 'UTF-8');
    }
    
    /**
     * CSVファイルのバリデーション
     * @param {File} file - バリデーションするファイル
     * @returns {boolean} バリデーション結果
     */
    validateCSVFile(file) {
        const errors = [];
        
        // ファイル形式チェック
        if (!file.type.includes('csv') && !file.name.toLowerCase().endsWith('.csv')) {
            errors.push('CSVファイルを選択してください');
        }
        
        // ファイルサイズチェック（10MB制限）
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push('ファイルサイズが大きすぎます（10MB以下にしてください）');
        }
        
        // 空ファイルチェック
        if (file.size === 0) {
            errors.push('空のファイルです');
        }
        
        if (errors.length > 0) {
            this.showCSVProcessingStatus(
                `ファイルエラー: ${errors.join(', ')}`, 
                'error'
            );
            return false;
        }
        
        return true;
    }
    
    /**
     * CSV文字列の解析
     * @param {string} csvText - CSV文字列
     * @returns {Object} 解析結果
     */
    parseCSV(csvText) {
        try {
            if (!csvText || csvText.trim() === '') {
                return {
                    success: false,
                    error: 'ファイルが空です'
                };
            }
            
            // 文字エンコーディングチェック（簡易）
            if (csvText.includes('�')) {
                errorHandler.handleError({
                    type: ErrorTypes.FILE_PROCESSING,
                    severity: ErrorSeverity.MEDIUM,
                    message: 'CSVファイルの文字エンコーディングに問題があります',
                    details: '文字化けが検出されました',
                    context: { 
                        encoding: 'unknown',
                        hasGarbledChars: true
                    }
                });
                return {
                    success: false,
                    error: 'ファイルの文字エンコーディングに問題があります。UTF-8で保存してください'
                };
            }
            
            // 行に分割（改行コードの違いに対応）
            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
            
            if (lines.length < 2) {
                return {
                    success: false,
                    error: '最低2行（ヘッダー行と1行以上のデータ行）が必要です'
                };
            }
            
            // 行数制限チェック
            if (lines.length > 10000) {
                errorHandler.handleError({
                    type: ErrorTypes.FILE_PROCESSING,
                    severity: ErrorSeverity.HIGH,
                    message: 'CSVファイルの行数が多すぎます',
                    details: `行数: ${lines.length}`,
                    context: { 
                        lineCount: lines.length,
                        maxLines: 10000
                    }
                });
                return {
                    success: false,
                    error: `CSVファイルの行数が多すぎます（${lines.length}行）。10,000行以下にしてください`
                };
            }
            
            // ヘッダー行（因子名）を解析
            const headerLine = lines[0];
            let factorNames;
            try {
                factorNames = this.parseCSVLine(headerLine);
            } catch (parseError) {
                return {
                    success: false,
                    error: `ヘッダー行の解析に失敗しました: ${parseError.message}`
                };
            }
            
            if (factorNames.length === 0) {
                return {
                    success: false,
                    error: 'ヘッダー行に因子名が見つかりません'
                };
            }
            
            // 因子数制限チェック
            if (factorNames.length > 50) {
                errorHandler.handleError({
                    type: ErrorTypes.FILE_PROCESSING,
                    severity: ErrorSeverity.HIGH,
                    message: 'CSVファイルの因子数が多すぎます',
                    details: `因子数: ${factorNames.length}`,
                    context: { 
                        factorCount: factorNames.length,
                        maxFactors: 50
                    }
                });
                return {
                    success: false,
                    error: `因子数が多すぎます（${factorNames.length}個）。50個以下にしてください`
                };
            }
            
            // 因子名の妥当性チェック
            const invalidFactorNames = factorNames.filter(name => 
                !name || name.trim() === '' || name.length > 100
            );
            if (invalidFactorNames.length > 0) {
                return {
                    success: false,
                    error: '無効な因子名があります。因子名は1文字以上100文字以下で入力してください'
                };
            }
            
            // 因子名の重複チェック
            const uniqueNames = new Set(factorNames.map(name => name.trim().toLowerCase()));
            if (uniqueNames.size !== factorNames.length) {
                return {
                    success: false,
                    error: '因子名に重複があります'
                };
            }
            
            // データ行から水準を抽出
            const factorsData = factorNames.map(name => ({
                name: name.trim(),
                levels: new Set()
            }));
            
            const parseErrors = [];
            
            // 各データ行を処理
            for (let i = 1; i < lines.length; i++) {
                const dataLine = lines[i];
                let values;
                
                try {
                    values = this.parseCSVLine(dataLine);
                } catch (parseError) {
                    parseErrors.push(`${i + 1}行目: ${parseError.message}`);
                    continue;
                }
                
                // 列数チェック
                if (values.length !== factorNames.length) {
                    parseErrors.push(`${i + 1}行目の列数が正しくありません（期待値: ${factorNames.length}, 実際: ${values.length}）`);
                    // 不足分は空文字で補完、余分は無視
                    while (values.length < factorNames.length) {
                        values.push('');
                    }
                    values = values.slice(0, factorNames.length);
                }
                
                // 各列の値を対応する因子の水準として追加
                values.forEach((value, index) => {
                    if (index < factorsData.length && value.trim() !== '') {
                        const trimmedValue = value.trim();
                        
                        // 水準値の長さチェック
                        if (trimmedValue.length > 200) {
                            parseErrors.push(`${i + 1}行目の因子 "${factorNames[index]}" の水準が長すぎます（200文字以下にしてください）`);
                            return;
                        }
                        
                        factorsData[index].levels.add(trimmedValue);
                    }
                });
            }
            
            // 解析エラーがある場合の警告
            if (parseErrors.length > 0) {
                const errorSummary = parseErrors.length > 5 ? 
                    parseErrors.slice(0, 5).join('; ') + `... (他${parseErrors.length - 5}件)` :
                    parseErrors.join('; ');
                
                errorHandler.handleError({
                    type: ErrorTypes.FILE_PROCESSING,
                    severity: ErrorSeverity.MEDIUM,
                    message: 'CSVファイルの一部行で解析エラーが発生しました',
                    details: errorSummary,
                    context: { 
                        errorCount: parseErrors.length,
                        totalLines: lines.length,
                        errors: parseErrors
                    }
                });
                
                // エラーが多すぎる場合は処理を中断
                if (parseErrors.length > lines.length * 0.5) {
                    return {
                        success: false,
                        error: `データ行の解析エラーが多すぎます（${parseErrors.length}件）: ${errorSummary}`
                    };
                }
            }
            
            // 水準をArrayに変換し、因子オブジェクトを作成
            const factors = [];
            const invalidFactors = [];
            
            factorsData.forEach(factorData => {
                const levels = Array.from(factorData.levels).sort();
                
                if (levels.length < 2) {
                    invalidFactors.push(`${factorData.name}（${levels.length}水準）`);
                } else if (levels.length > 100) {
                    // 水準数制限チェック
                    errorHandler.handleError({
                        type: ErrorTypes.FILE_PROCESSING,
                        severity: ErrorSeverity.MEDIUM,
                        message: '因子の水準数が多すぎます',
                        details: `因子 "${factorData.name}": ${levels.length}水準`,
                        context: { 
                            factorName: factorData.name,
                            levelCount: levels.length,
                            maxLevels: 100
                        }
                    });
                    invalidFactors.push(`${factorData.name}（${levels.length}水準、上限100水準）`);
                } else {
                    factors.push(new Factor(factorData.name, levels));
                }
            });
            
            if (factors.length === 0) {
                let errorMessage = '有効な因子が見つかりません（各因子には最低2つの異なる水準が必要です）';
                if (invalidFactors.length > 0) {
                    errorMessage += `\n無効な因子: ${invalidFactors.join(', ')}`;
                }
                return {
                    success: false,
                    error: errorMessage
                };
            }
            
            // 警告メッセージの生成
            let warnings = [];
            if (parseErrors.length > 0) {
                warnings.push(`${parseErrors.length}行でエラーが発生しました`);
            }
            if (invalidFactors.length > 0) {
                warnings.push(`${invalidFactors.length}個の因子が無効でした`);
            }
            
            return {
                success: true,
                factors: factors,
                originalFactorCount: factorNames.length,
                validFactorCount: factors.length,
                warnings: warnings.length > 0 ? warnings : undefined
            };
            
        } catch (error) {
            errorHandler.handleError({
                type: ErrorTypes.FILE_PROCESSING,
                severity: ErrorSeverity.HIGH,
                message: 'CSV解析中に予期しないエラーが発生しました',
                details: error.message,
                stack: error.stack,
                context: { 
                    csvLength: csvText?.length || 0
                }
            });
            
            return {
                success: false,
                error: `CSV解析エラー: ${error.message}`
            };
        }
    }
    
    /**
     * CSV行の解析（カンマ区切り、ダブルクォート対応）
     * @param {string} line - CSV行
     * @returns {Array<string>} 解析された値の配列
     */
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
                    // エスケープされたダブルクォート
                    current += '"';
                    i += 2;
                } else {
                    // クォートの開始/終了
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                // フィールドの区切り
                result.push(current);
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        
        // 最後のフィールドを追加
        result.push(current);
        
        return result;
    }
    
    /**
     * CSVから読み込んだ因子データを設定
     * @param {Array<Object>} factorsData - 因子データ配列
     */
    loadFactorsFromCSV(factorsData) {
        // 既存の因子をクリア
        this.clearAll();
        
        // 新しい因子を追加
        factorsData.forEach(factorData => {
            this.addFactor(factorData.name, factorData.levels);
        });
        
        // バリデーションを実行
        this.validateInput();
        
        // ファイル入力をクリア
        const fileInput = document.getElementById('csv-file-input');
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    /**
     * CSV処理状況の表示
     * @param {string} message - 表示メッセージ
     * @param {string} type - メッセージタイプ（info, success, error）
     */
    showCSVProcessingStatus(message, type = 'info') {
        const statusDiv = document.getElementById('csv-processing-status');
        if (!statusDiv) return;
        
        let alertClass = 'alert-info';
        let icon = 'bi-info-circle';
        
        switch (type) {
            case 'success':
                alertClass = 'alert-success';
                icon = 'bi-check-circle';
                break;
            case 'error':
                alertClass = 'alert-danger';
                icon = 'bi-exclamation-triangle';
                break;
            case 'warning':
                alertClass = 'alert-warning';
                icon = 'bi-exclamation-triangle';
                break;
        }
        
        statusDiv.innerHTML = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                <i class="bi ${icon} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        statusDiv.style.display = 'block';
        
        // 成功メッセージは3秒後に自動で消す
        if (type === 'success') {
            setTimeout(() => {
                const alert = statusDiv.querySelector('.alert');
                if (alert) {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 3000);
        }
    }

    /**
     * バリデーションエラーの表示
     */
    displayValidationErrors() {
        const errorsDiv = document.getElementById('validation-errors');
        if (!errorsDiv) return;
        
        if (this.validationErrors.length === 0) {
            errorsDiv.style.display = 'none';
            this.showSuccessMessage();
            return;
        }
        
        // エラーを種類別に分類
        const globalErrors = this.validationErrors.filter(error => 
            !error.includes('因子') || error.includes('因子名に重複があります') || error.includes('最低1つの因子が必要です')
        );
        const factorErrors = this.validationErrors.filter(error => 
            error.includes('因子') && !globalErrors.includes(error)
        );
        
        let errorContent = '';
        
        if (globalErrors.length > 0) {
            errorContent += `
                <div class="alert alert-danger">
                    <h6 class="alert-heading mb-2">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        全体的なエラー
                    </h6>
                    <ul class="mb-0">
                        ${globalErrors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        if (factorErrors.length > 0) {
            errorContent += `
                <div class="alert alert-warning">
                    <h6 class="alert-heading mb-2">
                        <i class="bi bi-info-circle me-1"></i>
                        因子別エラー
                    </h6>
                    <ul class="mb-0 small">
                        ${factorErrors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        
        errorsDiv.innerHTML = errorContent;
        errorsDiv.style.display = 'block';
    }
    
    /**
     * 成功メッセージの表示
     */
    showSuccessMessage() {
        const errorsDiv = document.getElementById('validation-errors');
        if (!errorsDiv) return;
        
        if (this.factors.length > 0 && this.validationErrors.length === 0) {
            const validFactors = this.factors.filter(f => f.validate().isValid);
            if (validFactors.length >= 2) {
                errorsDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h6 class="alert-heading mb-2">
                            <i class="bi bi-check-circle me-1"></i>
                            入力完了
                        </h6>
                        <p class="mb-0">
                            全ての因子が正しく入力されました。アルゴリズムを選択してテスト組み合わせを生成できます。
                        </p>
                    </div>
                `;
                errorsDiv.style.display = 'block';
                
                // 3秒後に成功メッセージを非表示
                setTimeout(() => {
                    if (errorsDiv && this.validationErrors.length === 0) {
                        errorsDiv.style.display = 'none';
                    }
                }, 3000);
            }
        };
        
        if (globalErrors.length > 0) {
            const globalErrorsList = globalErrors
                .map(error => `<li>${error}</li>`)
                .join('');
            
            errorContent += `
                <div class="alert alert-danger mb-2">
                    <h6 class="alert-heading mb-2">
                        <i class="bi bi-exclamation-triangle me-1"></i>
                        全体的な入力エラー
                    </h6>
                    <ul class="mb-0">
                        ${globalErrorsList}
                    </ul>
                </div>
            `;
        }
        
        if (factorErrors.length > 0) {
            const factorErrorsList = factorErrors
                .map(error => `<li>${error}</li>`)
                .join('');
            
            errorContent += `
                <div class="alert alert-warning mb-2">
                    <h6 class="alert-heading mb-2">
                        <i class="bi bi-info-circle me-1"></i>
                        因子別エラー
                    </h6>
                    <ul class="mb-0">
                        ${factorErrorsList}
                    </ul>
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="bi bi-lightbulb me-1"></i>
                            各因子の入力欄で詳細なエラー情報を確認できます
                        </small>
                    </div>
                </div>
            `;
        }
        
        errorsDiv.innerHTML = errorContent;
        errorsDiv.style.display = 'block';
    }
    
    /**
     * 成功メッセージの表示
     */
    showSuccessMessage() {
        if (this.factors.length > 0) {
            const validFactors = this.factors.filter(f => f.validate().isValid);
            if (validFactors.length === this.factors.length) {
                // 全ての因子が有効な場合のみ成功メッセージを表示
                const errorsDiv = document.getElementById('validation-errors');
                if (errorsDiv) {
                    errorsDiv.innerHTML = `
                        <div class="alert alert-success">
                            <h6 class="alert-heading mb-2">
                                <i class="bi bi-check-circle me-1"></i>
                                入力完了
                            </h6>
                            <p class="mb-0">
                                全ての因子が正しく入力されました。アルゴリズムを選択してテスト組み合わせを生成できます。
                            </p>
                        </div>
                    `;
                    errorsDiv.style.display = 'block';
                    
                    // 3秒後に成功メッセージを非表示
                    setTimeout(() => {
                        if (errorsDiv && this.validationErrors.length === 0) {
                            errorsDiv.style.display = 'none';
                        }
                    }, 3000);
                }
            }
        }
    }
    
    /**
     * 特定の因子のバリデーションを実行
     * @param {string} factorId - 因子ID
     */
    validateSingleFactor(factorId) {
        const factor = this.factors.find(f => f.id === factorId);
        if (!factor) return;
        
        const validation = factor.validate();
        const factorValidationResults = new Map();
        
        // 重複チェック
        const factorNames = this.factors.map(f => f.name.trim().toLowerCase());
        const currentIndex = this.factors.findIndex(f => f.id === factorId);
        const isDuplicate = factorNames.indexOf(factor.name.trim().toLowerCase()) !== currentIndex;
        
        const factorErrors = [];
        if (!validation.isValid) {
            factorErrors.push(...validation.errors);
        }
        if (isDuplicate) {
            factorErrors.push('因子名が他の因子と重複しています');
        }
        
        factorValidationResults.set(factorId, {
            isValid: factorErrors.length === 0,
            errors: factorErrors
        });
        
        this.displayIndividualFactorValidation(factorValidationResults);
    }
}



/**
 * CSVアップロード機能のテスト
 */
function testCSVUploadFunctionality() {
    console.log('=== CSVアップロード機能テスト開始 ===');
    
    if (!inputManager) {
        inputManager = new InputManager();
    }
    
    // テスト用CSVデータ
    const testCSVContent = `ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,iOS,モバイル
Edge,Android,デスクトップ
Chrome,Linux,タブレット`;
    
    try {
        // CSV解析テスト
        console.log('1. CSV解析テスト');
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
        
        // ファイルバリデーションテスト
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
        
        // CSV行解析テスト
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
        
        console.log('\n✅ CSVアップロード機能テスト完了');
        
    } catch (error) {
        console.error('❌ CSVアップロード機能テストでエラー:', error);
    }
}

// デバッグ用の情報出力
console.log('Test Combination Generator v1.0.0 - Ready');
console.log('対応ブラウザ: Chrome, Firefox, Safari, Edge');
console.log('レスポンシブ対応: モバイル、タブレット、デスクトップ');
console.log('データモデル: Factor, TestCase クラスが実装されました');
console.log('UI機能: InputManager クラスが実装されました');
console.log('CSV機能: CSVアップロード、解析、エラーハンドリングが実装されました');
/*
*
 * カバレッジ表示テスト関数（HTMLから呼び出される）
 */
function testCoverageDisplay() {
    if (!resultsTableManager) {
        resultsTableManager = new ResultsTableManager();
    }
    
    // より複雑なサンプルデータを作成
    const testFactors = [
        new Factor('ブラウザ', ['Chrome', 'Firefox', 'Safari', 'Edge']),
        new Factor('OS', ['Windows', 'Mac', 'Linux']),
        new Factor('画面サイズ', ['デスクトップ', 'タブレット', 'モバイル']),
        new Factor('言語', ['日本語', '英語', '中国語'])
    ];
    
    // ペアワイズテストケースを生成（実際のアルゴリズムを使用）
    const pairwiseGenerator = new PairwiseGenerator();
    const testCases = pairwiseGenerator.generate(testFactors);
    
    // 結果を表示
    resultsTableManager.displayResults(testCases, testFactors, { algorithmType: 'pairwise' });
    
    console.log('カバレッジ表示テストが実行されました');
}

/**
 * ペアワイズテストケース生成のグローバル関数
 * @param {Array} factors - 因子配列
 * @returns {Array} テストケース配列
 */
function generatePairwiseTestCases(factors) {
    const generator = new PairwiseGenerator();
    return generator.generate(factors);
}

/**
 * 3因子間網羅テストケース生成のグローバル関数
 * @param {Array} factors - 因子配列
 * @returns {Array} テストケース配列
 */
function generateThreeWayTestCases(factors) {
    const generator = new ThreeWayGenerator();
    return generator.generate(factors);
}

/**
 * 全組み合わせテストケース生成のグローバル関数
 * @param {Array} factors - 因子配列
 * @returns {Array} テストケース配列
 */
function generateAllCombinations(factors) {
    const generator = new AllCombinationsGenerator();
    return generator.generate(factors, true);
}

/**
 * テスト組み合わせ生成のメイン関数
 */
async function generateTestCombinations() {
    const factors = window.TestCombinationGenerator.factors || [];
    const algorithm = window.TestCombinationGenerator.currentAlgorithm;
    
    if (!algorithm || factors.length === 0) {
        showErrorMessage('因子とアルゴリズムを選択してください', ErrorTypes.USER_INPUT, ErrorSeverity.MEDIUM);
        return;
    }
    
    try {
        // 生成ボタンを無効化
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.disabled = true;
        generateBtn.classList.add('generating');
        
        // スクリーンリーダーに通知
        announceToScreenReader('テスト組み合わせの生成を開始しました');
        
        let testCases;
        const algorithmNames = {
            'pairwise': 'ペアワイズテスト',
            'threeway': '3因子間網羅',
            'allcombinations': '全組み合わせ'
        };
        
        // アルゴリズムに応じて生成実行
        console.log('=== generateTestCombinations デバッグ ===');
        console.log('algorithm:', algorithm);
        console.log('factors:', factors);
        console.log('PairwiseGenerator type:', typeof PairwiseGenerator);
        
        switch (algorithm) {
            case 'pairwise':
                console.log('ペアワイズケースに入りました');
                if (typeof PairwiseGenerator === 'function') {
                    console.log('PairwiseGeneratorが利用可能です');
                    const generator = new PairwiseGenerator();
                    console.log('PairwiseGeneratorインスタンス作成完了');
                    testCases = await executeAlgorithmSafely(
                        () => generator.generate(factors), 
                        factors, 
                        algorithmNames[algorithm],
                        { async: true, showProgress: false }
                    );
                    console.log('executeAlgorithmSafely完了:', testCases?.length);
                } else {
                    console.log('PairwiseGeneratorが利用できません');
                    throw new Error('ペアワイズアルゴリズムが利用できません');
                }
                break;
                
            case 'threeway':
                if (typeof ThreeWayGenerator === 'function') {
                    const generator = new ThreeWayGenerator();
                    testCases = await executeAlgorithmSafely(
                        () => generator.generate(factors), 
                        factors, 
                        algorithmNames[algorithm],
                        { async: true, showProgress: true }
                    );
                } else {
                    throw new Error('3因子間網羅アルゴリズムが利用できません');
                }
                break;
                
            case 'allcombinations':
                if (typeof AllCombinationsGenerator === 'function') {
                    // 大量の組み合わせの警告
                    const totalCombinations = factors.reduce((total, factor) => {
                        return total * (factor.levels ? factor.levels.length : 2);
                    }, 1);
                    
                    if (totalCombinations > 10000) {
                        const confirmed = confirm(
                            `${totalCombinations.toLocaleString()}個のテストケースが生成されます。\n` +
                            '処理に時間がかかる可能性がありますが、続行しますか？'
                        );
                        if (!confirmed) {
                            throw new Error('ユーザーによってキャンセルされました');
                        }
                    }
                    
                    const generator = new AllCombinationsGenerator();
                    testCases = await executeAlgorithmSafely(
                        () => generator.generate(factors, true), 
                        factors, 
                        algorithmNames[algorithm],
                        { async: true, showProgress: true }
                    );
                } else {
                    throw new Error('全組み合わせアルゴリズムが利用できません');
                }
                break;
                
            default:
                throw new Error(`未知のアルゴリズム: ${algorithm}`);
        }
        
        // 結果をアプリケーション状態に保存
        window.TestCombinationGenerator.testCases = testCases;
        window.TestCombinationGenerator.lastAlgorithm = algorithm;
        window.TestCombinationGenerator.lastGenerationTime = new Date();
        
        // 結果を表示
        displayTestResults(testCases, algorithm, factors);
        
        // 成功メッセージ
        const message = `${algorithmNames[algorithm]}で${testCases.length}個のテストケースを生成しました`;
        showSuccessMessage(message);
        announceToScreenReader(message);
        
        console.log('テスト組み合わせ生成完了:', {
            algorithm: algorithm,
            factorCount: factors.length,
            testCaseCount: testCases.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('テスト組み合わせ生成エラー:', error);
        
        if (error.message.includes('キャンセル')) {
            showToast('生成がキャンセルされました', 'info');
        } else {
            showErrorMessage(
                'テスト組み合わせの生成でエラーが発生しました', 
                ErrorTypes.ALGORITHM, 
                ErrorSeverity.HIGH,
                { algorithm: algorithm, error: error.message }
            );
        }
        
        announceToScreenReader('テスト組み合わせの生成でエラーが発生しました');
        
    } finally {
        // 生成ボタンを有効化
        const generateBtn = document.getElementById('generate-btn');
        generateBtn.disabled = false;
        generateBtn.classList.remove('generating');
        updateGenerateButtonState();
    }
}

/**
 * テスト結果の表示
 */
function displayTestResults(testCases, algorithm, factors) {
    // 結果コンテナを表示
    const resultsContainer = document.getElementById('results-container');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsControls = document.getElementById('results-controls');
    
    if (resultsContainer && noResultsMessage && resultsControls) {
        noResultsMessage.style.display = 'none';
        resultsContainer.style.display = 'block';
        resultsControls.style.display = 'flex';
    }
    
    // カバレッジ情報を表示
    displayCoverageInformation(testCases, algorithm, factors);
    
    // テーブルを表示
    if (resultsTableManager) {
        resultsTableManager.displayResults(testCases, factors);
    }
    
    // 結果セクションにスクロール
    const resultsSection = document.querySelector('#results-container').closest('.row');
    if (resultsSection) {
        resultsSection.scrollIntoView({ 
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }
}

/**
 * カバレッジ情報の表示
 */
function displayCoverageInformation(testCases, algorithm, factors) {
    const coverageStats = document.getElementById('coverage-stats');
    if (!coverageStats) return;
    
    try {
        // カバレッジ計算
        let coverage = {};
        if (coverageCalculator) {
            coverage = coverageCalculator.calculateCoverage(testCases, factors, algorithm);
        }
        
        // 全組み合わせ数の計算
        const totalCombinations = factors.reduce((total, factor) => {
            return total * (factor.levels ? factor.levels.length : 2);
        }, 1);
        
        // 削減率の計算
        const reductionRate = totalCombinations > 0 ? 
            ((totalCombinations - testCases.length) / totalCombinations * 100) : 0;
        
        // アルゴリズム名の取得
        const algorithmNames = {
            'pairwise': 'ペアワイズテスト',
            'threeway': '3因子間網羅',
            'allcombinations': '全組み合わせ'
        };
        
        // HTML生成
        coverageStats.innerHTML = `
            <div class="col-md-3">
                <div class="coverage-stat stat-primary">
                    <span class="coverage-stat-value">${testCases.length.toLocaleString()}</span>
                    <div class="coverage-stat-label">生成テストケース数</div>
                    <div class="coverage-stat-description">
                        <span class="algorithm-badge badge-${algorithm}">${algorithmNames[algorithm]}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="coverage-stat stat-info">
                    <span class="coverage-stat-value">${factors.length}</span>
                    <div class="coverage-stat-label">因子数</div>
                    <div class="coverage-stat-description">
                        総水準数: ${factors.reduce((sum, f) => sum + (f.levels ? f.levels.length : 0), 0)}
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="coverage-stat stat-success">
                    <span class="coverage-stat-value">${reductionRate.toFixed(1)}%</span>
                    <div class="coverage-stat-label">削減率</div>
                    <div class="coverage-stat-description">
                        全組み合わせ: ${totalCombinations.toLocaleString()}
                    </div>
                    <div class="coverage-progress">
                        <div class="coverage-progress-bar ${getProgressBarClass(reductionRate)}" 
                             style="width: ${Math.min(reductionRate, 100)}%"></div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="coverage-stat stat-warning">
                    <span class="coverage-stat-value">${coverage.pairCoverage || 'N/A'}</span>
                    <div class="coverage-stat-label">ペアカバレッジ</div>
                    <div class="coverage-stat-description">
                        ${algorithm === 'threeway' ? `3因子: ${coverage.tripleCoverage || 'N/A'}` : '2因子間の網羅率'}
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('カバレッジ情報の表示でエラーが発生しました:', error);
        coverageStats.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    カバレッジ情報の計算でエラーが発生しました
                </div>
            </div>
        `;
    }
}

/**
 * プログレスバーのクラスを取得
 */
function getProgressBarClass(percentage) {
    if (percentage >= 90) return 'progress-excellent';
    if (percentage >= 75) return 'progress-good';
    if (percentage >= 50) return 'progress-fair';
    if (percentage >= 25) return 'progress-poor';
    return 'progress-bad';
}

/**
 * 結果のクリア
 */
function clearResults() {
    const resultsContainer = document.getElementById('results-container');
    const noResultsMessage = document.getElementById('no-results-message');
    const resultsControls = document.getElementById('results-controls');
    
    if (resultsContainer && noResultsMessage && resultsControls) {
        resultsContainer.style.display = 'none';
        noResultsMessage.style.display = 'block';
        resultsControls.style.display = 'none';
    }
    
    // アプリケーション状態をクリア
    window.TestCombinationGenerator.testCases = [];
    
    announceToScreenReader('結果がクリアされました');
    showToast('結果をクリアしました', 'info');
}

/**
 * 因子の状態が変更された時の処理
 */
function onFactorsChanged() {
    // 生成ボタンの状態を更新
    updateGenerateButtonState();
    
    // 生成予測を更新
    updateGenerationEstimate();
    
    // 結果をクリア（因子が変更された場合）
    if (window.TestCombinationGenerator.testCases && window.TestCombinationGenerator.testCases.length > 0) {
        const shouldClear = confirm('因子が変更されました。現在の結果をクリアしますか？');
        if (shouldClear) {
            clearResults();
        }
    }
}

// 因子変更時のイベントリスナーを設定（他の関数から呼び出される）
if (typeof addFactor === 'function') {
    const originalAddFactor = addFactor;
    addFactor = function(...args) {
        const result = originalAddFactor.apply(this, args);
        onFactorsChanged();
        return result;
    };
}

/**
 * ページの可視性変更時の処理
 */
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // ページが非表示になった時の処理
        console.log('ページが非表示になりました');
    } else {
        // ページが表示された時の処理
        console.log('ページが表示されました');
        
        // 状態の整合性チェック
        updateGenerateButtonState();
    }
});

/**
 * ウィンドウのアンロード前の処理
 */
window.addEventListener('beforeunload', function(event) {
    // 未保存の結果がある場合の警告
    const testCases = window.TestCombinationGenerator.testCases || [];
    if (testCases.length > 0) {
        const message = '生成されたテスト結果が失われる可能性があります。本当にページを離れますか？';
        event.returnValue = message;
        return message;
    }
});

console.log('テスト組み合わせ生成機能が初期化されました');/**
 * クイ
ックスタートガイドの表示
 */
function showQuickStartGuide() {
    // 既存のモーダルを削除
    const existingModal = document.getElementById('quick-start-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="quick-start-modal" tabindex="-1" aria-labelledby="quickStartModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-info text-white">
                        <h5 class="modal-title" id="quickStartModalLabel">
                            <i class="bi bi-rocket me-2"></i>
                            クイックスタートガイド
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-12">
                                <h6 class="mb-3">
                                    <i class="bi bi-1-circle-fill text-primary me-2"></i>
                                    因子・水準を入力
                                </h6>
                                <p class="mb-3">
                                    「因子を追加」ボタンをクリックして、テスト対象の因子（例：ブラウザ、OS）と
                                    その水準（例：Chrome, Firefox, Safari）を入力します。
                                </p>
                                <div class="alert alert-light border">
                                    <strong>例：</strong><br>
                                    因子名: ブラウザ<br>
                                    水準: Chrome, Firefox, Safari, Edge
                                </div>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="row">
                            <div class="col-12">
                                <h6 class="mb-3">
                                    <i class="bi bi-2-circle-fill text-success me-2"></i>
                                    アルゴリズムを選択
                                </h6>
                                <p class="mb-3">
                                    3つのアルゴリズムから1つを選択します：
                                </p>
                                <ul class="list-unstyled">
                                    <li class="mb-2">
                                        <span class="badge bg-primary me-2">推奨</span>
                                        <strong>ペアワイズテスト</strong> - 効率的で実用的
                                    </li>
                                    <li class="mb-2">
                                        <span class="badge bg-info me-2">高品質</span>
                                        <strong>3因子間網羅</strong> - より高いカバレッジ
                                    </li>
                                    <li class="mb-2">
                                        <span class="badge bg-warning me-2">完全</span>
                                        <strong>全組み合わせ</strong> - 100%網羅（小規模向け）
                                    </li>
                                </ul>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <div class="row">
                            <div class="col-12">
                                <h6 class="mb-3">
                                    <i class="bi bi-3-circle-fill text-warning me-2"></i>
                                    テスト組み合わせを生成
                                </h6>
                                <p class="mb-3">
                                    「テスト組み合わせ生成」ボタンをクリックして実行します。
                                    生成されたテストケースは表形式で表示され、CSVファイルとしてダウンロードできます。
                                </p>
                            </div>
                        </div>
                        
                        <div class="alert alert-success">
                            <h6 class="alert-heading">
                                <i class="bi bi-lightbulb me-1"></i>
                                すぐに試したい方へ
                            </h6>
                            <p class="mb-2">
                                「サンプルデータで試す」ボタンから、あらかじめ用意されたサンプルデータを使って
                                すぐにテスト組み合わせ生成を体験できます。
                            </p>
                            <button type="button" class="btn btn-success btn-sm" onclick="closeModalAndShowSamples()">
                                <i class="bi bi-collection me-1"></i>
                                サンプルデータを見る
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" onclick="showUserGuide()">
                            <i class="bi bi-book me-1"></i>
                            詳細ガイド
                        </button>
                        <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
                            始める
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('quick-start-modal'));
    modal.show();
}

/**
 * ユーザーガイドの表示
 */
function showUserGuide() {
    // 既存のモーダルを削除
    const existingModal = document.getElementById('user-guide-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="user-guide-modal" tabindex="-1" aria-labelledby="userGuideModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header bg-secondary text-white">
                        <h5 class="modal-title" id="userGuideModalLabel">
                            <i class="bi bi-book me-2"></i>
                            使い方ガイド
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="nav flex-column nav-pills" id="guide-nav" role="tablist" aria-orientation="vertical">
                                    <button class="nav-link active" id="overview-tab" data-bs-toggle="pill" data-bs-target="#overview" type="button" role="tab">
                                        概要
                                    </button>
                                    <button class="nav-link" id="input-tab" data-bs-toggle="pill" data-bs-target="#input" type="button" role="tab">
                                        因子・水準入力
                                    </button>
                                    <button class="nav-link" id="csv-tab" data-bs-toggle="pill" data-bs-target="#csv" type="button" role="tab">
                                        CSVファイル
                                    </button>
                                    <button class="nav-link" id="algorithms-tab" data-bs-toggle="pill" data-bs-target="#algorithms" type="button" role="tab">
                                        アルゴリズム
                                    </button>
                                    <button class="nav-link" id="results-tab" data-bs-toggle="pill" data-bs-target="#results" type="button" role="tab">
                                        結果・エクスポート
                                    </button>
                                    <button class="nav-link" id="troubleshooting-tab" data-bs-toggle="pill" data-bs-target="#troubleshooting" type="button" role="tab">
                                        トラブルシューティング
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-9">
                                <div class="tab-content" id="guide-content">
                                    <div class="tab-pane fade show active" id="overview" role="tabpanel">
                                        <h5>概要</h5>
                                        <p>テスト組み合わせ生成ツールは、ソフトウェアテストにおける因子と水準の組み合わせを効率的に生成するWebアプリケーションです。</p>
                                        
                                        <h6>主な機能</h6>
                                        <ul>
                                            <li><strong>ペアワイズテスト</strong>: 全ての2因子の組み合わせを最小限のテストケースで網羅</li>
                                            <li><strong>3因子間網羅</strong>: より高いカバレッジを提供</li>
                                            <li><strong>全組み合わせ</strong>: 完全な網羅（小規模データ向け）</li>
                                            <li><strong>CSVファイル対応</strong>: データの読み込みと結果のエクスポート</li>
                                        </ul>
                                        
                                        <h6>対応ブラウザ</h6>
                                        <p>Chrome、Firefox、Safari、Edgeの最新版に対応しています。</p>
                                    </div>
                                    
                                    <div class="tab-pane fade" id="input" role="tabpanel">
                                        <h5>因子・水準の入力方法</h5>
                                        
                                        <h6>基本的な入力手順</h6>
                                        <ol>
                                            <li>「因子を追加」ボタンをクリック</li>
                                            <li>因子名を入力（例：ブラウザ、OS）</li>
                                            <li>水準をカンマ区切りで入力（例：Chrome, Firefox, Safari）</li>
                                            <li>必要に応じて追加の因子を作成</li>
                                        </ol>
                                        
                                        <h6>入力のルール</h6>
                                        <ul>
                                            <li>因子名は重複不可</li>
                                            <li>各因子に最低2つの水準が必要</li>
                                            <li>最大20因子、各因子最大50水準まで</li>
                                        </ul>
                                        
                                        <div class="alert alert-info">
                                            <strong>入力例：</strong><br>
                                            因子名: ブラウザ<br>
                                            水準: Chrome, Firefox, Safari, Edge
                                        </div>
                                    </div>
                                    
                                    <div class="tab-pane fade" id="csv" role="tabpanel">
                                        <h5>CSVファイルの使用方法</h5>
                                        
                                        <h6>CSVファイルの形式</h6>
                                        <pre class="bg-light p-3 rounded">ブラウザ,OS,画面サイズ
Chrome,Windows,デスクトップ
Firefox,macOS,タブレット
Safari,Linux,スマートフォン</pre>
                                        
                                        <h6>アップロード手順</h6>
                                        <ol>
                                            <li>「CSVファイルを選択」ボタンをクリック</li>
                                            <li>適切な形式のCSVファイルを選択</li>
                                            <li>自動的に因子・水準データが読み込まれます</li>
                                        </ol>
                                        
                                        <p>「サンプルCSVダウンロード」ボタンから、正しい形式のサンプルファイルを取得できます。</p>
                                    </div>
                                    
                                    <div class="tab-pane fade" id="algorithms" role="tabpanel">
                                        <h5>アルゴリズムの選択</h5>
                                        
                                        <div class="row">
                                            <div class="col-12 mb-3">
                                                <div class="card">
                                                    <div class="card-header bg-primary text-white">
                                                        <h6 class="mb-0">ペアワイズテスト（推奨）</h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <p>全ての2因子の組み合わせを最小限のテストケースで網羅します。</p>
                                                        <strong>適用場面：</strong> 日常的なテスト設計、リソースが限られている場合
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="col-12 mb-3">
                                                <div class="card">
                                                    <div class="card-header bg-info text-white">
                                                        <h6 class="mb-0">3因子間網羅</h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <p>全ての3因子の組み合わせを網羅し、より高いカバレッジを提供します。</p>
                                                        <strong>適用場面：</strong> 高い品質保証が必要、複雑な相互作用のテスト
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="col-12 mb-3">
                                                <div class="card">
                                                    <div class="card-header bg-warning text-dark">
                                                        <h6 class="mb-0">全組み合わせ</h6>
                                                    </div>
                                                    <div class="card-body">
                                                        <p>全ての因子・水準の組み合わせを完全に網羅します。</p>
                                                        <strong>適用場面：</strong> 完全なテストが必要、因子数・水準数が少ない場合
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="tab-pane fade" id="results" role="tabpanel">
                                        <h5>結果の確認とエクスポート</h5>
                                        
                                        <h6>カバレッジ情報</h6>
                                        <ul>
                                            <li><strong>生成テストケース数</strong>: 実際に生成されたテストケースの数</li>
                                            <li><strong>削減率</strong>: 全組み合わせと比較した削減率</li>
                                            <li><strong>ペアカバレッジ</strong>: 2因子間の網羅率</li>
                                        </ul>
                                        
                                        <h6>テーブル機能</h6>
                                        <ul>
                                            <li>列ヘッダークリックでソート</li>
                                            <li>検索ボックスでフィルタリング</li>
                                            <li>表示件数の変更</li>
                                            <li>ページネーション</li>
                                        </ul>
                                        
                                        <h6>エクスポート</h6>
                                        <ul>
                                            <li><strong>CSV出力</strong>: 生成結果をCSVファイルでダウンロード</li>
                                            <li><strong>全組み合わせCSV</strong>: 全網羅データをダウンロード</li>
                                        </ul>
                                    </div>
                                    
                                    <div class="tab-pane fade" id="troubleshooting" role="tabpanel">
                                        <h5>トラブルシューティング</h5>
                                        
                                        <h6>よくあるエラーと対処法</h6>
                                        
                                        <div class="accordion" id="troubleshootingAccordion">
                                            <div class="accordion-item">
                                                <h2 class="accordion-header">
                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#error1">
                                                        因子名が重複しています
                                                    </button>
                                                </h2>
                                                <div id="error1" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                                                    <div class="accordion-body">
                                                        <strong>原因：</strong> 同じ因子名を複数回入力している<br>
                                                        <strong>対処法：</strong> 因子名を一意になるよう変更してください
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="accordion-item">
                                                <h2 class="accordion-header">
                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#error2">
                                                        最低2つの水準が必要です
                                                    </button>
                                                </h2>
                                                <div id="error2" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                                                    <div class="accordion-body">
                                                        <strong>原因：</strong> 水準が1つしか入力されていない<br>
                                                        <strong>対処法：</strong> カンマ区切りで2つ以上の水準を入力してください
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div class="accordion-item">
                                                <h2 class="accordion-header">
                                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#error3">
                                                        CSVファイルの形式が正しくありません
                                                    </button>
                                                </h2>
                                                <div id="error3" class="accordion-collapse collapse" data-bs-parent="#troubleshootingAccordion">
                                                    <div class="accordion-body">
                                                        <strong>原因：</strong> CSVファイルの形式が不正<br>
                                                        <strong>対処法：</strong> 
                                                        <ul>
                                                            <li>1行目に因子名があることを確認</li>
                                                            <li>文字エンコーディングをUTF-8に変更</li>
                                                            <li>サンプルCSVを参考に形式を修正</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h6 class="mt-4">パフォーマンスの最適化</h6>
                                        <div class="alert alert-warning">
                                            <strong>推奨設定：</strong><br>
                                            因子数: 10個以下<br>
                                            水準数: 各因子10個以下<br>
                                            全組み合わせ: 10,000ケース以下
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-primary" onclick="showQuickStartGuide()">
                            <i class="bi bi-rocket me-1"></i>
                            クイックスタート
                        </button>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('user-guide-modal'));
    modal.show();
}

/**
 * モーダルを閉じてサンプルデータモーダルを表示
 */
function closeModalAndShowSamples() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('quick-start-modal'));
    if (modal) {
        modal.hide();
    }
    
    setTimeout(() => {
        showSampleDataModal();
    }, 300);
}

console.log('ドキュメント機能が初期化されました');

// グローバル関数の定義（ファイル最後に追加）
window.generatePairwiseTestCases = function(factors) {
    const generator = new PairwiseGenerator();
    return generator.generate(factors);
};

window.generateThreeWayTestCases = function(factors) {
    const generator = new ThreeWayGenerator();
    return generator.generate(factors);
};

window.generateAllCombinations = function(factors) {
    const generator = new AllCombinationsGenerator();
    return generator.generate(factors, true);
};

// グローバルスコープにも追加
if (typeof generatePairwiseTestCases === 'undefined') {
    generatePairwiseTestCases = window.generatePairwiseTestCases;
}
if (typeof generateThreeWayTestCases === 'undefined') {
    generateThreeWayTestCases = window.generateThreeWayTestCases;
}
if (typeof generateAllCombinations === 'undefined') {
    generateAllCombinations = window.generateAllCombinations;
}

console.log('グローバル関数が定義されました:', {
    generatePairwiseTestCases: typeof generatePairwiseTestCases,
    generateThreeWayTestCases: typeof generateThreeWayTestCases,
    generateAllCombinations: typeof generateAllCombinations
});