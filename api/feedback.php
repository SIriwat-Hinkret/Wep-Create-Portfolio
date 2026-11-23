<?php
require 'storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(['error' => 'POST required'], 405);
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) sendJson(['error' => 'Invalid request body'], 400);
$entry = [
    'id' => uniqid('feedback'),
    'from' => trim((string)($input['from'] ?? '')),
    'to' => trim((string)($input['to'] ?? '')),
    'rating' => trim((string)($input['rating'] ?? 'Good')),
    'positive' => trim((string)($input['positive'] ?? '')),
    'suggestion' => trim((string)($input['suggestion'] ?? '')),
    'createdAt' => date(DATE_ATOM),
];
foreach (['from', 'to', 'positive', 'suggestion'] as $key) {
    if ($entry[$key] === '') sendJson(['error' => 'Please complete all required feedback fields'], 400);
    if (strlen($entry[$key]) > 2000) sendJson(['error' => 'Feedback fields must be 2,000 characters or fewer'], 400);
}
if (!in_array($entry['rating'], ['Excellent', 'Good', 'Needs improvement'], true)) $entry['rating'] = 'Good';
$feedbackFile = DATA_DIR . '/feedback.json';
$lock = @fopen(DATA_DIR . '/feedback.lock', 'c');
if ($lock === false) cannotSave(DATA_DIR . '/feedback.lock');
flock($lock, LOCK_EX);
$feedback = file_exists($feedbackFile) ? (json_decode(file_get_contents($feedbackFile), true) ?: []) : [];
$feedback[] = $entry;
$ok = @file_put_contents($feedbackFile, json_encode($feedback, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), LOCK_EX);
flock($lock, LOCK_UN);
fclose($lock);
if ($ok === false) cannotSave($feedbackFile);
sendJson(['success' => true, 'feedback' => $entry], 201);
