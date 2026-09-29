"use client";

import { useState } from "react";

import { AddressAutocomplete } from "@/components/forms/address-autocomplete";
import { isUsState, usStates } from "@/lib/profile/options";

// Campo "Cidade ou estado" das buscas de vagas (home e /jobs), com sugestões
// do Google. Envia "location" no formulário GET, como antes:
// "Orlando, FL" ao escolher uma cidade, "Florida" ao escolher um estado.
export function LocationSearchField({
  defaultValue,
  placeholder,
  inputClassName,
}: {
  defaultValue?: string;
  placeholder: string;
  inputClassName: string;
}) {
  const [value, setValue] = useState(defaultValue ?? "");

  return (
    <AddressAutocomplete
      kind="region"
      name="location"
      label={placeholder}
      hideLabel
      placeholder={placeholder}
      value={value}
      onChange={(next) => setValue(next.slice(0, 100))}
      onSelect={(place) => {
        if (place.city && isUsState(place.state)) {
          setValue(`${place.city}, ${place.state}`);
        } else if (isUsState(place.state)) {
          setValue(usStates[place.state]);
        } else if (place.city) {
          setValue(place.city);
        }
      }}
      inputClassName={inputClassName}
    />
  );
}
