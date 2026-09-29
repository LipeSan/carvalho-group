"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { CircleHelp, TriangleAlert } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type ConfirmOptions = {
  title: string;
  description?: string;
  // Texto do botão de confirmar (padrão: "Confirmar").
  confirmLabel?: string;
  cancelLabel?: string;
  // Ações que tiram acesso, encerram ou expõem algo: botão e ícone em
  // vermelho.
  destructive?: boolean;
};

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

// Popup de confirmação do sistema, no lugar do window.confirm do navegador.
// Fica uma vez no layout; os componentes chamam useConfirm():
//
//   const confirm = useConfirm();
//   if (!(await confirm({ title: "Encerrar?", destructive: true }))) return;
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Common.confirm");
  const [open, setOpen] = useState(false);
  // As opções continuam guardadas depois de fechar, para o conteúdo não
  // sumir durante a animação de saída.
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((result: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>((next) => {
    // Um popup por vez: um pedido anterior ainda aberto conta como cancelado.
    resolver.current?.(false);
    setOptions(next);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  function finish(result: boolean) {
    resolver.current?.(result);
    resolver.current = null;
    setOpen(false);
  }

  const destructive = options?.destructive ?? false;
  const Icon = destructive ? TriangleAlert : CircleHelp;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog
        open={open}
        // Esc ou "Cancelar" fecham sem confirmar.
        onOpenChange={(nextOpen) => {
          if (!nextOpen) finish(false);
        }}
      >
        {options && (
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia
                className={
                  destructive
                    ? "bg-destructive/10 text-destructive"
                    : "bg-accent text-accent-foreground"
                }
              >
                <Icon />
              </AlertDialogMedia>
              <AlertDialogTitle>{options.title}</AlertDialogTitle>
              {options.description && (
                <AlertDialogDescription>
                  {options.description}
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {options.cancelLabel ?? t("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant={destructive ? "destructive" : "default"}
                onClick={() => finish(true)}
              >
                {options.confirmLabel ?? t("confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        )}
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>.");
  }
  return confirm;
}
