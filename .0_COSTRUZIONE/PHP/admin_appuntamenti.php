<?php
require_once __DIR__ . "/config.php";

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT
            a.id,
            a.cliente_id,
            a.tipo_appuntamento_id,
            a.slot_id,
            a.nome_cliente,
            a.telefono,
            a.email,
            a.note,
            a.data_appuntamento,
            a.ora_inizio,
            a.ora_fine,
            a.stato,
            a.creato_il,
            a.aggiornato_il,
            t.nome AS tipo_appuntamento
        FROM appuntamenti a
        INNER JOIN tipi_appuntamento t
            ON t.id = a.tipo_appuntamento_id
        ORDER BY
            a.data_appuntamento ASC,
            a.ora_inizio ASC,
            a.id ASC
    ");

    $righe = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($righe as &$riga) {
        $riga["id"] = (int)$riga["id"];
        $riga["cliente_id"] = $riga["cliente_id"] !== null
            ? (int)$riga["cliente_id"]
            : null;
        $riga["tipo_appuntamento_id"] = (int)$riga["tipo_appuntamento_id"];
        $riga["slot_id"] = $riga["slot_id"] !== null
            ? (int)$riga["slot_id"]
            : null;
    }

    echo json_encode([
        "ok" => true,
        "appuntamenti" => $righe
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore interno del server."
    ]);
}
