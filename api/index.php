<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple API router for Namecheap hosting
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/api', '', $path);

// Basic routing
switch ($path) {
    case '/health':
        echo json_encode([
            'status' => 'ok',
            'timestamp' => date('c'),
            'environment' => 'production'
        ]);
        break;
        
    case '/namecheap/status':
        // Proxy to external Node.js API or implement directly
        echo json_encode([
            'connected' => true,
            'timestamp' => date('c'),
            'message' => 'Namecheap API ready'
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
}
?>
