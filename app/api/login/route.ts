import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
} from "@/lib/admin-session";

const API_ARUBA =
  "https://www.agentiplusdb.net/ottica-api/login_admin.php";

export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json();

    const risposta = await fetch(API_ARUBA, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(corpo),
    });

    const testo = await risposta.text();

    let dati;

    try {
      dati = JSON.parse(testo);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          errore: "La risposta del server non è JSON valido.",
        },
        { status: 502 }
      );
    }

    if (!risposta.ok || !dati.ok || !dati.utente) {
      return NextResponse.json(
        {
          ok: false,
          errore: dati.errore || "Credenziali non valide.",
        },
        { status: risposta.status || 401 }
      );
    }

    const token = createAdminSessionToken(
      Number(dati.utente.id),
      String(dati.utente.username)
    );

    const response = NextResponse.json({
      ok: true,
      utente: {
        id: Number(dati.utente.id),
        username: String(dati.utente.username),
      },
    });

    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (errore) {
    return NextResponse.json(
      {
        ok: false,
        errore:
          errore instanceof Error
            ? errore.message
            : "Errore durante il login.",
      },
      { status: 500 }
    );
  }
}
