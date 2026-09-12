import { useEffect, useState } from "react";
import type {
    CreateDepartamentoDto,
    Departamento,
} from "./Departamentos.types";
import { departamentosApi } from "./Departamentos.api";
import { Table } from "../../components/Table";

const FORM_INICIAL: CreateDepartamentoDto = { nombre: "", cuentaContable: "" };

export default function DepartamentosPage() {
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [form, setForm] = useState<CreateDepartamentoDto>(FORM_INICIAL);
    const [error, setError] = useState("");

    async function cargar() {
        setDepartamentos(await departamentosApi.getAll());
    }

    useEffect(() => {
        cargar();
    }, []);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        try {
            await departamentosApi.create(form);
            setForm(FORM_INICIAL);
            await cargar();
        } catch {
            setError("No se pudo crear el departamento.");
        }
    }

    async function handleEliminar(id: number) {
        if (!confirm("¿Eliminar este departamento?")) return;
        try {
            await departamentosApi.remove(id);
            await cargar();
        } catch {
            alert(
                "No se pudo eliminar (probablemente tiene empleados asignados).",
            );
        }
    }

    return (
        <div style={{ maxWidth: 700, margin: "40px auto" }}>
            <h2>Departamentos</h2>

            <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
                <input
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) =>
                        setForm({ ...form, nombre: e.target.value })
                    }
                    required
                />
                <input
                    placeholder="Cuenta contable (ej. 5101-01)"
                    value={form.cuentaContable}
                    onChange={(e) =>
                        setForm({ ...form, cuentaContable: e.target.value })
                    }
                    required
                />
                <button type="submit">Crear</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>

            <Table<Departamento>
                rowKey="departamentoId"
                data={departamentos}
                emptyMessage="No hay departamentos registrados"
                columns={[
                    { key: "nombre", label: "Nombre" },
                    { key: "cuentaContable", label: "Cuenta Contable" },
                    {
                        key: "departamentoId",
                        label: "Acciones",
                        render: (d) => (
                            <button
                                onClick={() => handleEliminar(d.departamentoId)}
                            >
                                Eliminar
                            </button>
                        ),
                    },
                ]}
            />
        </div>
    );
}
