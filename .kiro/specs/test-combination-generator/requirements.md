# Requirements Document

## Introduction

テスト設計において、因子（テスト対象の機能や条件を表す変数）と水準（各因子が取りうる具体的な値や状態）の組み合わせを効率的に生成するWebツールを開発します。このツールは、2因子間網羅（ペアワイズテスト）と3因子間網羅のアルゴリズムを実装し、CSVファイルでの入出力に対応することで、テスト設計の効率化を図ります。

## Requirements

### Requirement 1

**User Story:** テスト設計者として、ブラウザ上でテスト組み合わせ生成ツールを使用したいので、インストール不要でアクセスできるWebアプリケーションが必要です。

#### Acceptance Criteria

1. WHEN ユーザーがWebブラウザでアプリケーションにアクセスする THEN システムはWebインターフェースを表示する SHALL
2. WHEN ユーザーがモダンブラウザ（Chrome、Firefox、Safari、Edge）を使用する THEN システムは正常に動作する SHALL
3. WHEN ユーザーがモバイルデバイスからアクセスする THEN システムはレスポンシブデザインで表示される SHALL

### Requirement 2

**User Story:** テスト設計者として、既存の因子・水準データをCSVファイルから読み込みたいので、ファイルアップロード機能が必要です。

#### Acceptance Criteria

1. WHEN ユーザーがCSVファイルをアップロードする THEN システムは因子と水準のデータを解析する SHALL
2. IF CSVファイルの形式が正しくない THEN システムはエラーメッセージを表示する SHALL
3. WHEN CSVファイルが正常に読み込まれる THEN システムは因子と水準の一覧を表示する SHALL
4. WHEN ユーザーが手動で因子・水準を入力する THEN システムはフォーム入力も受け付ける SHALL

### Requirement 3

**User Story:** テスト設計者として、2因子間網羅のテスト組み合わせを生成したいので、ペアワイズテストアルゴリズムの実装が必要です。

#### Acceptance Criteria

1. WHEN ユーザーが2因子間網羅を選択する THEN システムはペアワイズアルゴリズムを実行する SHALL
2. WHEN アルゴリズムが実行される THEN システムは最小限のテストケース数で全ての2因子の組み合わせを網羅する SHALL
3. WHEN 生成が完了する THEN システムはテスト組み合わせの結果を表形式で表示する SHALL
4. IF 因子数が2未満の場合 THEN システムは適切なエラーメッセージを表示する SHALL

### Requirement 4

**User Story:** テスト設計者として、3因子間網羅のテスト組み合わせを生成したいので、3-way coverageアルゴリズムの実装が必要です。

#### Acceptance Criteria

1. WHEN ユーザーが3因子間網羅を選択する THEN システムは3因子間網羅アルゴリズムを実行する SHALL
2. WHEN アルゴリズムが実行される THEN システムは全ての3因子の組み合わせを網羅するテストケースを生成する SHALL
3. WHEN 生成が完了する THEN システムはテスト組み合わせの結果を表形式で表示する SHALL
4. IF 因子数が3未満の場合 THEN システムは適切なエラーメッセージを表示する SHALL

### Requirement 5

**User Story:** テスト設計者として、生成されたテスト組み合わせをCSVファイルでダウンロードしたいので、エクスポート機能が必要です。

#### Acceptance Criteria

1. WHEN ユーザーがダウンロードボタンをクリックする THEN システムは生成されたテスト組み合わせをCSV形式でダウンロードする SHALL
2. WHEN CSVファイルが生成される THEN ファイルには因子名がヘッダーとして含まれる SHALL
3. WHEN CSVファイルが生成される THEN 各行には1つのテストケースの組み合わせが含まれる SHALL
4. WHEN ダウンロードが実行される THEN ファイル名には生成日時と網羅タイプが含まれる SHALL

### Requirement 6

**User Story:** テスト設計者として、全網羅（全ての組み合わせ）のデータもCSVでダウンロードしたいので、全組み合わせ生成機能が必要です。

#### Acceptance Criteria

1. WHEN ユーザーが全網羅オプションを選択する THEN システムは全ての因子・水準の組み合わせを生成する SHALL
2. WHEN 全組み合わせが生成される THEN システムは結果を表形式で表示する SHALL
3. WHEN ユーザーが全網羅結果をダウンロードする THEN システムはCSVファイルを提供する SHALL
4. IF 組み合わせ数が非常に大きい場合 THEN システムは警告メッセージを表示し、実行確認を求める SHALL

### Requirement 7

**User Story:** テスト設計者として、生成されたテスト組み合わせの品質を確認したいので、カバレッジ情報の表示が必要です。

#### Acceptance Criteria

1. WHEN テスト組み合わせが生成される THEN システムは総テストケース数を表示する SHALL
2. WHEN 2因子間網羅が実行される THEN システムは全ペアのカバレッジ率を表示する SHALL
3. WHEN 3因子間網羅が実行される THEN システムは全3因子組み合わせのカバレッジ率を表示する SHALL
4. WHEN 結果が表示される THEN システムは削減率（全網羅との比較）を表示する SHALL