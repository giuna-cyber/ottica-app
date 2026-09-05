export type Variante = {
  id: number;
  articolo_id: number;
  taglia: string | null;
  misura: string | null;
  colore: string | null;
  quantita: number;
};

export type Articolo = {
  id: number;
  nome: string;
  descrizione: string | null;
  categoria: string;
  prezzo: number;
  disponibile: number;
  immagine_url: string | null;
  marca: string | null;
  modello: string | null;
  codice_articolo: string | null;
  materiale: string | null;
  forma: string | null;
  genere: string | null;
  tipo_lente: string | null;
  colore_lente: string | null;

  in_promozione: boolean;
  promozione_id: number | null;
  promozione_titolo: string | null;
  promozione_descrizione: string | null;
  sconto_percentuale: number | null;
  promozione_data_inizio: string | null;
  promozione_data_fine: string | null;
  prezzo_promozionale: number | null;

  varianti?: Variante[];
};
