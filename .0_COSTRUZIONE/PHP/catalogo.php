<?php
require_once __DIR__ . "/config.php";

header("Content-Type: application/json; charset=utf-8");

try {
    $sql = "
        SELECT
            a.id,
            a.nome,
            a.descrizione,
            a.categoria,
            a.prezzo,
            a.disponibile,
            a.immagine_url,
            a.marca,
            a.modello,
            a.codice_articolo,
            a.materiale,
            a.forma,
            a.genere,
            a.tipo_lente,
            a.colore_lente,

            p.id AS promozione_id,
            p.titolo AS promozione_titolo,
            p.descrizione AS promozione_descrizione,
            p.sconto_percentuale,
            p.data_inizio AS promozione_data_inizio,
            p.data_fine AS promozione_data_fine

        FROM articoli a

        LEFT JOIN promozioni p
            ON p.id = (
                SELECT p2.id
                FROM promozioni p2
                WHERE p2.articolo_id = a.id
                  AND p2.attiva = 1
                  AND (p2.data_inizio IS NULL OR p2.data_inizio <= CURDATE())
                  AND (p2.data_fine IS NULL OR p2.data_fine >= CURDATE())
                ORDER BY p2.id DESC
                LIMIT 1
            )

        WHERE a.disponibile = 1
        ORDER BY a.id DESC
    ";

    $stmt = $pdo->query($sql);
    $articoli = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($articoli as &$articolo) {
        $articolo["id"] = (int)$articolo["id"];
        $articolo["prezzo"] = (float)$articolo["prezzo"];
        $articolo["disponibile"] = (int)$articolo["disponibile"];

        $articolo["in_promozione"] = !empty($articolo["promozione_id"]);

        if ($articolo["in_promozione"]) {
            $articolo["promozione_id"] = (int)$articolo["promozione_id"];
            $articolo["sconto_percentuale"] = (float)$articolo["sconto_percentuale"];

            $prezzoPromo = $articolo["prezzo"] * (
                1 - ($articolo["sconto_percentuale"] / 100)
            );

            $articolo["prezzo_promozionale"] = round($prezzoPromo, 2);
        } else {
            $articolo["promozione_id"] = null;
            $articolo["promozione_titolo"] = null;
            $articolo["promozione_descrizione"] = null;
            $articolo["sconto_percentuale"] = null;
            $articolo["promozione_data_inizio"] = null;
            $articolo["promozione_data_fine"] = null;
            $articolo["prezzo_promozionale"] = null;
        }
    }

    echo json_encode([
        "ok" => true,
        "articoli" => $articoli
    ]);
} catch (Throwable $e) {
    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "errore" => "Errore durante il caricamento del catalogo."
    ]);
}
