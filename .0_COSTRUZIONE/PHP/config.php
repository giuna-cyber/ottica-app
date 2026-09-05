<?php

declare(strict_types=1);

/* =========================================================
   CORS
========================================================= */

$origine = $_SERVER["HTTP_ORIGIN"] ?? "";

$originiConsentite = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://ottica-vision.vercel.app"
];

if (in_array($origine, $originiConsentite, true)) {
    header("Access-Control-Allow-Origin: " . $origine);
} else {
    header("Access-Control-Allow-Origin: *");
}

header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-API-Key");
header("Access-Control-Max-Age: 86400");
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

/* =========================================================
   PREFLIGHT
========================================================= */

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

/* =========================================================
   DATABASE
========================================================= */

$dbHost = "31.11.39.231";
$dbPort = 3306;
$dbName = "Sql1955419_2";
$dbUser = "Sql1955419";
$dbPass = "DBAgentiPlus_2026";

try {
    $pdo = new PDO(
        "mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4",
        $dbUser,
        $dbPass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode(
        [
            "ok" => false,
            "errore" => "Errore di connessione al database."
        ],
        JSON_UNESCAPED_UNICODE
    );

    exit;
}