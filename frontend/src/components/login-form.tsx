import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import payrollImage from "@/assets/payroll-image.png";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    try {
      await login(nombreUsuario, password);
      navigate("/empleados");
    } catch {
      setError("Usuario o contraseña incorrectos");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Consulting, S.A.</h1>
                <p className="text-balance text-muted-foreground">
                  Sistema de Nóminas
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor="nombreUsuario">Usuario</FieldLabel>
                <Input
                  id="nombreUsuario"
                  value={nombreUsuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Field>
                <Button type="submit">Iniciar sesión</Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted lg:block">
            <img
              src={payrollImage}
              alt="Consulting, S.A. - Sistema de Nóminas"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}