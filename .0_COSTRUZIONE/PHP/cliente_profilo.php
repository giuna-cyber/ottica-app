<?php
require_once __DIR__ . "/config.php";

function out($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $clienteId = isset($_GET["cliente_id"]) ? (int)$_GET["cliente_id"] : 0;

    if ($clienteId <= 0) {
        out([
            "ok" => false,
            "errore" => "Cliente non valido."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT
                id,
                nome,
                cognome,
                telefono,
                email,
                note,
                creato_il,
                aggiornato_il
            FROM clienti
            WHERE id = ?
            LIMIT 1
        ");
        $stmt->execute([$clienteId]);
        $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$cliente) {
            out([
                "ok" => false,
                "errore" => "Cliente non trovato."
            ], 404);
        }

        $stmt = $pdo->prepare("
            SELECT
                a.id,
                a.nome_cliente,
                a.telefono,
                a.email,
                a.note,
                a.data_appuntamento,
                a.ora_inizio,
                a.ora_fine,
                a.stato,
                t.nome AS tipo_appuntamento
            FROM appuntamenti a
            INNER JOIN tipi_appuntamento t
                ON t.id = a.tipo_appuntamento_id
            WHERE a.cliente_id = ?
               OR (
                    a.cliente_id IS NULL
                    AND a.email IS NOT NULL
                    AND a.email = ?
               )
            ORDER BY
                a.data_appuntamento DESC,
                a.ora_inizio DESC
        ");
        $stmt->execute([
            $clienteId,
            $cliente["email"]
        ]);

        $appuntamenti = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($appuntamenti as &$app) {
            $app["id"] = (int)$app["id"];
        }

        out([
            "ok" => true,
            "cliente" => [
                "id" => (int)$cliente["id"],
                "nome" => $cliente["nome"],
                "cognome" => $cliente["cognome"],
                "telefono" => $cliente["telefono"],
                "email" => $cliente["email"],
                "note" => $cliente["note"]
            ],
            "appuntamenti" => $appuntamenti
        ]);
    } catch (Throwable $e) {
        out([
            "ok" => false,
            "errore" => "Errore nel caricamento del profilo."
        ], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $input = json_decode(file_get_contents("php://input"), true);

    $clienteId = (int)($input["cliente_id"] ?? 0);
    $nome = trim($input["nome"] ?? "");
    $cognome = trim($input["cognome"] ?? "");
    $telefono = trim($input["telefono"] ?? "");
    $email = trim($input["email"] ?? "");

    if ($clienteId <= 0 || $nome === "" || $telefono === "" || $email === "") {
        out([
            "ok" => false,
            "errore" => "Compila tutti i campi obbligatori."
        ], 400);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        out([
            "ok" => false,
            "errore" => "Email non valida."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*)
            FROM clienti
            WHERE email = ?
              AND id <> ?
        ");
        $stmt->execute([$email, $clienteId]);

        if ((int)$stmt->fetchColumn() > 0) {
            out([
                "ok" => false,
                "errore" => "Questa email è già utilizzata da un altro cliente."
            ], 409);
        }

        $stmt = $pdo->prepare("
            UPDATE clienti
            SET
                nome = ?,
                cognome = ?,
                telefono = ?,
                email = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $nome,
            $cognome !== "" ? $cognome : null,
            $telefono,
            $email,
            $clienteId
        ]);

        out([
            "ok" => true,
            "messaggio" => "Profilo aggiornato."
        ]);
    } catch (Throwable $e) {
        out([
            "ok" => false,
            "errore" => "Errore durante l'aggiornamento del profilo."
        ], 500);
    }
}

out([
    "ok" => false,
    "errore" => "Metodo non consentito."
], 405);
