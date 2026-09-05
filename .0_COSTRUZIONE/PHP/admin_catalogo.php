<?php
require_once __DIR__ . "/config.php";

function risposta($dati, $status = 200) {
    http_response_code($status);
    echo json_encode($dati);
    exit;
}

function normalizzaBool($valore) {
    return (int)$valore === 1 ? 1 : 0;
}

function caricaArticoli($pdo) {
    $stmt = $pdo->query("
        SELECT
            id,
            nome,
            descrizione,
            categoria,
            prezzo,
            disponibile,
            immagine_url,
            marca,
            modello,
            codice_articolo,
            materiale,
            forma,
            genere,
            tipo_lente,
            colore_lente
        FROM articoli
        ORDER BY id DESC
    ");

    $articoli = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmtVarianti = $pdo->prepare("
        SELECT
            id,
            articolo_id,
            taglia,
            misura,
            colore,
            quantita
        FROM varianti
        WHERE articolo_id = ?
        ORDER BY id ASC
    ");

    foreach ($articoli as &$articolo) {
        $articolo["id"] = (int)$articolo["id"];
        $articolo["prezzo"] = (float)$articolo["prezzo"];
        $articolo["disponibile"] = (int)$articolo["disponibile"];

        $stmtVarianti->execute([$articolo["id"]]);
        $varianti = $stmtVarianti->fetchAll(PDO::FETCH_ASSOC);

        foreach ($varianti as &$variante) {
            $variante["id"] = (int)$variante["id"];
            $variante["articolo_id"] = (int)$variante["articolo_id"];
            $variante["quantita"] = (int)$variante["quantita"];
        }

        $articolo["varianti"] = $varianti;
    }

    return $articoli;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        risposta([
            "ok" => true,
            "articoli" => caricaArticoli($pdo)
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore nel caricamento del catalogo."
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
$azione = trim($input["azione"] ?? "");

if ($azione === "salva") {
    $id = (int)($input["id"] ?? 0);

    $nome = trim($input["nome"] ?? "");
    $descrizione = trim($input["descrizione"] ?? "");
    $categoria = trim($input["categoria"] ?? "Vista");
    $prezzo = (float)($input["prezzo"] ?? 0);
    $disponibile = normalizzaBool($input["disponibile"] ?? 1);
    $immagineUrl = trim($input["immagine_url"] ?? "");
    $marca = trim($input["marca"] ?? "");
    $modello = trim($input["modello"] ?? "");
    $codiceArticolo = trim($input["codice_articolo"] ?? "");
    $materiale = trim($input["materiale"] ?? "");
    $forma = trim($input["forma"] ?? "");
    $genere = trim($input["genere"] ?? "");
    $tipoLente = trim($input["tipo_lente"] ?? "");
    $coloreLente = trim($input["colore_lente"] ?? "");
    $varianti = $input["varianti"] ?? [];

    if ($nome === "") {
        risposta([
            "ok" => false,
            "errore" => "Il nome del prodotto è obbligatorio."
        ], 400);
    }

    if ($prezzo < 0) {
        risposta([
            "ok" => false,
            "errore" => "Il prezzo non può essere negativo."
        ], 400);
    }

    try {
        $pdo->beginTransaction();

        if ($id > 0) {
            $stmt = $pdo->prepare("
                UPDATE articoli
                SET
                    nome = ?,
                    descrizione = ?,
                    categoria = ?,
                    prezzo = ?,
                    disponibile = ?,
                    immagine_url = ?,
                    marca = ?,
                    modello = ?,
                    codice_articolo = ?,
                    materiale = ?,
                    forma = ?,
                    genere = ?,
                    tipo_lente = ?,
                    colore_lente = ?
                WHERE id = ?
            ");

            $stmt->execute([
                $nome,
                $descrizione !== "" ? $descrizione : null,
                $categoria,
                $prezzo,
                $disponibile,
                $immagineUrl !== "" ? $immagineUrl : null,
                $marca !== "" ? $marca : null,
                $modello !== "" ? $modello : null,
                $codiceArticolo !== "" ? $codiceArticolo : null,
                $materiale !== "" ? $materiale : null,
                $forma !== "" ? $forma : null,
                $genere !== "" ? $genere : null,
                $tipoLente !== "" ? $tipoLente : null,
                $coloreLente !== "" ? $coloreLente : null,
                $id
            ]);
        } else {
            $stmt = $pdo->prepare("
                INSERT INTO articoli
                (
                    nome,
                    descrizione,
                    categoria,
                    prezzo,
                    disponibile,
                    immagine_url,
                    marca,
                    modello,
                    codice_articolo,
                    materiale,
                    forma,
                    genere,
                    tipo_lente,
                    colore_lente
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $nome,
                $descrizione !== "" ? $descrizione : null,
                $categoria,
                $prezzo,
                $disponibile,
                $immagineUrl !== "" ? $immagineUrl : null,
                $marca !== "" ? $marca : null,
                $modello !== "" ? $modello : null,
                $codiceArticolo !== "" ? $codiceArticolo : null,
                $materiale !== "" ? $materiale : null,
                $forma !== "" ? $forma : null,
                $genere !== "" ? $genere : null,
                $tipoLente !== "" ? $tipoLente : null,
                $coloreLente !== "" ? $coloreLente : null
            ]);

            $id = (int)$pdo->lastInsertId();
        }

        $stmt = $pdo->prepare("
            DELETE FROM varianti
            WHERE articolo_id = ?
        ");
        $stmt->execute([$id]);

        if (is_array($varianti)) {
            $insertVariante = $pdo->prepare("
                INSERT INTO varianti
                (
                    articolo_id,
                    taglia,
                    misura,
                    colore,
                    quantita
                )
                VALUES (?, ?, ?, ?, ?)
            ");

            foreach ($varianti as $variante) {
                $taglia = trim($variante["taglia"] ?? "");
                $misura = trim($variante["misura"] ?? "");
                $colore = trim($variante["colore"] ?? "");
                $quantita = (int)($variante["quantita"] ?? 0);

                if (
                    $taglia === "" &&
                    $misura === "" &&
                    $colore === "" &&
                    $quantita === 0
                ) {
                    continue;
                }

                $insertVariante->execute([
                    $id,
                    $taglia !== "" ? $taglia : null,
                    $misura !== "" ? $misura : null,
                    $colore !== "" ? $colore : null,
                    max(0, $quantita)
                ]);
            }
        }

        $pdo->commit();

        risposta([
            "ok" => true,
            "id" => $id,
            "messaggio" => "Prodotto salvato correttamente."
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        risposta([
            "ok" => false,
            "errore" => "Errore durante il salvataggio del prodotto."
        ], 500);
    }
}

if ($azione === "disponibile") {
    $id = (int)($input["id"] ?? 0);
    $disponibile = normalizzaBool($input["disponibile"] ?? 0);

    if ($id <= 0) {
        risposta([
            "ok" => false,
            "errore" => "ID prodotto non valido."
        ], 400);
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE articoli
            SET disponibile = ?
            WHERE id = ?
        ");

        $stmt->execute([$disponibile, $id]);

        risposta([
            "ok" => true,
            "messaggio" => "Disponibilità aggiornata."
        ]);
    } catch (Throwable $e) {
        risposta([
            "ok" => false,
            "errore" => "Errore durante l'aggiornamento."
        ], 500);
    }
}

if ($azione === "elimina") {
    $id = (int)($input["id"] ?? 0);

    if ($id <= 0) {
        risposta([
            "ok" => false,
            "errore" => "ID prodotto non valido."
        ], 400);
    }

    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare("
            UPDATE promozioni
            SET articolo_id = NULL
            WHERE articolo_id = ?
        ");
        $stmt->execute([$id]);

        $stmt = $pdo->prepare("
            DELETE FROM varianti
            WHERE articolo_id = ?
        ");
        $stmt->execute([$id]);

        $stmt = $pdo->prepare("
            DELETE FROM articoli
            WHERE id = ?
        ");
        $stmt->execute([$id]);

        $pdo->commit();

        risposta([
            "ok" => true,
            "messaggio" => "Prodotto eliminato."
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        risposta([
            "ok" => false,
            "errore" => "Errore durante l'eliminazione del prodotto."
        ], 500);
    }
}

risposta([
    "ok" => false,
    "errore" => "Azione non valida."
], 400);
