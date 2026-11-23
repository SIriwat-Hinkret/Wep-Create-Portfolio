<?php
require 'storage.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(['error' => 'POST required'], 405);
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) sendJson(['error' => 'Invalid request body'], 400);
$portfolioId = trim((string)($input['portfolioId'] ?? ''));
$itemId = trim((string)($input['itemId'] ?? ''));
$reflection = $input['reflection'] ?? null;
if ($portfolioId === '' || $itemId === '' || !is_array($reflection)) sendJson(['error' => 'Portfolio, Item and Reflection are required'], 400);
$keys = ['whatIDid', 'whatILearned', 'challenge', 'nextStep'];
foreach ($keys as $key) {
    if (!isset($reflection[$key]) || !is_string($reflection[$key])) sendJson(['error' => 'Reflection field ' . $key . ' must be text'], 400);
    if (strlen($reflection[$key]) > 2000) sendJson(['error' => 'Reflection field ' . $key . ' is too long'], 400);
}
$portfolios = readPortfolios();
foreach ($portfolios as $pi => $portfolio) {
    if (($portfolio['id'] ?? '') !== $portfolioId) continue;
    foreach (($portfolio['items'] ?? []) as $ii => $item) {
        if (($item['id'] ?? '') !== $itemId) continue;
        $portfolios[$pi]['items'][$ii]['reflection'] = [];
        foreach ($keys as $key) $portfolios[$pi]['items'][$ii]['reflection'][$key] = trim($reflection[$key]);
        writePortfolios($portfolios);
        sendJson(['success' => true, 'reflection' => $portfolios[$pi]['items'][$ii]['reflection']]);
    }
    sendJson(['error' => 'Item not found'], 404);
}
sendJson(['error' => 'Portfolio not found'], 404);
