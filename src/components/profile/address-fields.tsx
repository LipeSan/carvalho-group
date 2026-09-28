"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { SelectField, TextField } from "@/components/forms/form-fields";
import { isUsState, usStates } from "@/lib/profile/options";

import { AddressAutocomplete } from "./address-autocomplete";

const stateOptions = Object.entries(usStates).map(([code, name]) => ({
  value: code,
  label: `${name} (${code})`,
}));

// Rua, cidade, estado e ZIP controlados juntos, para que escolher uma
// sugestão do Google preencha os quatro de uma vez. Continuam editáveis.
export function AddressFields({
  initialValues,
  errors,
}: {
  initialValues: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  errors: { street?: string; city?: string; state?: string; zip?: string };
}) {
  const t = useTranslations("Profile");
  const [address, setAddress] = useState({
    street: initialValues.street ?? "",
    city: initialValues.city ?? "",
    state: initialValues.state ?? "",
    zip: initialValues.zip ?? "",
  });

  const set = (field: keyof typeof address) => (value: string) =>
    setAddress((current) => ({ ...current, [field]: value }));

  return (
    <>
      <AddressAutocomplete
        name="street"
        label={t("fields.street")}
        optionalLabel={t("optional")}
        placeholder={t("address.placeholder")}
        value={address.street}
        onChange={set("street")}
        onSelect={(selected) =>
          setAddress((current) => ({
            street: selected.street || current.street,
            city: selected.city || current.city,
            // Só aceita siglas da nossa lista (ex.: ignora territórios).
            state: isUsState(selected.state) ? selected.state : current.state,
            zip: selected.zip || current.zip,
          }))
        }
        error={errors.street}
      />
      <TextField
        name="city"
        autoComplete="address-level2"
        label={t("fields.city")}
        placeholder="Orlando"
        value={address.city}
        onChange={(event) => set("city")(event.target.value)}
        error={errors.city}
      />
      <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
        <SelectField
          name="state"
          autoComplete="address-level1"
          label={t("fields.state")}
          placeholder={t("fields.selectPlaceholder")}
          options={stateOptions}
          value={address.state}
          onChange={set("state")}
          error={errors.state}
        />
        <TextField
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          label={t("fields.zip")}
          placeholder="32801"
          maxLength={10}
          value={address.zip}
          onChange={(event) => set("zip")(event.target.value)}
          error={errors.zip}
        />
      </div>
    </>
  );
}
