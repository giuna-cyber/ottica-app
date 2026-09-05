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

$username = trim($input["username"] ?? "");
$password = $input["password"] ?? "";

if ($username === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Inserisci username e password."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, username, password_hash, attivo
        FROM utenti_admin
        WHERE username = ?
        LIMIT 1
    ");

    $stmt->execute([$username]);
    $utente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$utente || (int)$utente["attivo"] !== 1) {
        http_response_code(401);
        echo json_encode([
            "ok" => false,
            "errore" => "Credenziali non valide."
        ]);
        exit;
    }

    if (!password_verify($password, $utente["password_hash"])) {
        http_response_code(401);
        echo json_encode([
            "ok" => false,
            "errore" => "Credenziali non valide."
        ]);
        exit;
    }

    echo json_encode([
        "ok" => true,
        "utente" => [
            "id" => (int)$utente["id"],
            "username" => $utente["username"]
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore interno del server."
    ]);
}