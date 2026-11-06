import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactMessagesList } from "@/components/admin/contact-messages-list";
import {
  FilterBar,
  Pagination,
  cleanQuery,
  pageParam,
  pickParam,
  textParam,
} from "@/components/lists/list-controls";
import { PageHeader } from "@/components/navigation/page-header";
import { ADMIN_PAGE_SIZE, listContactMessages } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { contactMessageStatuses, contactSubjects } from "@/lib/contact/options";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/messages">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.messages" });
  return { title: t("title") };
}

export default async function AdminMessagesPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/messages">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const sp = await searchParams;
  const filters = {
    q: textParam(sp.q),
    status: pickParam(sp.status, contactMessageStatuses),
    subject: pickParam(sp.subject, contactSubjects),
    page: pageParam(sp.page),
  };

  const [t, tList, tServices, { rows, total }] = await Promise.all([
    getTranslations("Admin.messages"),
    getTranslations("Lists"),
    getTranslations("Services.items"),
    listContactMessages(filters),
  ]);

  const subjectLabels = Object.fromEntries(
    contactSubjects.map((subject) => [
      subject,
      subject === "other" ? t("subjects.other") : tServices(`${subject}.name`),
    ]),
  );

  return (
    <>
      <PageHeader
        title={t("title")}
        subtitle={tList("resultsCount", { count: total })}
      />

      <FilterBar
        path="/admin/messages"
        query={filters.q}
        searchPlaceholder={t("searchPlaceholder")}
        selects={[
          {
            name: "status",
            label: t("filters.status"),
            value: filters.status,
            options: contactMessageStatuses.map((status) => ({
              value: status,
              label: t(`statuses.${status}`),
            })),
          },
          {
            name: "subject",
            label: t("filters.subject"),
            value: filters.subject,
            options: contactSubjects.map((subject) => ({
              value: subject,
              label: subjectLabels[subject],
            })),
          },
        ]}
      />

      <ContactMessagesList rows={rows} subjectLabels={subjectLabels} />

      <Pagination
        page={filters.page}
        total={total}
        pageSize={ADMIN_PAGE_SIZE}
        hrefFor={(page) => ({
          pathname: "/admin/messages",
          query: cleanQuery({ ...filters, page: page > 1 ? page : undefined }),
        })}
      />
    </>
  );
}
