"use client";

import { useState } from "react";

import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { SelectField } from "@/components/forms/form-fields";
import { isUsState, usStates } from "@/lib/profile/options";

const stateOptions = Object.entries(usStates).map(([code, name]) => ({
  value: code,
  label: `${name} (${code})`,
}));

// Cidade com sugestões de cidades do Google + estado. Escolher uma cidade
// preenche também o estado; os dois continuam editáveis à mão. Enviam os
// campos "city" e "state".
export function CityStateFields({
  initialCity,
  initialState,
  labels,
  errors,
  cityMaxLength = 100,
}: {
  initialCity?: string;
  initialState?: string;
  labels: {
    city: string;
    cityPlaceholder: string;
    state: string;
    statePlaceholder: string;
  };
  errors: { city?: string; state?: string };
  cityMaxLength?: number;
}) {
  const [city, setCity] = useState(initialCity ?? "");
  const [state, setState] = useState(initialState ?? "");

  return (
    // Container query: lado a lado quando o formulário é largo (vagas no
    // admin), um embaixo do outro em colunas estreitas (cadastro de empresa).
    <div className="@container">
      <div className="grid gap-5 @lg:grid-cols-[1fr_16rem]">
        <AddressAutocomplete
          kind="city"
          name="city"
          label={labels.city}
          placeholder={labels.cityPlaceholder}
          value={city}
          onChange={(value) => setCity(value.slice(0, cityMaxLength))}
          onSelect={(place) => {
            if (place.city) setCity(place.city);
            // Só aceita siglas da nossa lista (ex.: ignora territórios).
            if (isUsState(place.state)) setState(place.state);
          }}
          error={errors.city}
        />
        <SelectField
          name="state"
          label={labels.state}
          placeholder={labels.statePlaceholder}
          options={stateOptions}
          value={state}
          onChange={setState}
          error={errors.state}
        />
      </div>
    </div>
  );
}
