<?php

declare(strict_types=1);

require_once __DIR__ . "/config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

$input = json_decode(
    file_get_contents("php://input"),
    true
);

$tipoId = isset($input["tipo_appuntamento_id"])
    ? (int) $input["tipo_appuntamento_id"]
    : 0;

$slotId = isset($input["slot_id"])
    ? (int) $input["slot_id"]
    : 0;

$nomeCliente = trim(
    (string) ($input["nome_cliente"] ?? "")
);

$telefono = trim(
    (string) ($input["telefono"] ?? "")
);

$email = trim(
    (string) ($input["email"] ?? "")
);

$note = trim(
    (string) ($input["note"] ?? "")
);

if (
    $tipoId <= 0 ||
    $slotId <= 0 ||
    $nomeCliente === "" ||
    $telefono === ""
) {
    http_response_code(400);

    echo json_encode([
        "ok" => false,
        "errore" => "Dati obbligatori mancanti."
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    $pdo->beginTransaction();

    $stmtSlot = $pdo->prepare("
        SELECT
            id,
            tipo_appuntamento_id,
            data_appuntamento,
            ora_inizio,
            ora_fine,
            disponibile
        FROM slot_appuntamenti
        WHERE id = ?
        FOR UPDATE
    ");

    $stmtSlot->execute([$slotId]);

    $slot = $stmtSlot->fetch();

    if (!$slot) {
        throw new RuntimeException(
            "Slot non trovato."
        );
    }

    if ((int) $slot["tipo_appuntamento_id"] !== $tipoId) {
        throw new RuntimeException(
            "Lo slot non appartiene al servizio selezionato."
        );
    }

    if (!(bool) $slot["disponibile"]) {
        throw new RuntimeException(
            "L'orario selezionato non è più disponibile."
        );
    }

    $stmtCliente = $pdo->prepare("
        SELECT id
        FROM clienti
        WHERE telefono = ?
        LIMIT 1
    ");

    $stmtCliente->execute([$telefono]);

    $cliente = $stmtCliente->fetch();

    if ($cliente) {
        $clienteId = (int) $cliente["id"];

        $stmtAggiornaCliente = $pdo->prepare("
            UPDATE clienti
            SET
                nome = ?,
                email = ?,
                note = ?
            WHERE id = ?
        ");

        $stmtAggiornaCliente->execute([
            $nomeCliente,
            $email !== "" ? $email : null,
            $note !== "" ? $note : null,
            $clienteId
        ]);
    } else {
        $stmtNuovoCliente = $pdo->prepare("
            INSERT INTO clienti
            (
                nome,
                telefono,
                email,
                note
            )
            VALUES
            (?, ?, ?, ?)
        ");

        $stmtNuovoCliente->execute([
            $nomeCliente,
            $telefono,
            $email !== "" ? $email : null,
            $note !== "" ? $note : null
        ]);

        $clienteId = (int) $pdo->lastInsertId();
    }

    $stmtAppuntamento = $pdo->prepare("
        INSERT INTO appuntamenti
        (
            cliente_id,
            tipo_appuntamento_id,
            slot_id,
            nome_cliente,
            telefono,
            email,
            note,
            data_appuntamento,
            ora_inizio,
            ora_fine,
            stato
        )
        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Da confermare')
    ");

    $stmtAppuntamento->execute([
        $clienteId,
        $tipoId,
        $slotId,
        $nomeCliente,
        $telefono,
        $email !== "" ? $email : null,
        $note !== "" ? $note : null,
        $slot["data_appuntamento"],
        $slot["ora_inizio"],
        $slot["ora_fine"]
    ]);

    $appuntamentoId =
        (int) $pdo->lastInsertId();

    $stmtOccupaSlot = $pdo->prepare("
        UPDATE slot_appuntamenti
        SET disponibile = 0
        WHERE id = ?
    ");

    $stmtOccupaSlot->execute([$slotId]);

    $pdo->commit();

    echo json_encode([
        "ok" => true,
        "appuntamento_id" => $appuntamentoId,
        "messaggio" => "Appuntamento creato correttamente."
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);

    echo json_encode([
        "ok" => false,
        "errore" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}