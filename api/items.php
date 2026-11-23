<?php
require 'storage.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$action = trim($_POST['action'] ?? 'create');
$portfolioId = trim($_POST['portfolioId'] ?? '');
$itemId = trim($_POST['id'] ?? '');
if ($portfolioId === '') sendJson(['error' => 'Please select a destination Portfolio'], 400);

$portfolios = readPortfolios();
$targetIndex = null;
foreach ($portfolios as $i => $portfolio) {
    if (($portfolio['id'] ?? '') === $portfolioId) {
        $targetIndex = $i;
        break;
    }
}
if ($targetIndex === null) sendJson(['error' => 'Portfolio not found'], 404);
if (!isset($portfolios[$targetIndex]['items']) || !is_array($portfolios[$targetIndex]['items'])) {
    $portfolios[$targetIndex]['items'] = [];
}

if ($action === 'delete') {
    if ($itemId === '') sendJson(['error' => 'Item ID is required'], 400);
    $before = count($portfolios[$targetIndex]['items']);
    $portfolios[$targetIndex]['items'] = array_values(array_filter(
        $portfolios[$targetIndex]['items'], fn($item) => ($item['id'] ?? '') !== $itemId
    ));
    if (count($portfolios[$targetIndex]['items']) === $before) sendJson(['error' => 'Item not found'], 404);
    writePortfolios($portfolios);
    sendJson(['message' => 'Item deleted successfully', 'id' => $itemId]);
}

if (!in_array($action, ['create', 'update'], true)) sendJson(['error' => 'Unknown action'], 400);
$title = trim($_POST['title'] ?? '');
if ($title === '') sendJson(['error' => 'Title is required'], 400);

// Regular form sends comma-separated skills and one evidence URL. Import/edit can send JSON arrays.
$skillsInput = trim($_POST['skills'] ?? '');
$skillsDecoded = json_decode($skillsInput, true);
if (is_array($skillsDecoded) && array_is_list($skillsDecoded)) {
    $skills = array_values(array_filter(array_map('trim', $skillsDecoded), fn($v) => is_string($v) && $v !== ''));
} else {
    $skills = array_values(array_filter(array_map('trim', explode(',', $skillsInput)), fn($v) => $v !== ''));
}

$evidenceInput = trim($_POST['evidence'] ?? '');
$evidenceDecoded = json_decode($evidenceInput, true);
if (is_array($evidenceDecoded) && array_is_list($evidenceDecoded)) {
    $evidence = array_values(array_filter(array_map('trim', $evidenceDecoded), fn($v) => is_string($v) && $v !== ''));
} else {
    $evidence = $evidenceInput !== '' ? [$evidenceInput] : [];
}
foreach ($evidence as $url) {
    if (!filter_var($url, FILTER_VALIDATE_URL) || !in_array(strtolower(parse_url($url, PHP_URL_SCHEME) ?: ''), ['http', 'https'], true)) {
        sendJson(['error' => 'Every evidence link must be a valid http:// or https:// URL'], 400);
    }
}

if ($action === 'create') {
    if ($itemId === '') $itemId = uniqid('item');
    if (strlen($itemId) > 200) sendJson(['error' => 'Item ID is too long'], 400);
    // Block duplicate IDs across every Portfolio.
    foreach ($portfolios as $portfolio) {
        foreach (($portfolio['items'] ?? []) as $existingItem) {
            if (($existingItem['id'] ?? '') === $itemId) {
                sendJson(['error' => 'This item already exists. Duplicate imports are not allowed.', 'duplicateId' => $itemId], 409);
            }
        }
    }
} else {
    if ($itemId === '') sendJson(['error' => 'Item ID is required'], 400);
    $found = false;
    foreach ($portfolios as $pi => $portfolio) {
        foreach (($portfolio['items'] ?? []) as $ii => $existingItem) {
            if (($existingItem['id'] ?? '') === $itemId) {
                if ($pi !== $targetIndex) sendJson(['error' => 'Item does not belong to this Portfolio'], 409);
                $found = true;
                break 2;
            }
        }
    }
    if (!$found) sendJson(['error' => 'Item not found'], 404);
}

$item = [
    'id' => $itemId,
    'title' => $title,
    'type' => trim($_POST['type'] ?? ''),
    'date' => trim($_POST['date'] ?? ''),
    'role' => trim($_POST['role'] ?? ''),
    'description' => trim($_POST['description'] ?? ''),
    'skills' => $skills,
    'reflection' => [
        'whatIDid' => trim($_POST['whatIDid'] ?? ''),
        'whatILearned' => trim($_POST['whatILearned'] ?? ''),
        'challenge' => trim($_POST['challenge'] ?? ''),
        'nextStep' => trim($_POST['nextStep'] ?? ''),
    ],
    'evidence' => $evidence,
];
foreach (['challengeId', 'hostGroup', 'category', 'schemaVersion'] as $key) {
    if (isset($_POST[$key]) && trim($_POST[$key]) !== '') $item[$key] = trim($_POST[$key]);
}

if ($action === 'update') {
    foreach ($portfolios[$targetIndex]['items'] as $i => $existingItem) {
        if (($existingItem['id'] ?? '') === $itemId) {
            $portfolios[$targetIndex]['items'][$i] = $item;
            writePortfolios($portfolios);
            sendJson(['message' => 'Item updated successfully', 'item' => $item]);
        }
    }
}

$portfolios[$targetIndex]['items'][] = $item;
writePortfolios($portfolios);
sendJson($item, 201);
