<?php
require_once __DIR__ . "/config.php";

function out($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    try {
        $tipoId = isset($_GET["tipo_id"]) ? (int)$_GET["tipo_id"] : 0;
        $data = trim($_GET["data"] ?? "");

        $sql = "
            SELECT
                s.id,
                s.tipo_appuntamento_id,
                s.data_appuntamento,
                s.ora_inizio,
                s.ora_fine,
                s.disponibile,
                t.nome AS tipo_appuntamento
            FROM slot_appuntamenti s
            INNER JOIN tipi_appuntamento t
                ON t.id = s.tipo_appuntamento_id
            WHERE 1 = 1
        ";
        $params = [];

        if ($tipoId > 0) {
            $sql .= " AND s.tipo_appuntamento_id = ?";
            $params[] = $tipoId;
        }

        if ($data !== "") {
            $sql .= " AND s.data_appuntamento = ?";
            $params[] = $data;
        }

        $sql .= " ORDER BY s.data_appuntamento, s.ora_inizio, s.id";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($rows as &$row) {
            $row["id"] = (int)$row["id"];
            $row["tipo_appuntamento_id"] = (int)$row["tipo_appuntamento_id"];
            $row["disponibile"] = (int)$row["disponibile"];
        }

        out(["ok" => true, "slot" => $rows]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore nel caricamento degli slot."], 500);
    }
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    out(["ok" => false, "errore" => "Metodo non consentito."], 405);
}

$input = json_decode(file_get_contents("php://input"), true);
$azione = trim($input["azione"] ?? "");

if ($azione === "crea") {
    $tipoId = (int)($input["tipo_appuntamento_id"] ?? 0);
    $data = trim($input["data_appuntamento"] ?? "");
    $inizio = trim($input["ora_inizio"] ?? "");
    $fine = trim($input["ora_fine"] ?? "");

    if ($tipoId <= 0 || $data === "" || $inizio === "" || $fine === "") {
        out(["ok" => false, "errore" => "Compila tutti i dati dello slot."], 400);
    }

    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM slot_appuntamenti
            WHERE tipo_appuntamento_id = ?
              AND data_appuntamento = ?
              AND ora_inizio = ?
              AND ora_fine = ?
        ");
        $stmt->execute([$tipoId, $data, $inizio, $fine]);

        if ((int)$stmt->fetchColumn() > 0) {
            out(["ok" => false, "errore" => "Questo slot esiste già."], 409);
        }

        $stmt = $pdo->prepare("
            INSERT INTO slot_appuntamenti
            (tipo_appuntamento_id, data_appuntamento, ora_inizio, ora_fine, disponibile)
            VALUES (?, ?, ?, ?, 1)
        ");
        $stmt->execute([$tipoId, $data, $inizio, $fine]);

        out(["ok" => true, "messaggio" => "Slot creato correttamente."]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante la creazione dello slot."], 500);
    }
}

if ($azione === "genera") {
    $tipoId = (int)($input["tipo_appuntamento_id"] ?? 0);
    $data = trim($input["data_appuntamento"] ?? "");
    $oraInizio = trim($input["ora_inizio"] ?? "");
    $oraFine = trim($input["ora_fine"] ?? "");
    $durata = (int)($input["durata_minuti"] ?? 0);

    if ($tipoId <= 0 || $data === "" || $oraInizio === "" || $oraFine === "" || $durata <= 0) {
        out(["ok" => false, "errore" => "Compila tutti i dati per la generazione."], 400);
    }

    try {
        $start = new DateTime("$data $oraInizio");
        $end = new DateTime("$data $oraFine");

        if ($end <= $start) {
            out(["ok" => false, "errore" => "L'ora fine deve essere successiva all'ora inizio."], 400);
        }

        $creati = 0;
        $saltati = 0;

        $pdo->beginTransaction();

        $check = $pdo->prepare("
            SELECT COUNT(*) FROM slot_appuntamenti
            WHERE tipo_appuntamento_id = ?
              AND data_appuntamento = ?
              AND ora_inizio = ?
              AND ora_fine = ?
        ");

        $insert = $pdo->prepare("
            INSERT INTO slot_appuntamenti
            (tipo_appuntamento_id, data_appuntamento, ora_inizio, ora_fine, disponibile)
            VALUES (?, ?, ?, ?, 1)
        ");

        $cur = clone $start;

        while ($cur < $end) {
            $next = clone $cur;
            $next->modify("+$durata minutes");

            if ($next > $end) break;

            $o1 = $cur->format("H:i:s");
            $o2 = $next->format("H:i:s");

            $check->execute([$tipoId, $data, $o1, $o2]);

            if ((int)$check->fetchColumn() === 0) {
                $insert->execute([$tipoId, $data, $o1, $o2]);
                $creati++;
            } else {
                $saltati++;
            }

            $cur = $next;
        }

        $pdo->commit();

        out([
            "ok" => true,
            "creati" => $creati,
            "saltati" => $saltati,
            "messaggio" => "Generazione completata."
        ]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        out(["ok" => false, "errore" => "Errore durante la generazione degli slot."], 500);
    }
}

if ($azione === "disponibilita") {
    $id = (int)($input["id"] ?? 0);
    $disp = (int)($input["disponibile"] ?? 0);

    try {
        $stmt = $pdo->prepare("UPDATE slot_appuntamenti SET disponibile = ? WHERE id = ?");
        $stmt->execute([$disp, $id]);
        out(["ok" => true]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante l'aggiornamento."], 500);
    }
}

if ($azione === "elimina") {
    $id = (int)($input["id"] ?? 0);

    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM appuntamenti
            WHERE slot_id = ?
              AND stato <> 'Annullato'
        ");
        $stmt->execute([$id]);

        if ((int)$stmt->fetchColumn() > 0) {
            out([
                "ok" => false,
                "errore" => "Non puoi eliminare uno slot collegato a un appuntamento attivo."
            ], 409);
        }

        $stmt = $pdo->prepare("DELETE FROM slot_appuntamenti WHERE id = ?");
        $stmt->execute([$id]);

        out(["ok" => true]);
    } catch (Throwable $e) {
        out(["ok" => false, "errore" => "Errore durante l'eliminazione."], 500);
    }
}

out(["ok" => false, "errore" => "Azione non valida."], 400);
