/**
 * サンプルデータ生成とデモンストレーション機能
 */

/**
 * サンプルデータの定義
 */
const SAMPLE_DATA = {
    'web-testing': {
        name: 'Webアプリケーションテスト',
        description: 'ブラウザ、OS、画面サイズ、ネットワーク環境の組み合わせテスト',
        factors: [
            {
                name: 'ブラウザ',
                levels: ['Chrome', 'Firefox', 'Safari', 'Edge']
            },
            {
                name: 'OS',
                levels: ['Windows', 'macOS', 'Linux']
            },
            {
                name: '画面サイズ',
                levels: ['デスクトップ', 'タブレット', 'スマートフォン']
            },
            {
                name: 'ネットワーク',
                levels: ['高速', '中速', '低速']
            }
        ]
    },
    'ecommerce-testing': {
        name: 'ECサイトテスト',
        description: '決済、配送、会員種別、商品カテゴリの組み合わせテスト',
        factors: [
            {
                name: '決済方法',
                levels: ['クレジットカード', '銀行振込', '代金引換', '電子マネー']
            },
            {
                name: '配送方法',
                levels: ['通常配送', '速達配送', '店舗受取']
            },
            {
                name: '会員種別',
                levels: ['一般会員', 'プレミアム会員', 'ゲスト']
            },
            {
                name: '商品カテゴリ',
                levels: ['書籍', '電子機器', '衣類', '食品']
            }
        ]
    },
    'mobile-app-testing': {
        name: 'モバイルアプリテスト',
        description: 'デバイス、OS、アプリバージョン、ネットワーク、言語の組み合わせテスト',
        factors: [
            {
                name: 'デバイス',
                levels: ['iPhone', 'Android', 'iPad', 'Pixel', 'Galaxy']
            },
            {
                name: 'OS',
                levels: ['iOS16', 'iOS15', 'Android13', 'Android12']
            },
            {
                name: 'アプリバージョン',
                levels: ['v2.1', 'v2.0', 'v1.9']
            },
            {
                name: 'ネットワーク',
                levels: ['WiFi', '4G', '5G']
            },
            {
                name: '言語',
                levels: ['日本語', '英語', '中国語']
            }
        ]
    },
    'api-testing': {
        name: 'APIテスト',
        description: 'HTTPメソッド、認証方式、データ形式の組み合わせテスト',
        factors: [
            {
                name: 'HTTPメソッド',
                levels: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
            },
            {
                name: '認証方式',
                levels: ['Bearer Token', 'API Key', 'OAuth2', 'Basic Auth']
            },
            {
                name: 'データ形式',
                levels: ['JSON', 'XML', 'Form Data']
            },
            {
                name: 'レスポンス形式',
                levels: ['JSON', 'XML']
            }
        ]
    },
    'database-testing': {
        name: 'データベーステスト',
        description: 'データベース操作、トランザクション、データ型の組み合わせテスト',
        factors: [
            {
                name: '操作種別',
                levels: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
            },
            {
                name: 'トランザクション',
                levels: ['自動コミット', '手動コミット', 'ロールバック']
            },
            {
                name: 'データ型',
                levels: ['文字列', '数値', '日付', 'NULL']
            },
            {
                name: 'インデックス',
                levels: ['あり', 'なし']
            }
        ]
    },
    'security-testing': {
        name: 'セキュリティテスト',
        description: '認証、権限、暗号化、入力検証の組み合わせテスト',
        factors: [
            {
                name: '認証状態',
                levels: ['ログイン済み', '未ログイン', 'セッション期限切れ']
            },
            {
                name: 'ユーザー権限',
                levels: ['管理者', '一般ユーザー', 'ゲスト']
            },
            {
                name: '通信暗号化',
                levels: ['HTTPS', 'HTTP']
            },
            {
                name: '入力データ',
                levels: ['正常値', '異常値', 'SQLインジェクション', 'XSS']
            }
        ]
    }
};

/**
 * サンプルデータをアプリケーションに読み込む
 * @param {string} sampleKey - サンプルデータのキー
 */
function loadSampleData(sampleKey) {
    const sampleData = SAMPLE_DATA[sampleKey];
    if (!sampleData) {
        console.error('指定されたサンプルデータが見つかりません:', sampleKey);
        return;
    }
    
    try {
        // 既存の因子をクリア
        clearAllFactors();
        
        // サンプルデータの因子を追加
        sampleData.factors.forEach((factor, index) => {
            setTimeout(() => {
                addFactor();
                
                // 最後に追加された因子フォームを取得
                const factorForms = document.querySelectorAll('.factor-form');
                const lastForm = factorForms[factorForms.length - 1];
                
                if (lastForm) {
                    const nameInput = lastForm.querySelector('input[placeholder*="因子名"]');
                    const levelsInput = lastForm.querySelector('input[placeholder*="水準"]');
                    
                    if (nameInput && levelsInput) {
                        nameInput.value = factor.name;
                        levelsInput.value = factor.levels.join(', ');
                        
                        // バリデーションをトリガー
                        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                        levelsInput.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            }, index * 100); // 順次追加のための遅延
        });
        
        // 成功メッセージ
        setTimeout(() => {
            showToast(`サンプルデータ「${sampleData.name}」を読み込みました`, 'success');
            announceToScreenReader(`サンプルデータ ${sampleData.name} を読み込みました`);
            
            // InputManagerのUIを更新（グローバル状態同期のため）
            if (window.inputManager && typeof window.inputManager.updateUI === 'function') {
                console.log('Calling inputManager.updateUI from sample data load');
                window.inputManager.updateUI();
            } else {
                console.error('inputManager.updateUI not found');
                
                // フォールバック: 直接ボタン状態を更新
                console.log('Fallback: Calling updateGenerateButtonState from sample data load');
                if (typeof updateGenerateButtonState === 'function') {
                    updateGenerateButtonState();
                } else {
                    console.error('updateGenerateButtonState function not found');
                }
                
                if (typeof updateGenerationEstimate === 'function') {
                    updateGenerationEstimate();
                } else {
                    console.error('updateGenerationEstimate function not found');
                }
            }
        }, sampleData.factors.length * 100 + 200);
        
        console.log('サンプルデータを読み込みました:', sampleData.name);
        
    } catch (error) {
        console.error('サンプルデータの読み込みでエラーが発生しました:', error);
        showErrorMessage(
            'サンプルデータの読み込みでエラーが発生しました',
            ErrorTypes.FILE_PROCESSING,
            ErrorSeverity.MEDIUM,
            { sampleKey: sampleKey, error: error.message }
        );
    }
}

/**
 * サンプルCSVファイルを生成してダウンロード
 * @param {string} sampleKey - サンプルデータのキー
 */
function downloadSampleCSV(sampleKey = 'web-testing') {
    const sampleData = SAMPLE_DATA[sampleKey];
    if (!sampleData) {
        console.error('指定されたサンプルデータが見つかりません:', sampleKey);
        return;
    }
    
    try {
        // CSVヘッダー（因子名）
        const headers = sampleData.factors.map(factor => factor.name);
        
        // 全組み合わせを生成（サンプル用に制限）
        const combinations = generateSampleCombinations(sampleData.factors, 20); // 最大20行
        
        // CSV形式に変換
        const csvContent = [
            headers.join(','),
            ...combinations.map(combination => combination.join(','))
        ].join('\n');
        
        // ファイルダウンロード
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sample-${sampleKey}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showToast(`サンプルCSVファイル「${sampleData.name}」をダウンロードしました`, 'success');
        console.log('サンプルCSVファイルをダウンロードしました:', sampleData.name);
        
    } catch (error) {
        console.error('サンプルCSVファイルの生成でエラーが発生しました:', error);
        showErrorMessage(
            'サンプルCSVファイルの生成でエラーが発生しました',
            ErrorTypes.FILE_PROCESSING,
            ErrorSeverity.MEDIUM,
            { sampleKey: sampleKey, error: error.message }
        );
    }
}

/**
 * サンプル用の組み合わせを生成（制限付き）
 * @param {Array} factors - 因子配列
 * @param {number} maxCombinations - 最大組み合わせ数
 * @returns {Array} 組み合わせ配列
 */
function generateSampleCombinations(factors, maxCombinations = 20) {
    const combinations = [];
    const totalPossible = factors.reduce((total, factor) => total * factor.levels.length, 1);
    const step = Math.max(1, Math.floor(totalPossible / maxCombinations));
    
    let count = 0;
    let index = 0;
    
    // 全組み合わせを生成（間引きあり）
    function generateRecursive(currentCombination, factorIndex) {
        if (factorIndex >= factors.length) {
            if (index % step === 0 && combinations.length < maxCombinations) {
                combinations.push([...currentCombination]);
            }
            index++;
            return;
        }
        
        for (const level of factors[factorIndex].levels) {
            currentCombination[factorIndex] = level;
            generateRecursive(currentCombination, factorIndex + 1);
            
            if (combinations.length >= maxCombinations) {
                return;
            }
        }
    }
    
    generateRecursive(new Array(factors.length), 0);
    return combinations;
}

/**
 * サンプルデータ選択モーダルを表示
 */
function showSampleDataModal() {
    // 既存のモーダルを削除
    const existingModal = document.getElementById('sample-data-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // モーダルHTML生成
    const modalHtml = `
        <div class="modal fade" id="sample-data-modal" tabindex="-1" aria-labelledby="sampleDataModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="sampleDataModalLabel">
                            <i class="bi bi-collection me-2"></i>
                            サンプルデータ選択
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class="text-muted mb-4">
                            以下のサンプルデータから選択して、すぐにテスト組み合わせ生成を体験できます。
                        </p>
                        <div class="row">
                            ${Object.entries(SAMPLE_DATA).map(([key, data]) => `
                                <div class="col-md-6 mb-3">
                                    <div class="card sample-data-card h-100" data-sample-key="${key}">
                                        <div class="card-body">
                                            <h6 class="card-title">${data.name}</h6>
                                            <p class="card-text small text-muted">${data.description}</p>
                                            <div class="mb-2">
                                                <small class="text-muted">
                                                    因子数: ${data.factors.length}個
                                                </small>
                                            </div>
                                            <div class="d-flex gap-2">
                                                <button type="button" class="btn btn-primary btn-sm flex-fill" 
                                                        onclick="loadSampleDataAndCloseModal('${key}')">
                                                    <i class="bi bi-upload me-1"></i>
                                                    読み込み
                                                </button>
                                                <button type="button" class="btn btn-outline-secondary btn-sm" 
                                                        onclick="downloadSampleCSV('${key}')"
                                                        title="CSVファイルとしてダウンロード">
                                                    <i class="bi bi-download"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">閉じる</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // モーダル表示
    const modal = new bootstrap.Modal(document.getElementById('sample-data-modal'));
    modal.show();
    
    // カードのホバー効果
    document.querySelectorAll('.sample-data-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 0.5rem 1rem rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
}

/**
 * サンプルデータを読み込んでモーダルを閉じる
 * @param {string} sampleKey - サンプルデータのキー
 */
function loadSampleDataAndCloseModal(sampleKey) {
    const modal = bootstrap.Modal.getInstance(document.getElementById('sample-data-modal'));
    if (modal) {
        modal.hide();
    }
    
    // モーダルが完全に閉じてからサンプルデータを読み込み
    setTimeout(() => {
        loadSampleData(sampleKey);
    }, 300);
}

/**
 * デモンストレーション実行
 * @param {string} sampleKey - サンプルデータのキー
 * @param {string} algorithm - 使用するアルゴリズム
 */
async function runDemonstration(sampleKey = 'web-testing', algorithm = 'pairwise') {
    try {
        showToast('デモンストレーションを開始します', 'info');
        
        // 1. サンプルデータを読み込み
        loadSampleData(sampleKey);
        
        // 2. アルゴリズムを選択
        setTimeout(() => {
            selectAlgorithm(algorithm);
        }, 1000);
        
        // 3. テスト組み合わせを生成
        setTimeout(() => {
            generateTestCombinations();
        }, 2000);
        
        console.log('デモンストレーションを実行しました:', { sampleKey, algorithm });
        
    } catch (error) {
        console.error('デモンストレーション実行エラー:', error);
        showErrorMessage(
            'デモンストレーションの実行でエラーが発生しました',
            ErrorTypes.SYSTEM,
            ErrorSeverity.MEDIUM,
            { sampleKey: sampleKey, algorithm: algorithm, error: error.message }
        );
    }
}

/**
 * 既存のdownloadSampleCSV関数を上書き（メイン機能との統合）
 */
if (typeof window !== 'undefined') {
    window.downloadSampleCSV = function() {
        showSampleDataModal();
    };
}

console.log('サンプルデータ機能が初期化されました');