/* ============================================================
   PROYECTO: Sistema de Nóminas - Consulting, S.A.
   Motor: SQL Server
   Contenido: Tablas, catálogos, función y procedimientos
   Autor: Marvin Seb
   ============================================================ */

-- ============================================================
-- 1. TABLAS MAESTRAS
-- ============================================================

CREATE TABLE Departamento (
    DepartamentoId   INT IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(100) NOT NULL,
    CuentaContable   VARCHAR(20)  NOT NULL
);

CREATE TABLE Empleado (
    EmpleadoId       INT IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(150) NOT NULL,
    FechaNacimiento  DATE NOT NULL,
    FechaIngreso     DATE NOT NULL,
    SalarioBase      DECIMAL(12,2) NOT NULL,
    DiasLaborados    INT NOT NULL DEFAULT 30,
    DepartamentoId   INT NOT NULL,
    Activo           BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Empleado_Departamento FOREIGN KEY (DepartamentoId)
        REFERENCES Departamento(DepartamentoId)
);

CREATE TABLE TipoIngreso (
    TipoIngresoId    INT IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(50) NOT NULL,
    EsGravable       BIT NOT NULL DEFAULT 1
);

CREATE TABLE TipoEgreso (
    TipoEgresoId     INT IDENTITY(1,1) PRIMARY KEY,
    Nombre           VARCHAR(50) NOT NULL,
    EsCalculado      BIT NOT NULL DEFAULT 0
);

-- ============================================================
-- 2. TABLAS TRANSACCIONALES
-- ============================================================

CREATE TABLE IngresoEmpleado (
    IngresoId        INT IDENTITY(1,1) PRIMARY KEY,
    EmpleadoId       INT NOT NULL,
    TipoIngresoId    INT NOT NULL,
    Periodo          DATE NOT NULL,
    Monto            DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_IngresoEmpleado_Empleado FOREIGN KEY (EmpleadoId)
        REFERENCES Empleado(EmpleadoId),
    CONSTRAINT FK_IngresoEmpleado_Tipo FOREIGN KEY (TipoIngresoId)
        REFERENCES TipoIngreso(TipoIngresoId)
);

CREATE TABLE EgresoEmpleado (
    EgresoId         INT IDENTITY(1,1) PRIMARY KEY,
    EmpleadoId       INT NOT NULL,
    TipoEgresoId     INT NOT NULL,
    Periodo          DATE NOT NULL,
    Monto            DECIMAL(12,2) NOT NULL,
    CONSTRAINT FK_EgresoEmpleado_Empleado FOREIGN KEY (EmpleadoId)
        REFERENCES Empleado(EmpleadoId),
    CONSTRAINT FK_EgresoEmpleado_Tipo FOREIGN KEY (TipoEgresoId)
        REFERENCES TipoEgreso(TipoEgresoId)
);

CREATE TABLE Nomina (
    NominaId         INT IDENTITY(1,1) PRIMARY KEY,
    EmpleadoId       INT NOT NULL,
    Periodo          DATE NOT NULL,
    TipoNomina       VARCHAR(10) NOT NULL,
    TotalIngresos    DECIMAL(12,2) NOT NULL DEFAULT 0,
    TotalEgresos     DECIMAL(12,2) NOT NULL DEFAULT 0,
    Liquido          DECIMAL(12,2) NOT NULL DEFAULT 0,
    Estado           VARCHAR(10) NOT NULL DEFAULT 'ABIERTA',
    FechaCalculo     DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Nomina_Empleado FOREIGN KEY (EmpleadoId)
        REFERENCES Empleado(EmpleadoId)
);

-- ============================================================
-- 3. DATOS DE CATÁLOGO
-- ============================================================

INSERT INTO TipoIngreso (Nombre, EsGravable) VALUES
    ('Salario Base', 1),
    ('Horas Extras y Dobles', 1),
    ('Bonificación Decreto', 0),
    ('Bonificación x Producción', 1),
    ('Comisiones', 1);

INSERT INTO TipoEgreso (Nombre, EsCalculado) VALUES
    ('IGSS', 1),
    ('ISR', 1),
    ('Asociación Solidarista', 0),
    ('Descuento Tienda Solidarista', 0);

INSERT INTO Departamento (Nombre, CuentaContable) VALUES
    ('Finanzas', '5101-01'),
    ('Producción', '5101-02'),
    ('Logística', '5101-03'),
    ('Recursos Humanos', '5101-04'),
    ('Mercadeo', '5101-05');

-- ============================================================
-- 4. FUNCIÓN: nombre del mes en español
-- ============================================================
GO
CREATE FUNCTION dbo.fn_NombreMes (@Mes INT)
RETURNS VARCHAR(15)
AS
BEGIN
    RETURN CASE @Mes
        WHEN 1  THEN 'Enero'
        WHEN 2  THEN 'Febrero'
        WHEN 3  THEN 'Marzo'
        WHEN 4  THEN 'Abril'
        WHEN 5  THEN 'Mayo'
        WHEN 6  THEN 'Junio'
        WHEN 7  THEN 'Julio'
        WHEN 8  THEN 'Agosto'
        WHEN 9  THEN 'Septiembre'
        WHEN 10 THEN 'Octubre'
        WHEN 11 THEN 'Noviembre'
        WHEN 12 THEN 'Diciembre'
        ELSE 'Mes inválido'
    END;
END;
GO

-- ============================================================
-- 5. PROCEDIMIENTO: cálculo de anticipo (día 15, 50% salario base)
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_CalcularAnticipo
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Nomina (EmpleadoId, Periodo, TipoNomina, TotalIngresos, TotalEgresos, Liquido)
    SELECT
        e.EmpleadoId,
        @Periodo,
        'ANTICIPO',
        e.SalarioBase * 0.50,
        0,
        e.SalarioBase * 0.50
    FROM Empleado e
    WHERE e.Activo = 1;
END;
GO

-- ============================================================
-- 6. PROCEDIMIENTO: cálculo de nómina de fin de mes
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_CalcularNominaFinMes
    @Periodo DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @PctIGSS DECIMAL(5,4) = 0.0483;

    DECLARE @Calculo TABLE (
        EmpleadoId       INT,
        SalarioProrateado DECIMAL(12,2),
        OtrosIngresos    DECIMAL(12,2),
        BaseGravable     DECIMAL(12,2),
        TotalIngresos    DECIMAL(12,2)
    );

    INSERT INTO @Calculo (EmpleadoId, SalarioProrateado, OtrosIngresos, BaseGravable, TotalIngresos)
    SELECT
        e.EmpleadoId,
        e.SalarioBase * (CAST(e.DiasLaborados AS DECIMAL(5,2)) / 30.0),
        ISNULL(SUM(CASE WHEN ti.Nombre <> 'Salario Base' THEN i.Monto ELSE 0 END), 0),
        e.SalarioBase * (CAST(e.DiasLaborados AS DECIMAL(5,2)) / 30.0)
            + ISNULL(SUM(CASE WHEN ti.EsGravable = 1 AND ti.Nombre <> 'Salario Base'
                               THEN i.Monto ELSE 0 END), 0),
        e.SalarioBase * (CAST(e.DiasLaborados AS DECIMAL(5,2)) / 30.0)
            + ISNULL(SUM(CASE WHEN ti.Nombre <> 'Salario Base' THEN i.Monto ELSE 0 END), 0)
    FROM Empleado e
    LEFT JOIN IngresoEmpleado i
        ON i.EmpleadoId = e.EmpleadoId AND i.Periodo = @Periodo
    LEFT JOIN TipoIngreso ti
        ON ti.TipoIngresoId = i.TipoIngresoId
    WHERE e.Activo = 1
    GROUP BY e.EmpleadoId, e.SalarioBase, e.DiasLaborados;

    INSERT INTO EgresoEmpleado (EmpleadoId, TipoEgresoId, Periodo, Monto)
    SELECT
        c.EmpleadoId,
        (SELECT TipoEgresoId FROM TipoEgreso WHERE Nombre = 'IGSS'),
        @Periodo,
        ROUND(c.BaseGravable * @PctIGSS, 2)
    FROM @Calculo c;

    INSERT INTO EgresoEmpleado (EmpleadoId, TipoEgresoId, Periodo, Monto)
    SELECT
        c.EmpleadoId,
        (SELECT TipoEgresoId FROM TipoEgreso WHERE Nombre = 'ISR'),
        @Periodo,
        CASE
            WHEN c.BaseGravable * 12 <= 48000 THEN 0
            ELSE ROUND((c.BaseGravable * 12 - 48000) * 0.05 / 12, 2)
        END
    FROM @Calculo c;

    INSERT INTO Nomina (EmpleadoId, Periodo, TipoNomina, TotalIngresos, TotalEgresos, Liquido)
    SELECT
        c.EmpleadoId,
        @Periodo,
        'FINMES',
        c.TotalIngresos,
        ISNULL(eg.TotalEgresos, 0),
        c.TotalIngresos - ISNULL(eg.TotalEgresos, 0)
    FROM @Calculo c
    LEFT JOIN (
        SELECT EmpleadoId, SUM(Monto) AS TotalEgresos
        FROM EgresoEmpleado
        WHERE Periodo = @Periodo
        GROUP BY EmpleadoId
    ) eg ON eg.EmpleadoId = c.EmpleadoId;
END;
GO

-- ============================================================
-- 7. PROCEDIMIENTO: cerrar nómina (ciclo de vida)
-- ============================================================
GO
CREATE PROCEDURE dbo.sp_CerrarNomina
    @Periodo DATE,
    @TipoNomina VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Nomina
    SET Estado = 'CERRADA'
    WHERE Periodo = @Periodo AND TipoNomina = @TipoNomina;
END;
GO

-- Pruebas:
-- EXEC dbo.sp_CalcularAnticipo @Periodo = '2026-09-01';
-- EXEC dbo.sp_CalcularNominaFinMes @Periodo = '2026-09-01';
-- EXEC dbo.sp_CerrarNomina @Periodo = '2026-09-01', @TipoNomina = 'FINMES';
