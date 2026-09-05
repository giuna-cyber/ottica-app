<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $stmt = $pdo->query("
            SELECT
                id,
                costo_spedizione,
                soglia_spedizione_gratuita
            FROM impostazioni_negozio
            ORDER BY id ASC
            LIMIT 1
        ");

        $impostazioni = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$impostazioni) {
            risposta([
                "ok" => false,
                "errore" => "Impostazioni negozio non trovate."
            ], 404);
        }

        risposta([
            "ok" => true,
            "impostazioni" => [
                "id" => (int)$impostazioni["id"],
                "costo_spedizione" => (float)$impostazioni["costo_spedizione"],
                "soglia_spedizione_gratuita" => (float)$impostazioni["soglia_spedizione_gratuita"]
            ]
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore nel caricamento delle impostazioni di spedizione."
        ], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    risposta([
        "ok" => false,
        "errore" => "Metodo non consentito."
    ], 405);
}

$input = json_decode(file_get_contents("php://input"), true);

$costoSpedizione = isset($input["costo_spedizione"])
    ? (float)$input["costo_spedizione"]
    : -1;

$sogliaSpedizioneGratuita = isset($input["soglia_spedizione_gratuita"])
    ? (float)$input["soglia_spedizione_gratuita"]
    : -1;

if ($costoSpedizione < 0) {
    risposta([
        "ok" => false,
        "errore" => "Il costo di spedizione non può essere negativo."
    ], 400);
}

if ($sogliaSpedizioneGratuita < 0) {
    risposta([
        "ok" => false,
        "errore" => "La soglia di spedizione gratuita non può essere negativa."
    ], 400);
}

try {
    $stmt = $pdo->query("
        SELECT id
        FROM impostazioni_negozio
        ORDER BY id ASC
        LIMIT 1
    ");

    $riga = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$riga) {
        risposta([
            "ok" => false,
            "errore" => "Impostazioni negozio non trovate."
        ], 404);
    }

    $stmt = $pdo->prepare("
        UPDATE impostazioni_negozio
        SET
            costo_spedizione = ?,
            soglia_spedizione_gratuita = ?
        WHERE id = ?
    ");

    $stmt->execute([
        round($costoSpedizione, 2),
        round($sogliaSpedizioneGratuita, 2),
        (int)$riga["id"]
    ]);

    risposta([
        "ok" => true,
        "messaggio" => "Impostazioni di spedizione aggiornate.",
        "impostazioni" => [
            "costo_spedizione" => round($costoSpedizione, 2),
            "soglia_spedizione_gratuita" => round($sogliaSpedizioneGratuita, 2)
        ]
    ]);
} catch (Throwable $e) {
    risposta([
        "ok" => false,
        "errore" => "Errore durante il salvataggio delle impostazioni di spedizione."
    ], 500);
}
