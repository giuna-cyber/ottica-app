<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

function caricaOrdini($pdo) {
    $stmt = $pdo->query("
        SELECT
            o.id,
            o.cliente_id,
            o.numero_ordine,
            o.nome,
            o.cognome,
            o.email,
            o.telefono,
            o.modalita_consegna,
            o.indirizzo,
            o.civico,
            o.cap,
            o.citta,
            o.provincia,
            o.metodo_pagamento,
            o.stato_pagamento,
            o.stato_ordine,
            o.subtotale,
            o.sconto_totale,
            o.spese_spedizione,
            o.totale,
            o.note,
            o.creato_il,
            o.aggiornato_il
        FROM ordini_shop o
        ORDER BY o.id DESC
    ");

    $ordini = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtRighe = $pdo->prepare("
        SELECT
            r.id,
            r.articolo_id,
            r.variante_id,
            r.promozione_id,
            r.nome_articolo,
            r.marca,
            r.modello,
            r.descrizione_variante,
            r.quantita,
            r.prezzo_unitario,
            r.sconto_percentuale,
            r.prezzo_unitario_finale,
            r.totale_riga
        FROM righe_ordini_shop r
        WHERE r.ordine_id = ?
        ORDER BY r.id ASC
    ");

    foreach ($ordini as &$ordine) {
        $ordine["id"] = (int)$ordine["id"];
        $ordine["cliente_id"] = $ordine["cliente_id"] !== null
            ? (int)$ordine["cliente_id"]
            : null;

        foreach (
            [
                "subtotale",
                "sconto_totale",
                "spese_spedizione",
                "totale"
            ] as $campo
        ) {
            $ordine[$campo] = (float)$ordine[$campo];
        }

        $stmtRighe->execute([$ordine["id"]]);
        $righe = $stmtRighe->fetchAll(PDO::FETCH_ASSOC);

        foreach ($righe as &$riga) {
            $riga["id"] = (int)$riga["id"];
            $riga["articolo_id"] = (int)$riga["articolo_id"];
            $riga["variante_id"] = $riga["variante_id"] !== null
                ? (int)$riga["variante_id"]
                : null;
            $riga["promozione_id"] = $riga["promozione_id"] !== null
                ? (int)$riga["promozione_id"]
                : null;
            $riga["quantita"] = (int)$riga["quantita"];
            $riga["prezzo_unitario"] = (float)$riga["prezzo_unitario"];
            $riga["sconto_percentuale"] = (float)$riga["sconto_percentuale"];
            $riga["prezzo_unitario_finale"] = (float)$riga["prezzo_unitario_finale"];
            $riga["totale_riga"] = (float)$riga["totale_riga"];
        }

        $ordine["righe"] = $righe;
    }

    return $ordini;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        risposta([
            "ok" => true,
            "ordini" => caricaOrdini($pdo)
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore nel caricamento degli ordini."
        ], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    risposta([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$azione = trim($input["azione"] ?? "");

if ($azione === "stato_ordine") {
    $id = (int)($input["id"] ?? 0);
    $stato = trim($input["stato_ordine"] ?? "");

    $statiConsentiti = [
        "Ricevuto",
        "In lavorazione",
        "Pronto per il ritiro",
        "Spedito",
        "Completato",
        "Annullato"
    ];

    if ($id <= 0 || !in_array($stato, $statiConsentiti, true)) {
        risposta([
            "ok" => false,
            "errore" => "Dati ordine non validi."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE ordini_shop
            SET stato_ordine = ?
            WHERE id = ?
        ");
        $stmt->execute([$stato, $id]);

        risposta([
            "ok" => true,
            "messaggio" => "Stato ordine aggiornato."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante l'aggiornamento dello stato."
        ], 500);
    }
}

if ($azione === "stato_pagamento") {
    $id = (int)($input["id"] ?? 0);
    $stato = trim($input["stato_pagamento"] ?? "");

    $statiConsentiti = [
        "Da pagare",
        "Pagato",
        "Rimborsato"
    ];

    if ($id <= 0 || !in_array($stato, $statiConsentiti, true)) {
        risposta([
            "ok" => false,
            "errore" => "Dati pagamento non validi."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE ordini_shop
            SET stato_pagamento = ?
            WHERE id = ?
        ");
        $stmt->execute([$stato, $id]);

        risposta([
            "ok" => true,
            "messaggio" => "Stato pagamento aggiornato."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante l'aggiornamento del pagamento."
        ], 500);
    }
}

risposta([
    "ok" => false,
    "errore" => "Azione non valida."
], 400);
