<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function out($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$campi = [
    "nome_centro",
    "ragione_sociale",
    "indirizzo",
    "cap",
    "citta",
    "provincia",
    "telefono",
    "telefono_whatsapp",
    "email",
    "sito_web",
    "partita_iva",
    "codice_fiscale",
    "orari_apertura",
    "logo_url"
];

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $sql = "SELECT " . implode(", ", $campi) . "
                FROM impostazioni_negozio
                LIMIT 1";

        $stmt = $pdo->query($sql);
        $riga = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$riga) {
            $riga = [];
            foreach ($campi as $campo) {
                $riga[$campo] = "";
            }
        }

        foreach ($campi as $campo) {
            $riga[$campo] = $riga[$campo] ?? "";
        }

        out([
            "ok" => true,
            "negozio" => $riga
        ]);
    } catch (Throwable $e) {
        out([
            "ok" => false,
            "errore" => "Errore durante il caricamento dei dati del centro ottico."
        ], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$nomeCentro = trim($input["nome_centro"] ?? "");
$whatsapp = trim($input["telefono_whatsapp"] ?? "");

if ($nomeCentro === "" || $whatsapp === "") {
    out([
        "ok" => false,
        "errore" => "Nome centro ottico e numero WhatsApp sono obbligatori."
    ], 400);
}

$valori = [];

foreach ($campi as $campo) {
    $valori[$campo] = trim((string)($input[$campo] ?? ""));
}

try {
    $conteggio = (int)$pdo
        ->query("SELECT COUNT(*) FROM impostazioni_negozio")
        ->fetchColumn();

    if ($conteggio === 0) {
        $nomi = implode(", ", array_keys($valori));
        $segnaposto = implode(", ", array_fill(0, count($valori), "?"));

        $stmt = $pdo->prepare(
            "INSERT INTO impostazioni_negozio ($nomi)
             VALUES ($segnaposto)"
        );

        $stmt->execute(array_values($valori));
    } else {
        $set = implode(
            ", ",
            array_map(
                fn($campo) => "$campo = ?",
                array_keys($valori)
            )
        );

        $stmt = $pdo->prepare(
            "UPDATE impostazioni_negozio
             SET $set
             LIMIT 1"
        );

        $stmt->execute(array_values($valori));
    }

    out([
        "ok" => true,
        "messaggio" => "Dati centro ottico aggiornati."
    ]);
} catch (Throwable $e) {
    out([
        "ok" => false,
        "errore" => "Errore durante il salvataggio dei dati del centro ottico."
    ], 500);
}
