<?php
require_once __DIR__ . "/config.php";

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
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
                p.creato_il,
                p.aggiornato_il,
                a.nome AS articolo_nome
            FROM promozioni p
            LEFT JOIN articoli a
                ON a.id = p.articolo_id
            ORDER BY p.id DESC
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
            $riga["attiva"] = (int)$riga["attiva"];
        }

        risposta([
            "ok" => true,
            "promozioni" => $righe
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore nel caricamento delle promozioni."
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

if ($azione === "salva") {
    $id = (int)($input["id"] ?? 0);
    $titolo = trim($input["titolo"] ?? "");
    $descrizione = trim($input["descrizione"] ?? "");
    $immagineUrl = trim($input["immagine_url"] ?? "");
    $sconto = $input["sconto_percentuale"] ?? null;
    $articoloId = $input["articolo_id"] ?? null;
    $dataInizio = trim($input["data_inizio"] ?? "");
    $dataFine = trim($input["data_fine"] ?? "");
    $attiva = (int)($input["attiva"] ?? 1);

    if ($titolo === "") {
        risposta([
            "ok" => false,
            "errore" => "Il titolo è obbligatorio."
        ], 400);
    }

    $sconto = $sconto === "" || $sconto === null
        ? null
        : (float)$sconto;

    $articoloId = $articoloId === "" || $articoloId === null
        ? null
        : (int)$articoloId;

    $dataInizio = $dataInizio === "" ? null : $dataInizio;
    $dataFine = $dataFine === "" ? null : $dataFine;
    $immagineUrl = $immagineUrl === "" ? null : $immagineUrl;
    $descrizione = $descrizione === "" ? null : $descrizione;

    if ($sconto !== null && ($sconto < 0 || $sconto > 100)) {
        risposta([
            "ok" => false,
            "errore" => "Lo sconto deve essere compreso tra 0 e 100."
        ], 400);
    }

    if ($dataInizio !== null && $dataFine !== null && $dataFine < $dataInizio) {
        risposta([
            "ok" => false,
            "errore" => "La data fine non può essere precedente alla data inizio."
        ], 400);
    }

    try {
        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE promozioni
                SET
                    titolo = ?,
                    descrizione = ?,
                    immagine_url = ?,
                    sconto_percentuale = ?,
                    articolo_id = ?,
                    data_inizio = ?,
                    data_fine = ?,
                    attiva = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $titolo,
                $descrizione,
                $immagineUrl,
                $sconto,
                $articoloId,
                $dataInizio,
                $dataFine,
                $attiva,
                $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO promozioni
                (
                    titolo,
                    descrizione,
                    immagine_url,
                    sconto_percentuale,
                    articolo_id,
                    data_inizio,
                    data_fine,
                    attiva
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $titolo,
                $descrizione,
                $immagineUrl,
                $sconto,
                $articoloId,
                $dataInizio,
                $dataFine,
                $attiva
            ]);

            $id = (int)$pdo->lastInsertId();
        }

        risposta([
            "ok" => true,
            "id" => $id,
            "messaggio" => "Promozione salvata correttamente."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante il salvataggio della promozione."
        ], 500);
    }
}

if ($azione === "attiva") {
    $id = (int)($input["id"] ?? 0);
    $attiva = (int)($input["attiva"] ?? 0);

    if ($id <= 0 || !in_array($attiva, [0, 1], true)) {
        risposta([
            "ok" => false,
            "errore" => "Dati non validi."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE promozioni
            SET attiva = ?
            WHERE id = ?
        ");

        $stmt->execute([$attiva, $id]);

        risposta([
            "ok" => true,
            "messaggio" => "Stato promozione aggiornato."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante l'aggiornamento."
        ], 500);
    }
}

if ($azione === "elimina") {
    $id = (int)($input["id"] ?? 0);

    if ($id <= 0) {
        risposta([
            "ok" => false,
            "errore" => "ID promozione non valido."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            DELETE FROM promozioni
            WHERE id = ?
        ");

        $stmt->execute([$id]);

        risposta([
            "ok" => true,
            "messaggio" => "Promozione eliminata."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante l'eliminazione."
        ], 500);
    }
}

risposta([
    "ok" => false,
    "errore" => "Azione non valida."
], 400);
