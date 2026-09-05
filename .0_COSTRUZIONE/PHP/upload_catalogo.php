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

if (!isset($_FILES["immagine"])) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Nessuna immagine ricevuta."
    ]);
    exit;
}

$file = $_FILES["immagine"];

if ($file["error"] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante l'upload del file."
    ]);
    exit;
}

$maxBytes = 5 * 1024 * 1024;

if ((int)$file["size"] > $maxBytes) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "L'immagine supera il limite di 5 MB."
    ]);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($file["tmp_name"]);

$estensioniConsentite = [
    "image/jpeg" => "jpg",
    "image/png" => "png",
    "image/webp" => "webp"
];

if (!isset($estensioniConsentite[$mime])) {
    http_response_code(400);
    echo json_encode([
        "ok" => false,
        "errore" => "Formato non consentito. Usa JPG, PNG o WEBP."
    ]);
    exit;
}

$cartella = __DIR__ . "/uploads/catalogo";

if (!is_dir($cartella)) {
    if (!mkdir($cartella, 0755, true)) {
        http_response_code(500);
        echo json_encode([
            "ok" => false,
            "errore" => "Impossibile creare la cartella upload."
        ]);
        exit;
    }
}

$estensione = $estensioniConsentite[$mime];
$nomeFile = "catalogo_" . date("Ymd_His") . "_" . bin2hex(random_bytes(4)) . "." . $estensione;
$destinazione = $cartella . "/" . $nomeFile;

if (!move_uploaded_file($file["tmp_name"], $destinazione)) {
    http_response_code(500);
    echo json_encode([
        "ok" => false,
        "errore" => "Impossibile salvare l'immagine sul server."
    ]);
    exit;
}

$url = "https://www.agentiplusdb.net/ottica-api/uploads/catalogo/" . $nomeFile;

echo json_encode([
    "ok" => true,
    "url" => $url,
    "nome_file" => $nomeFile
]);
