<?php

declare(strict_types=1);

require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

$tipoId = isset($_GET["tipo_id"])
    ? (int) $_GET["tipo_id"]
    : 0;

if ($tipoId <= 0) {
    http_response_code(400);

    echo json_encode([
        "ok" => false,
        "errore" => "Tipo appuntamento non valido."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    /*
     * Restituiamo TUTTI gli slot futuri del servizio,
     * sia liberi sia occupati.
     *
     * disponibile = 1  -> libero
     * disponibile = 0  -> occupato
     */
    $stmt = $pdo->prepare("
        SELECT
            id,
            tipo_appuntamento_id,
            data_appuntamento,
            ora_inizio,
            ora_fine,
            disponibile
        FROM slot_appuntamenti
        WHERE tipo_appuntamento_id = ?
          AND data_appuntamento >= CURDATE()
        ORDER BY data_appuntamento ASC, ora_inizio ASC
    ");

    $stmt->execute([$tipoId]);

    $righe = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $slot = array_map(
        static function (array $riga): array {
            $libero = (int) $riga["disponibile"] === 1;

            return [
                "id" => (int) $riga["id"],
                "tipo_appuntamento_id" => (int) $riga["tipo_appuntamento_id"],
                "data_appuntamento" => $riga["data_appuntamento"],
                "ora_inizio" => $riga["ora_inizio"],
                "ora_fine" => $riga["ora_fine"],
                "disponibile" => $libero,
                "occupato" => !$libero
            ];
        },
        $righe
    );

    echo json_encode([
        "ok" => true,
        "slot" => $slot
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante il caricamento degli orari."
    ], JSON_UNESCAPED_UNICODE);
}
