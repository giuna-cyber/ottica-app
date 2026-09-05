<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);

$clienteId = (int)($input["cliente_id"] ?? 0);
$passwordAttuale = $input["password_attuale"] ?? "";
$nuovaPassword = $input["nuova_password"] ?? "";

if ($clienteId <= 0 || $passwordAttuale === "" || $nuovaPassword === "") {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Compila tutti i campi password."
    ]);
    exit;
}

if (strlen($nuovaPassword) < 8) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "La nuova password deve contenere almeno 8 caratteri."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, password_hash
        FROM clienti
        WHERE id = ?
        LIMIT 1
    ");
    $stmt->execute([$clienteId]);

    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        http_response_code(404);
        echo json_encode([
            "ok" => false,
            "errore" => "Cliente non trovato."
        ]);
        exit;
    }

    if (
        empty($cliente["password_hash"]) ||
        !password_verify($passwordAttuale, $cliente["password_hash"])
    ) {
        http_response_code(401);
        echo json_encode([
            "ok" => false,
            "errore" => "La password attuale non è corretta."
        ]);
        exit;
    }

    if (password_verify($nuovaPassword, $cliente["password_hash"])) {
        http_response_code(400);
        echo json_encode([
            "ok" => false,
            "errore" => "La nuova password deve essere diversa da quella attuale."
        ]);
        exit;
    }

    $nuovoHash = password_hash($nuovaPassword, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        UPDATE clienti
        SET password_hash = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $nuovoHash,
        $clienteId
    ]);

    echo json_encode([
        "ok" => true,
        "messaggio" => "Password aggiornata correttamente."
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante l'aggiornamento della password."
    ]);
}
