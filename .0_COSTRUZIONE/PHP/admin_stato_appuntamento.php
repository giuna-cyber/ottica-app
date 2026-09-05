<?php
require_once __DIR__ . "/config.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$id = (int)($input["id"] ?? 0);
$stato = trim($input["stato"] ?? "");

$statiConsentiti = [
    "Da confermare",
    "Confermato",
    "Annullato"
];

if ($id <= 0) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "ID appuntamento non valido."
    ]);
    exit;
}

if (!in_array($stato, $statiConsentiti, true)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Stato non valido."
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id, slot_id
        FROM appuntamenti
        WHERE id = ?
        FOR UPDATE
    ");

    $stmt->execute([$id]);
    $appuntamento = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$appuntamento) {
        $pdo->rollBack();

        http_response_code(404);
        echo json_encode([
            "ok" => false,
            "errore" => "Appuntamento non trovato."
        ]);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE appuntamenti
        SET stato = ?
        WHERE id = ?
    ");

    $stmt->execute([$stato, $id]);

    if ($appuntamento["slot_id"] !== null) {
        $disponibile = $stato === "Annullato" ? 1 : 0;

        $stmt = $pdo->prepare("
            UPDATE slot_appuntamenti
            SET disponibile = ?
            WHERE id = ?
        ");

        $stmt->execute([
            $disponibile,
            (int)$appuntamento["slot_id"]
        ]);
    }

    $pdo->commit();

    echo json_encode([
        "ok" => true,
        "messaggio" => "Stato appuntamento aggiornato."
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore interno del server."
    ]);
}
