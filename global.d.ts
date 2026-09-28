import type pt from "./messages/pt.json";

declare global {
  // Usado pelo next-intl para autocomplete e checagem de tipos das chaves
  // de tradução (ex: t("Nav.jobs")) em toda a aplicação.
  type IntlMessages = typeof pt;
}
