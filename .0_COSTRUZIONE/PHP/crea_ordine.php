<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    risposta([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$articoloId = (int)($input["articolo_id"] ?? 0);
$varianteId = isset($input["variante_id"]) && $input["variante_id"] !== ""
    ? (int)$input["variante_id"]
    : null;

$quantita = max(1, (int)($input["quantita"] ?? 1));

$nome = trim($input["nome"] ?? "");
$cognome = trim($input["cognome"] ?? "");
$email = trim($input["email"] ?? "");
$telefono = trim($input["telefono"] ?? "");

$modalitaConsegna = trim($input["modalita_consegna"] ?? "Ritiro in negozio");
$indirizzo = trim($input["indirizzo"] ?? "");
$civico = trim($input["civico"] ?? "");
$cap = trim($input["cap"] ?? "");
$citta = trim($input["citta"] ?? "");
$provincia = strtoupper(trim($input["provincia"] ?? ""));

$note = trim($input["note"] ?? "");

if ($articoloId <= 0) {
    risposta([
        "ok" => false,
        "errore" => "Prodotto non valido."
    ], 400);
}

if ($nome === "" || $cognome === "") {
    risposta([
        "ok" => false,
        "errore" => "Nome e cognome sono obbligatori."
    ], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    risposta([
        "ok" => false,
        "errore" => "Inserisci un indirizzo email valido."
    ], 400);
}

if (!in_array($modalitaConsegna, ["Ritiro in negozio", "Spedizione"], true)) {
    risposta([
        "ok" => false,
        "errore" => "Modalità di consegna non valida."
    ], 400);
}

if ($modalitaConsegna === "Spedizione") {
    if (
        $indirizzo === "" ||
        $civico === "" ||
        $cap === "" ||
        $citta === "" ||
        $provincia === ""
    ) {
        risposta([
            "ok" => false,
            "errore" => "Completa tutti i dati per la spedizione."
        ], 400);
    }
}

try {
    $pdo->beginTransaction();

    // 1. Blocca il prodotto
    $stmt = $pdo->prepare("
        SELECT
            id,
            nome,
            marca,
            modello,
            prezzo,
            disponibile
        FROM articoli
        WHERE id = ?
        FOR UPDATE
    ");
    $stmt->execute([$articoloId]);
    $articolo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$articolo) {
        throw new Exception("Prodotto non trovato.");
    }

    if ((int)$articolo["disponibile"] !== 1) {
        throw new Exception("Il prodotto non è attualmente disponibile.");
    }

    // 2. Verifica eventuale variante e disponibilità
    $descrizioneVariante = null;

    if ($varianteId !== null) {
        $stmt = $pdo->prepare("
            SELECT
                id,
                articolo_id,
                taglia,
                misura,
                colore,
                quantita
            FROM varianti
            WHERE id = ?
              AND articolo_id = ?
            FOR UPDATE
        ");
        $stmt->execute([$varianteId, $articoloId]);
        $variante = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$variante) {
            throw new Exception("Variante non valida.");
        }

        if ((int)$variante["quantita"] < $quantita) {
            throw new Exception("Quantità richiesta non disponibile.");
        }

        $parti = array_filter([
            $variante["colore"] ?? null,
            $variante["taglia"] ?? null,
            $variante["misura"] ?? null
        ]);

        $descrizioneVariante = count($parti) > 0
            ? implode(" · ", $parti)
            : null;
    }

    // 3. Cerca una promozione valida sul prodotto
    $stmt = $pdo->prepare("
        SELECT
            id,
            sconto_percentuale
        FROM promozioni
        WHERE articolo_id = ?
          AND attiva = 1
          AND (data_inizio IS NULL OR data_inizio <= CURDATE())
          AND (data_fine IS NULL OR data_fine >= CURDATE())
        ORDER BY id DESC
        LIMIT 1
    ");
    $stmt->execute([$articoloId]);
    $promo = $stmt->fetch(PDO::FETCH_ASSOC);

    $prezzoUnitario = (float)$articolo["prezzo"];
    $scontoPercentuale = $promo
        ? (float)$promo["sconto_percentuale"]
        : 0.0;

    $prezzoFinale = round(
        $prezzoUnitario * (1 - ($scontoPercentuale / 100)),
        2
    );

    $subtotale = round($prezzoUnitario * $quantita, 2);
    $totaleFinaleRiga = round($prezzoFinale * $quantita, 2);
    $scontoTotale = round($subtotale - $totaleFinaleRiga, 2);

    // 4. Legge costo e soglia spedizione dalle impostazioni del negozio
    $stmt = $pdo->query("
        SELECT
            costo_spedizione,
            soglia_spedizione_gratuita
        FROM impostazioni_negozio
        ORDER BY id ASC
        LIMIT 1
    ");
    $impostazioni = $stmt->fetch(PDO::FETCH_ASSOC);

    $costoSpedizioneConfigurato = $impostazioni
        ? (float)$impostazioni["costo_spedizione"]
        : 7.90;

    $sogliaSpedizioneGratuita = $impostazioni
        ? (float)$impostazioni["soglia_spedizione_gratuita"]
        : 50.00;

    // 5. Applica la regola spedizione
    $speseSpedizione = 0.00;

    if ($modalitaConsegna === "Spedizione") {
        if ($totaleFinaleRiga < $sogliaSpedizioneGratuita) {
            $speseSpedizione = $costoSpedizioneConfigurato;
        }
    }

    $totaleOrdine = round(
        $totaleFinaleRiga + $speseSpedizione,
        2
    );

    // 6. Collega il cliente se esiste già con la stessa email
    $clienteId = null;

    $stmt = $pdo->prepare("
        SELECT id
        FROM clienti
        WHERE email = ?
        ORDER BY id ASC
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($cliente) {
        $clienteId = (int)$cliente["id"];
    }

    // 7. Genera numero ordine
    $numeroOrdine =
        "ORD-" .
        date("Ymd-His") .
        "-" .
        strtoupper(bin2hex(random_bytes(2)));

    // 8. Inserisce l'ordine
    $stmt = $pdo->prepare("
        INSERT INTO ordini_shop
        (
            cliente_id,
            numero_ordine,
            nome,
            cognome,
            email,
            telefono,
            modalita_consegna,
            indirizzo,
            civico,
            cap,
            citta,
            provincia,
            metodo_pagamento,
            stato_pagamento,
            stato_ordine,
            subtotale,
            sconto_totale,
            spese_spedizione,
            totale,
            note
        )
        VALUES
        (
            ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?, ?, ?,
            'In negozio',
            'Da pagare',
            'Ricevuto',
            ?, ?, ?, ?,
            ?
        )
    ");

    $stmt->execute([
        $clienteId,
        $numeroOrdine,
        $nome,
        $cognome,
        $email,
        $telefono !== "" ? $telefono : null,
        $modalitaConsegna,
        $modalitaConsegna === "Spedizione" ? $indirizzo : null,
        $modalitaConsegna === "Spedizione" ? $civico : null,
        $modalitaConsegna === "Spedizione" ? $cap : null,
        $modalitaConsegna === "Spedizione" ? $citta : null,
        $modalitaConsegna === "Spedizione" ? $provincia : null,
        $subtotale,
        $scontoTotale,
        $speseSpedizione,
        $totaleOrdine,
        $note !== "" ? $note : null
    ]);

    $ordineId = (int)$pdo->lastInsertId();

    // 9. Inserisce la riga ordine
    $stmt = $pdo->prepare("
        INSERT INTO righe_ordini_shop
        (
            ordine_id,
            articolo_id,
            variante_id,
            promozione_id,
            nome_articolo,
            marca,
            modello,
            descrizione_variante,
            quantita,
            prezzo_unitario,
            sconto_percentuale,
            prezzo_unitario_finale,
            totale_riga
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $ordineId,
        $articoloId,
        $varianteId,
        $promo ? (int)$promo["id"] : null,
        $articolo["nome"],
        $articolo["marca"] ?? null,
        $articolo["modello"] ?? null,
        $descrizioneVariante,
        $quantita,
        $prezzoUnitario,
        $scontoPercentuale,
        $prezzoFinale,
        $totaleFinaleRiga
    ]);

    // 10. Scala il magazzino se è stata scelta una variante
    if ($varianteId !== null) {
        $stmt = $pdo->prepare("
            UPDATE varianti
            SET quantita = quantita - ?
            WHERE id = ?
              AND articolo_id = ?
              AND quantita >= ?
        ");

        $stmt->execute([
            $quantita,
            $varianteId,
            $articoloId,
            $quantita
        ]);

        if ($stmt->rowCount() !== 1) {
            throw new Exception("Impossibile aggiornare la disponibilità.");
        }
    }

    $pdo->commit();

    risposta([
        "ok" => true,
        "ordine_id" => $ordineId,
        "numero_ordine" => $numeroOrdine,
        "totale_prodotti" => $totaleFinaleRiga,
        "spese_spedizione" => $speseSpedizione,
        "totale" => $totaleOrdine,
        "sconto_totale" => $scontoTotale,
        "in_promozione" => $promo ? true : false,
        "sconto_percentuale" => $scontoPercentuale,
        "spedizione_gratuita" =>
            $modalitaConsegna === "Ritiro in negozio"
                ? true
                : ($speseSpedizione == 0.00),
        "soglia_spedizione_gratuita" => $sogliaSpedizioneGratuita,
        "messaggio" => "Ordine registrato correttamente."
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    risposta([
        "ok" => false,
        "errore" => $e->getMessage()
    ], 400);
}
