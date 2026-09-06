<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function out($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->query("
            SELECT id, nome, descrizione, durata_minuti, attivo
            FROM tipi_appuntamento
            ORDER BY attivo DESC, nome ASC
        ");

        $righe = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($righe as &$riga) {
            $riga["id"] = (int)$riga["id"];
            $riga["durata_minuti"] = (int)$riga["durata_minuti"];
            $riga["attivo"] = (int)$riga["attivo"];
        }

        out(["ok" => true, "tipi" => $righe]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore caricamento tipi appuntamento."], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out(["ok" => false, "errore" => "Metodo non consentito."], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$azione = trim($input["azione"] ?? "");

if ($azione === "crea") {
    $nome = trim($input["nome"] ?? "");
    $descrizione = trim($input["descrizione"] ?? "");
    $durata = (int)($input["durata_minuti"] ?? 0);

    if ($nome === "" || $durata < 5) {
        out(["ok" => false, "errore" => "Inserisci nome e durata valida."], 400);
    }

    try {
        $check = $pdo->prepare("
            SELECT COUNT(*)
            FROM tipi_appuntamento
            WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
        ");
        $check->execute([$nome]);

        if ((int)$check->fetchColumn() > 0) {
            out(["ok" => false, "errore" => "Esiste già un tipo con questo nome."], 409);
        }

        $stmt = $pdo->prepare("
            INSERT INTO tipi_appuntamento
            (nome, descrizione, durata_minuti, attivo)
            VALUES (?, ?, ?, 1)
        ");
        $stmt->execute([
            $nome,
            $descrizione !== "" ? $descrizione : null,
            $durata
        ]);

        out(["ok" => true, "messaggio" => "Tipo appuntamento aggiunto."]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante la creazione."], 500);
    }
}

if ($azione === "modifica") {
    $id = (int)($input["id"] ?? 0);
    $nome = trim($input["nome"] ?? "");
    $descrizione = trim($input["descrizione"] ?? "");
    $durata = (int)($input["durata_minuti"] ?? 0);

    if ($id <= 0 || $nome === "" || $durata < 5) {
        out(["ok" => false, "errore" => "Dati non validi."], 400);
    }

    try {
        $check = $pdo->prepare("
            SELECT COUNT(*)
            FROM tipi_appuntamento
            WHERE LOWER(TRIM(nome)) = LOWER(TRIM(?))
              AND id <> ?
        ");
        $check->execute([$nome, $id]);

        if ((int)$check->fetchColumn() > 0) {
            out(["ok" => false, "errore" => "Esiste già un altro tipo con questo nome."], 409);
        }

        $stmt = $pdo->prepare("
            UPDATE tipi_appuntamento
            SET nome = ?, descrizione = ?, durata_minuti = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $nome,
            $descrizione !== "" ? $descrizione : null,
            $durata,
            $id
        ]);

        out(["ok" => true, "messaggio" => "Tipo appuntamento aggiornato."]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante la modifica."], 500);
    }
}

if ($azione === "stato") {
    $id = (int)($input["id"] ?? 0);
    $attivo = (int)($input["attivo"] ?? 0);

    if ($id <= 0) {
        out(["ok" => false, "errore" => "Tipo non valido."], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE tipi_appuntamento
            SET attivo = ?
            WHERE id = ?
        ");
        $stmt->execute([$attivo === 1 ? 1 : 0, $id]);

        out(["ok" => true, "messaggio" => "Stato aggiornato."]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante l'aggiornamento."], 500);
    }
}

if ($azione === "elimina") {
    $id = (int)($input["id"] ?? 0);

    if ($id <= 0) {
        out(["ok" => false, "errore" => "Tipo non valido."], 400);
    }

    try {
        $check = $pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM appuntamenti WHERE tipo_appuntamento_id = ?) +
                (SELECT COUNT(*) FROM slot_appuntamenti WHERE tipo_appuntamento_id = ?)
        ");
        $check->execute([$id, $id]);

        if ((int)$check->fetchColumn() > 0) {
            out([
                "ok" => false,
                "errore" => "Questo tipo è già utilizzato. Disattivalo invece di eliminarlo."
            ], 409);
        }

        $stmt = $pdo->prepare("
            DELETE FROM tipi_appuntamento
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        out(["ok" => true, "messaggio" => "Tipo appuntamento eliminato."]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante l'eliminazione."], 500);
    }
}

out(["ok" => false, "errore" => "Azione non valida."], 400);
