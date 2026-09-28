"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  isGoogleMapsEnabled,
  loadPlacesLibrary,
  parseAddressComponents,
  type ParsedAddress,
} from "@/lib/google-maps";

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 250;

type Suggestion = {
  id: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
};

// Campo de rua com sugestões do Google Places (só endereços dos EUA). Ao
// escolher uma sugestão, chama onSelect com rua, cidade, estado e ZIP.
// Sem chave da API, ou se o Google falhar, funciona como um input comum.
export function AddressAutocomplete({
  name,
  label,
  optionalLabel,
  placeholder,
  value,
  onChange,
  onSelect,
  error,
}: {
  name: string;
  label: string;
  optionalLabel?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: ParsedAddress) => void;
  error?: string;
}) {
  const t = useTranslations("Profile.address");
  const locale = useLocale();
  const listboxId = useId();
  const errorId = `${name}-error`;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  // Um token por "sessão" de busca (digitar até escolher), como o Google
  // recomenda para cobrança por sessão em vez de por requisição.
  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken>(null);
  const requestId = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cancela uma busca pendente se o campo sair da tela.
  useEffect(() => () => clearTimeout(debounce.current), []);

  // A busca parte da digitação (e não de um efeito sobre `value`), para que
  // preencher o campo ao escolher uma sugestão não dispare outra busca.
  function handleInput(nextValue: string) {
    onChange(nextValue);
    if (!isGoogleMapsEnabled()) return;

    clearTimeout(debounce.current);
    const id = ++requestId.current;
    const query = nextValue.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    debounce.current = setTimeout(async () => {
      try {
        const places = await loadPlacesLibrary();
        sessionToken.current ??= new places.AutocompleteSessionToken();
        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: query,
            includedRegionCodes: ["us"],
            includedPrimaryTypes: ["street_address", "premise", "subpremise"],
            language: locale,
            region: "us",
            sessionToken: sessionToken.current,
          });

        // Ignora respostas de buscas antigas que chegaram depois.
        if (id !== requestId.current) return;

        setSuggestions(
          results.flatMap(({ placePrediction: p }) =>
            p
              ? [
                  {
                    id: p.placeId,
                    mainText: p.mainText?.text ?? p.text.text,
                    secondaryText: p.secondaryText?.text ?? "",
                    prediction: p,
                  },
                ]
              : [],
          ),
        );
        setActiveIndex(-1);
        setOpen(true);
      } catch (err) {
        // Falha do Google não pode impedir o preenchimento manual.
        console.warn("Google Places autocomplete indisponível", err);
        if (id === requestId.current) setSuggestions([]);
      }
    }, DEBOUNCE_MS);
  }

  async function select(suggestion: Suggestion) {
    setOpen(false);
    setSuggestions([]);
    setLoading(true);
    try {
      const place = suggestion.prediction.toPlace();
      await place.fetchFields({ fields: ["addressComponents"] });
      onSelect(parseAddressComponents(place.addressComponents ?? []));
    } catch (err) {
      console.warn("Não foi possível obter o endereço do Google", err);
      onChange(suggestion.mainText);
    } finally {
      // fetchFields encerra a sessão; a próxima busca usa um token novo.
      sessionToken.current = null;
      setLoading(false);
    }
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      // Escolhe a sugestão em vez de enviar o formulário.
      event.preventDefault();
      select(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && suggestions.length > 0;
  const activeId = activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
        {optionalLabel && (
          <span className="ml-1.5 font-normal text-muted-foreground">
            {optionalLabel}
          </span>
        )}
      </label>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(event) => handleInput(event.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          // Pequeno atraso para o clique na sugestão acontecer antes de fechar.
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          // Desliga o autofill do navegador, que cobriria as sugestões.
          autoComplete={isGoogleMapsEnabled() ? "off" : "street-address"}
          role={isGoogleMapsEnabled() ? "combobox" : undefined}
          aria-autocomplete={isGoogleMapsEnabled() ? "list" : undefined}
          aria-expanded={isGoogleMapsEnabled() ? showList : undefined}
          aria-controls={isGoogleMapsEnabled() ? listboxId : undefined}
          aria-activedescendant={activeId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="h-11 bg-card pl-9 pr-9"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}

        {showList && (
          <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            <ul id={listboxId} role="listbox" aria-label={t("suggestions")}>
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  id={`${listboxId}-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  // mousedown em vez de click: acontece antes do blur do input.
                  onMouseDown={(event) => {
                    event.preventDefault();
                    select(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 text-sm aria-selected:bg-accent"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {suggestion.mainText}
                    </span>
                    {suggestion.secondaryText && (
                      <span className="block truncate text-muted-foreground">
                        {suggestion.secondaryText}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {/* Atribuição exigida pelos termos do Google ao usar sugestões
                fora de um mapa do Google. */}
            <p className="border-t border-border px-3 py-1.5 text-right text-[11px] text-muted-foreground">
              {t("poweredBy")}
            </p>
          </div>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
