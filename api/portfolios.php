<?php
require 'storage.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET api/portfolios.php -> all Portfolios (with their Items)
if ($method === 'GET') {
    sendJson(readPortfolios());
}

if ($method !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

$action = trim($_POST['action'] ?? 'create');
$portfolios = readPortfolios();

if ($action === 'update') {
    $id = trim($_POST['id'] ?? '');
    $name = trim($_POST['displayName'] ?? '');
    if ($id === '') sendJson(['error' => 'Portfolio ID is required'], 400);
    if ($name === '') sendJson(['error' => 'Display name is required'], 400);

    foreach ($portfolios as &$portfolio) {
        if (($portfolio['id'] ?? '') === $id) {
            $portfolio['displayName'] = $name;
            $portfolio['whatIEnjoy'] = trim($_POST['whatIEnjoy'] ?? '');
            $portfolio['whatIveTried'] = trim($_POST['whatIveTried'] ?? '');
            $portfolio['whatImCuriousAbout'] = trim($_POST['whatImCuriousAbout'] ?? '');
            unset($portfolio);
            writePortfolios($portfolios);
            sendJson(['message' => 'Portfolio updated successfully', 'id' => $id]);
        }
    }
    unset($portfolio);
    sendJson(['error' => 'Portfolio not found'], 404);
}

if ($action === 'delete') {
    $id = trim($_POST['id'] ?? '');
    if ($id === '') sendJson(['error' => 'Portfolio ID is required'], 400);
    $before = count($portfolios);
    $portfolios = array_values(array_filter($portfolios, fn($p) => ($p['id'] ?? '') !== $id));
    if (count($portfolios) === $before) sendJson(['error' => 'Portfolio not found'], 404);
    writePortfolios($portfolios);
    sendJson(['message' => 'Portfolio deleted successfully', 'id' => $id]);
}

if ($action !== 'create') sendJson(['error' => 'Unknown action'], 400);

$name = trim($_POST['displayName'] ?? '');
if ($name === '') sendJson(['error' => 'Display name is required'], 400);

$portfolio = [
    'id'                 => uniqid('p'),
    'displayName'        => $name,
    'whatIEnjoy'         => trim($_POST['whatIEnjoy'] ?? ''),
    'whatIveTried'       => trim($_POST['whatIveTried'] ?? ''),
    'whatImCuriousAbout' => trim($_POST['whatImCuriousAbout'] ?? ''),
    'items'              => [],
];
$portfolios[] = $portfolio;
writePortfolios($portfolios);
sendJson($portfolio, 201);
