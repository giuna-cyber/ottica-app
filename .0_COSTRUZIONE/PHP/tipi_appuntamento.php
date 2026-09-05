<?php

declare(strict_types=1);

require_once __DIR__ . "/config.php";

try {
    $stmt = $pdo->query("
        SELECT
            id,
            nome,
            descrizione,
            durata_minuti
        FROM tipi_appuntamento
        WHERE attivo = 1
        ORDER BY nome ASC
    ");

    $tipi = $stmt->fetchAll();

    echo json_encode([
        "ok" => true,
        "tipi" => $tipi
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante il caricamento dei servizi."
    ], JSON_UNESCAPED_UNICODE);
}