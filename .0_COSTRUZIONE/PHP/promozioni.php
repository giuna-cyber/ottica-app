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
            p.id,
            p.titolo,
            p.descrizione,
            p.immagine_url,
            p.sconto_percentuale,
            p.articolo_id,
            p.data_inizio,
            p.data_fine,
            p.attiva,
            a.nome AS articolo_nome,
            a.immagine_url AS articolo_immagine,
            a.prezzo AS articolo_prezzo
        FROM promozioni p
        LEFT JOIN articoli a
            ON a.id = p.articolo_id
        WHERE p.attiva = 1
          AND (p.data_inizio IS NULL OR p.data_inizio <= CURDATE())
          AND (p.data_fine IS NULL OR p.data_fine >= CURDATE())
        ORDER BY
            p.data_inizio DESC,
            p.id DESC
    ");

    $righe = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($righe as &$riga) {
        $riga["id"] = (int)$riga["id"];
        $riga["articolo_id"] = $riga["articolo_id"] !== null
            ? (int)$riga["articolo_id"]
            : null;

        $riga["sconto_percentuale"] = $riga["sconto_percentuale"] !== null
            ? (float)$riga["sconto_percentuale"]
            : null;

        $riga["articolo_prezzo"] = $riga["articolo_prezzo"] !== null
            ? (float)$riga["articolo_prezzo"]
            : null;

        $riga["attiva"] = (int)$riga["attiva"];
    }

    echo json_encode([
        "ok" => true,
        "promozioni" => $righe
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante il caricamento delle promozioni."
    ]);
}
