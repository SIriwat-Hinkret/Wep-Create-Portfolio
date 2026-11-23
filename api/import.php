<?php
require 'storage.php';

// M13-compatible JSON import with server-side duplicate protection.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(['error' => 'POST required'], 405);
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) sendJson(['error' => 'Invalid request body'], 400);
$portfolioId = $input['portfolioId'] ?? '';
$data = $input['data'] ?? null;
$fileHash = $input['fileHash'] ?? '';
if (!is_string($portfolioId) || $portfolioId === '' || !is_array($data)) {
    sendJson(['error' => 'Portfolio and valid JSON data are required'], 400);
}
if (!is_string($fileHash) || !preg_match('/^(?:[a-f0-9]{64}|fnv-[a-f0-9]+)$/', $fileHash)) {
    sendJson(['error' => 'Invalid file fingerprint'], 400);
}

$portfolios = readPortfolios(); // obtains the shared exclusive data lock
$targetIndex = null;
foreach ($portfolios as $i => $portfolio) {
    if (($portfolio['id'] ?? '') === $portfolioId) { $targetIndex = $i; break; }
}
if ($targetIndex === null) sendJson(['error' => 'Portfolio not found'], 404);

$importsFile = DATA_DIR . '/imports.json';
$imports = file_exists($importsFile) ? (json_decode(file_get_contents($importsFile), true) ?: []) : [];
$scopedFileHash = $portfolioId . ':' . $fileHash;
if (in_array($scopedFileHash, $imports, true)) {
    sendJson(['error' => 'This JSON file was already imported. Duplicate import blocked.', 'duplicateFile' => true], 409);
}

// Accept one Item or an exported Portfolio containing items.
if (isset($data['items']) && is_array($data['items'])) $items = $data['items'];
elseif (array_is_list($data)) $items = $data;
else $items = [$data];
if (count($items) !== 1 || !is_array($items[0] ?? null)) {
    sendJson(['error' => 'Import one Portfolio Item at a time.'], 400);
}
$item = $items[0];
$title = trim((string)($item['title'] ?? ''));
$id = trim((string)($item['id'] ?? ''));
if ($title === '' || $id === '') sendJson(['error' => 'Imported Item must include a title and ID.'], 400);
if (strlen($id) > 200 || strlen($title) > 200) sendJson(['error' => 'Item ID or title is too long.'], 400);

function importItemKey($item) {
    $normalized = [
        strtolower(trim((string)($item['title'] ?? ''))),
        strtolower(trim((string)($item['type'] ?? ''))),
        trim((string)($item['date'] ?? '')),
        strtolower(trim((string)($item['description'] ?? ''))),
    ];
    return hash('sha256', json_encode($normalized));
}

$incomingKey = importItemKey($item);
foreach ($portfolios as $portfolio) {
    foreach (($portfolio['items'] ?? []) as $existing) {
        if (($existing['id'] ?? '') === $id) {
            sendJson(['error' => 'This Item ID already exists. Duplicate imports are blocked.', 'duplicateId' => true], 409);
        }
        if (importItemKey($existing) === $incomingKey) {
            sendJson(['error' => 'An Item with the same title, type, date and description already exists. Duplicate imports are blocked.', 'duplicateContent' => true], 409);
        }
    }
}

$reflection = is_array($item['reflection'] ?? null) ? $item['reflection'] : [];
$skills = is_array($item['skills'] ?? null) ? $item['skills'] : [];
$evidence = is_array($item['evidence'] ?? null) ? $item['evidence'] : [];
foreach ($evidence as $url) {
    if (!is_string($url) || !filter_var($url, FILTER_VALIDATE_URL) || !in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?: ''), ['http', 'https'], true)) {
        sendJson(['error' => 'Every evidence link must be a valid http:// or https:// URL.'], 400);
    }
}

$saved = [
    'id' => $id,
    'title' => $title,
    'type' => trim((string)($item['type'] ?? '')),
    'date' => trim((string)($item['date'] ?? '')),
    'role' => trim((string)($item['role'] ?? '')),
    'description' => trim((string)($item['description'] ?? '')),
    'skills' => array_values(array_filter($skills, 'is_string')),
    'reflection' => [
        'whatIDid' => trim((string)($input['reflection']['whatIDid'] ?? $reflection['whatIDid'] ?? '')),
        'whatILearned' => trim((string)($input['reflection']['whatILearned'] ?? $reflection['whatILearned'] ?? '')),
        'challenge' => trim((string)($input['reflection']['challenge'] ?? $reflection['challenge'] ?? '')),
        'nextStep' => trim((string)($input['reflection']['nextStep'] ?? $reflection['nextStep'] ?? '')),
    ],
    'evidence' => array_values(array_filter($evidence, 'is_string')),
];
foreach (['challengeId', 'hostGroup', 'category', 'schemaVersion'] as $key) {
    if (isset($item[$key]) && is_string($item[$key]) && trim($item[$key]) !== '') $saved[$key] = trim($item[$key]);
}
$portfolios[$targetIndex]['items'][] = $saved;
writePortfolios($portfolios);
$imports[] = $scopedFileHash;
if (@file_put_contents($importsFile, json_encode(array_values(array_unique($imports)), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) {
    // The Portfolio item is already saved. Report fingerprint persistence failure explicitly.
    sendJson(['success' => true, 'item' => $saved, 'warning' => 'Item saved, but duplicate-file fingerprint could not be stored.'], 201);
}
sendJson(['success' => true, 'imported' => 1, 'item' => $saved], 201);
