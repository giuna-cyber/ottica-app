<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

try {
    $stmt = $pdo->query("
        SELECT
            costo_spedizione,
            soglia_spedizione_gratuita
        FROM impostazioni_negozio
        ORDER BY id ASC
        LIMIT 1
    ");

    $impostazioni = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$impostazioni) {
        $impostazioni = [
            "costo_spedizione" => 7.90,
            "soglia_spedizione_gratuita" => 50.00
        ];
    }

    echo json_encode([
        "ok" => true,
        "costo_spedizione" => (float)$impostazioni["costo_spedizione"],
        "soglia_spedizione_gratuita" => (float)$impostazioni["soglia_spedizione_gratuita"]
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "errore" => "Errore nel caricamento delle impostazioni di spedizione."
    ]);
}
