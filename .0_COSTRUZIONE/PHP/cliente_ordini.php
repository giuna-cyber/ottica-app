<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "GET") {
    risposta([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], 405);
}

$clienteId = (int)($_GET["cliente_id"] ?? 0);

if ($clienteId <= 0) {
    risposta([
        "ok" => false,
        "errore" => "Cliente non valido."
    ], 400);
}

try {
    $stmt = $pdo->prepare("
        SELECT
            o.id,
            o.numero_ordine,
            o.modalita_consegna,
            o.metodo_pagamento,
            o.stato_pagamento,
            o.stato_ordine,
            o.subtotale,
            o.sconto_totale,
            o.spese_spedizione,
            o.totale,
            o.creato_il
        FROM ordini_shop o
        WHERE o.cliente_id = ?
        ORDER BY o.id DESC
    ");

    $stmt->execute([$clienteId]);
    $ordini = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtRighe = $pdo->prepare("
        SELECT
            r.id,
            r.articolo_id,
            r.nome_articolo,
            r.marca,
            r.modello,
            r.descrizione_variante,
            r.quantita,
            r.prezzo_unitario,
            r.sconto_percentuale,
            r.prezzo_unitario_finale,
            r.totale_riga,
            a.immagine_url
        FROM righe_ordini_shop r
        LEFT JOIN articoli a
            ON a.id = r.articolo_id
        WHERE r.ordine_id = ?
        ORDER BY r.id ASC
    ");

    foreach ($ordini as &$ordine) {
        $ordine["id"] = (int)$ordine["id"];
        $ordine["subtotale"] = (float)$ordine["subtotale"];
        $ordine["sconto_totale"] = (float)$ordine["sconto_totale"];
        $ordine["spese_spedizione"] = (float)$ordine["spese_spedizione"];
        $ordine["totale"] = (float)$ordine["totale"];

        $stmtRighe->execute([$ordine["id"]]);
        $righe = $stmtRighe->fetchAll(PDO::FETCH_ASSOC);

        foreach ($righe as &$riga) {
            $riga["id"] = (int)$riga["id"];
            $riga["articolo_id"] = (int)$riga["articolo_id"];
            $riga["quantita"] = (int)$riga["quantita"];
            $riga["prezzo_unitario"] = (float)$riga["prezzo_unitario"];
            $riga["sconto_percentuale"] = (float)$riga["sconto_percentuale"];
            $riga["prezzo_unitario_finale"] = (float)$riga["prezzo_unitario_finale"];
            $riga["totale_riga"] = (float)$riga["totale_riga"];
        }

        $ordine["righe"] = $righe;
    }

    risposta([
        "ok" => true,
        "ordini" => $ordini
    ]);
} catch (Throwable $e) {
    risposta([
        "ok" => false,
        "errore" => "Errore nel caricamento degli ordini cliente."
    ], 500);
}
