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

$email = trim($input["email"] ?? "");

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Inserisci un indirizzo email valido."
    ]);
    exit;
}

function generaPasswordTemporanea($lunghezza = 10) {
    // Niente caratteri ambigui: O, 0, I, l, 1
    $caratteri = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    $password = "";

    $max = strlen($caratteri) - 1;

    for ($i = 0; $i < $lunghezza; $i++) {
        $password .= $caratteri[random_int(0, $max)];
    }

    return $password;
}

try {
    $stmt = $pdo->prepare("
        SELECT id, nome, cognome, email
        FROM clienti
        WHERE LOWER(TRIM(email)) = LOWER(TRIM(?))
        LIMIT 1
    ");
    $stmt->execute([$email]);

    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$cliente) {
        http_response_code(404);
        echo json_encode([
            "ok" => false,
            "errore" => "Nessun account trovato con questa email."
        ]);
        exit;
    }

    $passwordTemporanea = generaPasswordTemporanea(10);
    $hash = password_hash($passwordTemporanea, PASSWORD_DEFAULT);

    if ($hash === false) {
        throw new Exception("Impossibile generare l'hash della password.");
    }

    $stmt = $pdo->prepare("
        UPDATE clienti
        SET password_hash = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $hash,
        (int)$cliente["id"]
    ]);

    if ($stmt->rowCount() < 1) {
        // Può anche essere 0 in alcuni casi, quindi verifichiamo dal DB.
        $check = $pdo->prepare("
            SELECT password_hash
            FROM clienti
            WHERE id = ?
            LIMIT 1
        ");
        $check->execute([(int)$cliente["id"]]);
        $salvato = $check->fetchColumn();
    } else {
        $salvato = $hash;
    }

    if (
        !$salvato ||
        !password_verify($passwordTemporanea, $salvato)
    ) {
        throw new Exception("Verifica della nuova password fallita.");
    }

    $nomeCliente = trim(
        ($cliente["nome"] ?? "") . " " .
        ($cliente["cognome"] ?? "")
    );

    $oggetto = "Ottica App - Recupero password";

    $messaggio =
        "Ciao " . ($nomeCliente !== "" ? $nomeCliente : "Cliente") . ",\n\n" .
        "hai richiesto il recupero della password di Ottica App.\n\n" .
        "La tua nuova password temporanea e':\n\n" .
        $passwordTemporanea . "\n\n" .
        "Copiala esattamente, rispettando maiuscole e minuscole.\n" .
        "Dopo l'accesso puoi cambiarla dalla sezione Profilo.\n\n" .
        "Ottica App";

    $headers = [];
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/plain; charset=UTF-8";
    $headers[] = "From: Ottica App <noreply@agentiplusdb.net>";
    $headers[] = "Reply-To: noreply@agentiplusdb.net";

    $inviata = mail(
        $cliente["email"],
        $oggetto,
        $messaggio,
        implode("\r\n", $headers)
    );

    if (!$inviata) {
        http_response_code(500);
        echo json_encode([
            "ok" => false,
            "errore" => "Password aggiornata, ma l'email non e' stata inviata. Contatta il negozio."
        ]);
        exit;
    }

    echo json_encode([
        "ok" => true,
        "messaggio" => "Password temporanea inviata via email."
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante il recupero password."
    ]);
}
