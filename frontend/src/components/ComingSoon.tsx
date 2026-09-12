export function ComingSoon({ modulo }: { modulo: string }) {
    return (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed">
            <p className="text-sm text-muted-foreground">
                El módulo de {modulo} está en construcción.
            </p>
        </div>
    );
}