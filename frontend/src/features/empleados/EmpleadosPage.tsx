import React, { useEffect, useState } from "react";
import { Table } from "../../components/Table";
import { formatMoneda, formatFecha } from "../../utils/formatters";
import type { CreateEmpleadoDto, Empleado } from "./Empleados.types";
import type { Departamento } from "../departamentos/Departamentos.types";
import { empleadosApi } from "./Empleados.api";
import { departamentosApi } from "../departamentos/Departamentos.api";

const FORM_INICIAL: CreateEmpleadoDto = {
    nombre: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    salarioBase: 0,
    diasLaborados: 30,
    departamentoId: 0,
};

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
    const [form, setForm] = useState<CreateEmpleadoDto>(FORM_INICIAL);
    const [error, setError] = useState("");

    async function cargarDatos() {
        const [empleadosData, departamentosData] = await Promise.all([
            empleadosApi.getAll(),
            departamentosApi.getAll(),
        ]);
        setEmpleados(empleadosData);
        setDepartamentos(departamentosData);
    }

    useEffect(() => {
        cargarDatos();
    }, []);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        try {
            await empleadosApi.create(form);
            setForm(FORM_INICIAL);
            await cargarDatos();
        } catch {
            setError("No se pudo crear el empleado. Revisa los datos.");
        }
    }

    async function handleEliminar(id: number) {
        if (!confirm("¿Dar de baja a este empleado?")) return;
        await empleadosApi.remove(id);
        await cargarDatos();
    }

    return (
        <div style={{ maxWidth: 900, margin: "40px auto" }}>
            <h2>Empleados</h2>

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
                    type="date"
                    value={form.fechaNacimiento}
                    onChange={(e) =>
                        setForm({ ...form, fechaNacimiento: e.target.value })
                    }
                    required
                />
                <input
                    type="date"
                    value={form.fechaIngreso}
                    onChange={(e) =>
                        setForm({ ...form, fechaIngreso: e.target.value })
                    }
                    required
                />
                <input
                    type="number"
                    placeholder="Salario base"
                    value={form.salarioBase || ""}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            salarioBase: Number(e.target.value),
                        })
                    }
                    required
                />
                <select
                    value={form.departamentoId}
                    onChange={(e) =>
                        setForm({
                            ...form,
                            departamentoId: Number(e.target.value),
                        })
                    }
                    required
                >
                    <option value={0} disabled>
                        Selecciona departamento
                    </option>
                    {departamentos.map((d) => (
                        <option key={d.departamentoId} value={d.departamentoId}>
                            {d.nombre}
                        </option>
                    ))}
                </select>
                <button type="submit">Crear</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>

            <Table<Empleado>
                rowKey="empleadoId"
                data={empleados}
                emptyMessage="No hay empleados registrados"
                columns={[
                    { key: "nombre", label: "Nombre" },
                    {
                        key: "departamento",
                        label: "Departamento",
                        render: (e) => e.departamento?.nombre ?? "-",
                    },
                    {
                        key: "salarioBase",
                        label: "Salario Base",
                        render: (e) => formatMoneda(e.salarioBase),
                    },
                    {
                        key: "fechaIngreso",
                        label: "Fecha Ingreso",
                        render: (e) => formatFecha(e.fechaIngreso),
                    },
                    {
                        key: "empleadoId",
                        label: "Acciones",
                        render: (e) => (
                            <button
                                onClick={() => handleEliminar(e.empleadoId)}
                            >
                                Dar de baja
                            </button>
                        ),
                    },
                ]}
            />
        </div>
    );
}
