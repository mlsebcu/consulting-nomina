import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Props {
    open: boolean;
    titulo: string;
    descripcion: ReactNode;
    textoConfirmar?: string;
    destructivo?: boolean;
    procesando?: boolean;
    onConfirmar: () => void;
    onCancelar: () => void;
}

export function ConfirmDialog({
    open,
    titulo,
    descripcion,
    textoConfirmar = "Confirmar",
    destructivo = false,
    procesando = false,
    onConfirmar,
    onCancelar,
}: Props) {
    return (
        <Dialog open={open} onOpenChange={(abierto) => !abierto && onCancelar()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{titulo}</DialogTitle>
                    <DialogDescription>{descripcion}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancelar} disabled={procesando}>
                        Cancelar
                    </Button>
                    <Button
                        variant={destructivo ? "destructive" : "default"}
                        onClick={onConfirmar}
                        disabled={procesando}
                    >
                        {procesando && <Loader2 className="animate-spin" />}
                        {textoConfirmar}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
