import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EyeIcon, EyeOffIcon, Loader2, LockIcon, UserIcon } from "lucide-react";
import logo from "@/assets/logo.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { RUTA_INICIAL } from "@/routes/navegacion";
import { mensajeError } from "@/utils/errores";

const PASSWORD_MIN_LENGTH = 8;

export function LoginForm() {
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { desde?: string } | null)?.desde ?? RUTA_INICIAL;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      await login(nombreUsuario.trim(), password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err, "Usuario o contraseña incorrectos"));
    } finally {
      setCargando(false);
    }
  }

  return (
    <Card className="shadow-xl [--card-spacing:--spacing(6)]">
      <CardHeader className="items-center text-center">
        <img src={logo} alt="Consulting, S.A." className="mx-auto mb-2 h-14 w-auto" />
        <CardTitle className="text-xl">Consulting, S.A.</CardTitle>
        <CardDescription>Sistema de Nóminas</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="login" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombreUsuario">Usuario</Label>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <UserIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="nombreUsuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                required
                className="text-base sm:text-sm"
              />
            </InputGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <InputGroup className="h-10">
              <InputGroupAddon>
                <LockIcon />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                type={verPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                minLength={PASSWORD_MIN_LENGTH}
                required
                className="text-base sm:text-sm"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {verPassword ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={cargando} className="h-10 w-full">
            {cargando && <Loader2 className="animate-spin" />}
            {cargando ? "Verificando" : "Ingresar"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-center text-xs text-muted-foreground">
        Si olvidó su contraseña, solicítela al administrador del sistema.
      </CardFooter>
    </Card>
  );
}
