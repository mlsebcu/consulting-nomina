/* ============================================================
   PROYECTO: Sistema de Nóminas - Consulting, S.A.
   Contenido: Los 5 reportes/consultas pedidos en el enunciado
   ============================================================ */

-- ============================================================
-- 1. Listado de cumpleañeros por mes
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_ListadoCumpleanieros
    @Mes INT   -- 1 al 12
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.Nombre,
        d.Nombre                                   AS Departamento,
        e.FechaNacimiento,
        DAY(e.FechaNacimiento)                     AS Dia,
        dbo.fn_NombreMes(MONTH(e.FechaNacimiento))  AS MesNacimiento
    FROM Empleado e
    JOIN Departamento d ON d.DepartamentoId = e.DepartamentoId
    WHERE MONTH(e.FechaNacimiento) = @Mes
      AND e.Activo = 1
    ORDER BY DAY(e.FechaNacimiento);
END;
GO

-- ============================================================
-- 2. Listado de descuentos de IGSS por periodo
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_ListadoDescuentosIGSS
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.Nombre        AS Empleado,
        d.Nombre        AS Departamento,
        eg.Periodo,
        eg.Monto        AS MontoIGSS
    FROM EgresoEmpleado eg
    JOIN Empleado e     ON e.EmpleadoId = eg.EmpleadoId
    JOIN Departamento d ON d.DepartamentoId = e.DepartamentoId
    JOIN TipoEgreso te  ON te.TipoEgresoId = eg.TipoEgresoId
    WHERE te.Nombre = 'IGSS'
      AND eg.Periodo = @Periodo
    ORDER BY e.Nombre;
END;
GO

-- ============================================================
-- 3. Listado de descuentos de ISR por periodo
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_ListadoDescuentosISR
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        e.Nombre        AS Empleado,
        d.Nombre        AS Departamento,
        eg.Periodo,
        eg.Monto        AS MontoISR
    FROM EgresoEmpleado eg
    JOIN Empleado e     ON e.EmpleadoId = eg.EmpleadoId
    JOIN Departamento d ON d.DepartamentoId = e.DepartamentoId
    JOIN TipoEgreso te  ON te.TipoEgresoId = eg.TipoEgresoId
    WHERE te.Nombre = 'ISR'
      AND eg.Periodo = @Periodo
    ORDER BY e.Nombre;
END;
GO

-- ============================================================
-- 4. Póliza de Contabilidad (una cuenta contable por departamento)
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_PolizaContabilidad
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        d.CuentaContable,
        d.Nombre                    AS Departamento,
        SUM(n.TotalIngresos)        AS Debe_GastoSueldos,
        SUM(n.TotalEgresos)         AS Haber_Descuentos,
        SUM(n.Liquido)              AS Haber_Bancos
    FROM Nomina n
    JOIN Empleado e     ON e.EmpleadoId = n.EmpleadoId
    JOIN Departamento d ON d.DepartamentoId = e.DepartamentoId
    WHERE n.Periodo = @Periodo
      AND n.TipoNomina = 'FINMES'
    GROUP BY d.CuentaContable, d.Nombre
    ORDER BY d.CuentaContable;
END;
GO

-- ============================================================
-- 5. Libro de Salarios
--    Departamento / Empleado / Sueldo Base / Días Lab / Ingresos / Egresos
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_LibroSalarios
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        d.Nombre           AS Departamento,
        e.Nombre           AS Empleado,
        e.SalarioBase,
        e.DiasLaborados,
        n.TotalIngresos    AS Ingresos,
        n.TotalEgresos     AS Egresos,
        n.Liquido
    FROM Nomina n
    JOIN Empleado e     ON e.EmpleadoId = n.EmpleadoId
    JOIN Departamento d ON d.DepartamentoId = e.DepartamentoId
    WHERE n.Periodo = @Periodo
      AND n.TipoNomina = 'FINMES'
    ORDER BY d.Nombre, e.Nombre;
END;
GO

-- Pruebas:
-- EXEC dbo.sp_ListadoCumpleanieros @Mes = 9;
-- EXEC dbo.sp_ListadoDescuentosIGSS @Periodo = '2026-09-01';
-- EXEC dbo.sp_ListadoDescuentosISR  @Periodo = '2026-09-01';
-- EXEC dbo.sp_PolizaContabilidad    @Periodo = '2026-09-01';
-- EXEC dbo.sp_LibroSalarios         @Periodo = '2026-09-01';
