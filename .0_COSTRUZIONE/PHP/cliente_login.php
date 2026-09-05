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

$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($email === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Inserisci email e password."
    ]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT
            id,
            nome,
            cognome,
            telefono,
            email,
            password_hash
        FROM clienti
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);

    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (
        !$cliente ||
        empty($cliente["password_hash"]) ||
        !password_verify($password, $cliente["password_hash"])
    ) {
        http_response_code(401);
        echo json_encode([
            "ok" => false,
            "errore" => "Credenziali non valide."
        ]);
        exit;
    }

    echo json_encode([
        "ok" => true,
        "cliente" => [
            "id" => (int)$cliente["id"],
            "nome" => $cliente["nome"],
            "cognome" => $cliente["cognome"],
            "telefono" => $cliente["telefono"],
            "email" => $cliente["email"]
        ]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore interno del server."
    ]);
}
