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

$nome = trim($input["nome"] ?? "");
$cognome = trim($input["cognome"] ?? "");
$telefono = trim($input["telefono"] ?? "");
$email = trim($input["email"] ?? "");
$password = $input["password"] ?? "";

if ($nome === "" || $telefono === "" || $email === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Compila nome, telefono, email e password."
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Email non valida."
    ]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "La password deve contenere almeno 6 caratteri."
    ]);
    exit;
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id, password_hash
        FROM clienti
        WHERE email = ?
        LIMIT 1
        FOR UPDATE
    ");
    $stmt->execute([$email]);
    $esistente = $stmt->fetch(PDO::FETCH_ASSOC);

    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($esistente) {
        if (!empty($esistente["password_hash"])) {
            $pdo->rollBack();

            http_response_code(409);
            echo json_encode([
                "ok" => false,
                "errore" => "Esiste già un account associato a questa email."
            ]);
            exit;
        }

        $stmt = $pdo->prepare("
            UPDATE clienti
            SET nome = ?,
                cognome = ?,
                telefono = ?,
                password_hash = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $nome,
            $cognome !== "" ? $cognome : null,
            $telefono,
            $hash,
            (int)$esistente["id"]
        ]);

        $clienteId = (int)$esistente["id"];
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO clienti
            (
                nome,
                cognome,
                telefono,
                email,
                password_hash
            )
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $nome,
            $cognome !== "" ? $cognome : null,
            $telefono,
            $email,
            $hash
        ]);

        $clienteId = (int)$pdo->lastInsertId();
    }

    $pdo->commit();

    echo json_encode([
        "ok" => true,
        "cliente" => [
            "id" => $clienteId,
            "nome" => $nome,
            "cognome" => $cognome !== "" ? $cognome : null,
            "telefono" => $telefono,
            "email" => $email
        ]
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
