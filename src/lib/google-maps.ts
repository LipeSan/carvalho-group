"use client";

import { importLibrary, setOptions } from "@googlemaps/js-api-loader";

// Chave pública (vai para o navegador). Proteja-a no Google Cloud restringindo
// por HTTP referrer e liberando só Maps JavaScript API + Places API (New).
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

let placesLibrary: Promise<google.maps.PlacesLibrary> | null = null;

export function isGoogleMapsEnabled(): boolean {
  return Boolean(apiKey);
}

// Carrega a biblioteca "places" uma única vez por página.
export function loadPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ausente"));
  }
  if (!placesLibrary) {
    setOptions({ key: apiKey, v: "weekly" });
    placesLibrary = importLibrary("places").catch((error) => {
      // Permite tentar de novo numa próxima interação.
      placesLibrary = null;
      throw error;
    });
  }
  return placesLibrary;
}

export type ParsedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
};

// Converte os componentes de endereço do Google nos campos do formulário.
export function parseAddressComponents(
  components: google.maps.places.AddressComponent[],
): ParsedAddress {
  const get = (type: string, short = false) => {
    const component = components.find((c) => c.types.includes(type));
    return (short ? component?.shortText : component?.longText) ?? "";
  };

  const streetLine = [get("street_number"), get("route", true)]
    .filter(Boolean)
    .join(" ");
  const unit = get("subpremise");
  const zip = get("postal_code");
  const zipSuffix = get("postal_code_suffix");

  return {
    street: unit ? `${streetLine}, #${unit}` : streetLine,
    // Nem todo endereço tem "locality" (ex.: bairros de NY); usa o mais
    // próximo disponível.
    city:
      get("locality") ||
      get("sublocality_level_1") ||
      get("postal_town") ||
      get("neighborhood"),
    state: get("administrative_area_level_1", true),
    zip: zip && zipSuffix ? `${zip}-${zipSuffix}` : zip,
  };
}
