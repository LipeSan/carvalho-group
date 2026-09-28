"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MAX_CUSTOM_SKILL_LENGTH,
  MAX_SKILLS,
  isSuggestedSkill,
  suggestedSkills,
} from "@/lib/profile/options";

// Skills sugeridas (clique para marcar) + skills livres digitadas pela pessoa.
// Cada skill selecionada vira um <input type="hidden" name="skills">.
export function SkillsField({
  defaultValue,
  error,
}: {
  defaultValue?: string[] | null;
  error?: string;
}) {
  const t = useTranslations("Profile");
  const [selected, setSelected] = useState<string[]>(defaultValue ?? []);
  const [draft, setDraft] = useState("");

  const customSkills = selected.filter((skill) => !isSuggestedSkill(skill));
  const limitReached = selected.length >= MAX_SKILLS;

  function toggle(skill: string) {
    setSelected((current) =>
      current.includes(skill)
        ? current.filter((s) => s !== skill)
        : current.length < MAX_SKILLS
          ? [...current, skill]
          : current,
    );
  }

  function addCustom() {
    const skill = draft.trim().slice(0, MAX_CUSTOM_SKILL_LENGTH);
    const exists = selected.some(
      (s) => s.toLowerCase() === skill.toLowerCase(),
    );
    if (skill && !exists && !limitReached) {
      setSelected((current) => [...current, skill]);
    }
    setDraft("");
  }

  return (
    <fieldset
      className="flex flex-col gap-3"
      aria-describedby={error ? "skills-error" : undefined}
    >
      <legend className="mb-1 text-sm font-medium">
        {t("fields.skills")}
        <span className="ml-1.5 font-normal text-muted-foreground">
          {t("optional")}
        </span>
      </legend>
      <p className="text-sm text-muted-foreground">
        {t("fields.skillsHint", { max: MAX_SKILLS })}
      </p>

      {selected.map((skill) => (
        <input key={skill} type="hidden" name="skills" value={skill} />
      ))}

      <div className="flex flex-wrap gap-2">
        {suggestedSkills.map((skill) => {
          const active = selected.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              aria-pressed={active}
              disabled={!active && limitReached}
              onClick={() => toggle(skill)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-sm transition-colors hover:border-primary disabled:opacity-40 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {active && <Check className="size-3.5" />}
              {t(`options.skills.${skill}`)}
            </button>
          );
        })}
        {customSkills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary px-3 py-1 text-sm text-primary-foreground"
          >
            {skill}
            <button
              type="button"
              onClick={() => toggle(skill)}
              aria-label={t("fields.removeSkill", { skill })}
              className="-mr-1 rounded-full p-0.5 hover:bg-primary-foreground/20"
            >
              <X className="size-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter adiciona a skill em vez de enviar o formulário.
            if (event.key === "Enter") {
              event.preventDefault();
              addCustom();
            }
          }}
          maxLength={MAX_CUSTOM_SKILL_LENGTH}
          disabled={limitReached}
          placeholder={t("fields.customSkillPlaceholder")}
          aria-label={t("fields.customSkillPlaceholder")}
          className="h-10 bg-card"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCustom}
          disabled={!draft.trim() || limitReached}
          className="h-10"
        >
          <Plus />
          {t("fields.addSkill")}
        </Button>
      </div>

      {error && (
        <p id="skills-error" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
