-- Funciones del motor de nómina y reportes.
-- Los códigos de concepto referenciados aquí corresponden a conceptos de sistema (es_sistema = TRUE),
-- que la API no permite eliminar ni recodificar.

CREATE OR REPLACE FUNCTION fn_nombre_mes(p_mes INTEGER)
RETURNS VARCHAR(15)
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT CASE p_mes
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
    END;
$$;

CREATE OR REPLACE FUNCTION fn_parametro_texto(p_codigo VARCHAR, p_anio INTEGER)
RETURNS VARCHAR
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_valor VARCHAR;
BEGIN
    SELECT valor INTO v_valor
    FROM parametro_nomina
    WHERE codigo = p_codigo AND anio = p_anio AND activo;

    IF v_valor IS NULL THEN
        RAISE EXCEPTION 'No existe el parámetro % configurado para el año %', p_codigo, p_anio;
    END IF;

    RETURN v_valor;
END;
$$;

CREATE OR REPLACE FUNCTION fn_parametro_numero(p_codigo VARCHAR, p_anio INTEGER)
RETURNS NUMERIC
LANGUAGE sql
STABLE
AS $$
    SELECT fn_parametro_texto(p_codigo, p_anio)::NUMERIC;
$$;

CREATE OR REPLACE FUNCTION fn_periodo_abierto(p_periodo_id INTEGER)
RETURNS periodo
LANGUAGE plpgsql
AS $$
DECLARE
    v_periodo periodo;
BEGIN
    SELECT * INTO v_periodo
    FROM periodo
    WHERE periodo_id = p_periodo_id AND activo
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El período % no existe', p_periodo_id;
    END IF;

    IF v_periodo.estado = 'CERRADO' THEN
        RAISE EXCEPTION 'El período ya está cerrado';
    END IF;

    RETURN v_periodo;
END;
$$;

-- Anticipo del día 15: porcentaje parametrizado sobre el salario base.
CREATE OR REPLACE FUNCTION fn_calcular_anticipo(p_periodo_id INTEGER, p_usuario_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    c_concepto_anticipo CONSTANT VARCHAR := '204';
    c_decimales         CONSTANT INTEGER := 2;
    v_periodo           periodo;
    v_porcentaje        NUMERIC;
    v_total             INTEGER;
BEGIN
    v_periodo := fn_periodo_abierto(p_periodo_id);

    IF EXISTS (
        SELECT 1
        FROM nomina_empleado ne
        JOIN periodo p ON p.periodo_id = ne.periodo_id
        WHERE ne.tipo_nomina = 'FINMES' AND ne.activo
          AND p.anio = v_periodo.anio AND p.mes = v_periodo.mes
    ) THEN
        RAISE EXCEPTION 'Ya existe nómina de fin de mes para %/%; el anticipo no puede recalcularse',
            fn_nombre_mes(v_periodo.mes), v_periodo.anio;
    END IF;

    v_porcentaje := fn_parametro_numero('ANTICIPO_PORCENTAJE', v_periodo.anio) / 100;

    DELETE FROM nomina_empleado
    WHERE periodo_id = p_periodo_id AND tipo_nomina = 'ANTICIPO';

    INSERT INTO nomina_empleado
        (empleado_id, periodo_id, tipo_nomina, dias_laborados, anticipo, liquido, creado_por)
    SELECT
        e.empleado_id,
        p_periodo_id,
        'ANTICIPO',
        e.dias_laborados,
        ROUND(e.salario_base * v_porcentaje, c_decimales),
        ROUND(e.salario_base * v_porcentaje, c_decimales),
        p_usuario_id
    FROM empleado e
    WHERE e.activo
      AND e.fecha_ingreso <= v_periodo.fecha_fin
      AND (e.fecha_baja IS NULL OR e.fecha_baja >= v_periodo.fecha_inicio);

    GET DIAGNOSTICS v_total = ROW_COUNT;

    INSERT INTO nomina_detalle
        (nomina_empleado_id, concepto_id, concepto_codigo, concepto_nombre, naturaleza_codigo, monto, orden, creado_por)
    SELECT ne.nomina_empleado_id, c.concepto_id, c.codigo, c.nombre, nc.codigo, ne.anticipo, c.orden, p_usuario_id
    FROM nomina_empleado ne
    JOIN concepto c             ON c.codigo = c_concepto_anticipo AND c.activo
    JOIN naturaleza_concepto nc ON nc.naturaleza_id = c.naturaleza_id
    WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'ANTICIPO';

    RETURN v_total;
END;
$$;

-- Nómina de fin de mes: percepciones fijas y variables, descuentos de ley, novedades y provisiones.
-- Puede ejecutarse varias veces mientras el período siga abierto; cada ejecución reemplaza la anterior.
CREATE OR REPLACE FUNCTION fn_calcular_nomina_fin_mes(p_periodo_id INTEGER, p_usuario_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    c_salario          CONSTANT VARCHAR := '100';
    c_hora_extra       CONSTANT VARCHAR := '101';
    c_hora_doble       CONSTANT VARCHAR := '102';
    c_bonif_decreto    CONSTANT VARCHAR := '103';
    c_igss             CONSTANT VARCHAR := '200';
    c_isr              CONSTANT VARCHAR := '201';
    c_aguinaldo        CONSTANT VARCHAR := '300';
    c_bono14           CONSTANT VARCHAR := '301';
    c_pais             CONSTANT VARCHAR := 'GTM';
    c_meses_anio       CONSTANT INTEGER := 12;
    c_decimales        CONSTANT INTEGER := 2;

    v_periodo          periodo;
    v_dias_mes         NUMERIC;
    v_horas_jornada    NUMERIC;
    v_factor_extra     NUMERIC;
    v_factor_doble     NUMERIC;
    v_bonif_decreto    NUMERIC;
    v_pct_igss         NUMERIC;
    v_isr_deduccion    NUMERIC;
    v_isr_limite       NUMERIC;
    v_isr_pct_1        NUMERIC;
    v_isr_pct_2        NUMERIC;
    v_isr_cuota_fija   NUMERIC;
    v_pct_aguinaldo    NUMERIC;
    v_pct_bono14       NUMERIC;
    v_total            INTEGER;
BEGIN
    v_periodo := fn_periodo_abierto(p_periodo_id);

    v_dias_mes       := fn_parametro_numero('DIAS_MES_COMERCIAL', v_periodo.anio);
    v_horas_jornada  := fn_parametro_numero('HORAS_JORNADA_DIARIA', v_periodo.anio);
    v_factor_extra   := fn_parametro_numero('FACTOR_HORA_EXTRA', v_periodo.anio);
    v_factor_doble   := fn_parametro_numero('FACTOR_HORA_DOBLE', v_periodo.anio);
    v_bonif_decreto  := fn_parametro_numero('BONIFICACION_DECRETO', v_periodo.anio);
    v_pct_igss       := fn_parametro_numero('IGSS_LABORAL_PORCENTAJE', v_periodo.anio) / 100;
    v_isr_deduccion  := fn_parametro_numero('ISR_DEDUCCION_PERSONAL', v_periodo.anio);
    v_isr_limite     := fn_parametro_numero('ISR_TRAMO1_LIMITE', v_periodo.anio);
    v_isr_pct_1      := fn_parametro_numero('ISR_TRAMO1_PORCENTAJE', v_periodo.anio) / 100;
    v_isr_pct_2      := fn_parametro_numero('ISR_TRAMO2_PORCENTAJE', v_periodo.anio) / 100;
    v_isr_cuota_fija := fn_parametro_numero('ISR_TRAMO2_CUOTA_FIJA', v_periodo.anio);
    v_pct_aguinaldo  := fn_parametro_numero('AGUINALDO_PORCENTAJE', v_periodo.anio) / 100;
    v_pct_bono14     := fn_parametro_numero('BONO14_PORCENTAJE', v_periodo.anio) / 100;

    DELETE FROM nomina_empleado
    WHERE periodo_id = p_periodo_id AND tipo_nomina = 'FINMES';

    INSERT INTO nomina_empleado
        (empleado_id, periodo_id, tipo_nomina, dias_laborados, anticipo, creado_por)
    SELECT
        e.empleado_id,
        p_periodo_id,
        'FINMES',
        e.dias_laborados,
        COALESCE((
            SELECT SUM(ant.anticipo)
            FROM nomina_empleado ant
            JOIN periodo pa ON pa.periodo_id = ant.periodo_id
            WHERE ant.empleado_id = e.empleado_id
              AND ant.tipo_nomina = 'ANTICIPO'
              AND ant.activo
              AND pa.anio = v_periodo.anio
              AND pa.mes = v_periodo.mes
        ), 0),
        p_usuario_id
    FROM empleado e
    WHERE e.activo
      AND e.fecha_ingreso <= v_periodo.fecha_fin
      AND (e.fecha_baja IS NULL OR e.fecha_baja >= v_periodo.fecha_inicio);

    GET DIAGNOSTICS v_total = ROW_COUNT;

    -- Percepciones fijas y novedades del período
    INSERT INTO nomina_detalle
        (nomina_empleado_id, concepto_id, concepto_codigo, concepto_nombre, naturaleza_codigo, cantidad, monto, orden, creado_por)
    SELECT ne.nomina_empleado_id, c.concepto_id, c.codigo, c.nombre, nc.codigo, l.cantidad, ROUND(l.monto, c_decimales), c.orden, p_usuario_id
    FROM nomina_empleado ne
    JOIN empleado e ON e.empleado_id = ne.empleado_id
    CROSS JOIN LATERAL (
        SELECT c_salario::VARCHAR AS codigo,
               NULL::NUMERIC AS cantidad,
               e.salario_base * ne.dias_laborados / v_dias_mes AS monto
        UNION ALL
        SELECT c_bonif_decreto, NULL, v_bonif_decreto * ne.dias_laborados / v_dias_mes
        UNION ALL
        SELECT cn.codigo,
               SUM(n.cantidad),
               SUM(COALESCE(
                   n.monto,
                   n.cantidad * (e.salario_base / v_dias_mes / v_horas_jornada) *
                       CASE cn.codigo WHEN c_hora_extra THEN v_factor_extra
                                      WHEN c_hora_doble THEN v_factor_doble END
               ))
        FROM novedad_nomina n
        JOIN concepto cn ON cn.concepto_id = n.concepto_id
        WHERE n.periodo_id = p_periodo_id AND n.empleado_id = e.empleado_id AND n.activo
        GROUP BY cn.codigo
    ) l
    JOIN concepto c             ON c.codigo = l.codigo AND c.activo
    JOIN naturaleza_concepto nc ON nc.naturaleza_id = c.naturaleza_id
    WHERE ne.periodo_id = p_periodo_id
      AND ne.tipo_nomina = 'FINMES'
      AND l.monto > 0;

    -- IGSS laboral sobre los conceptos marcados como base en la regla fiscal del año
    INSERT INTO nomina_detalle
        (nomina_empleado_id, concepto_id, concepto_codigo, concepto_nombre, naturaleza_codigo, monto, orden, creado_por)
    SELECT b.nomina_empleado_id, c.concepto_id, c.codigo, c.nombre, nc.codigo, ROUND(b.base * v_pct_igss, c_decimales), c.orden, p_usuario_id
    FROM (
        SELECT nd.nomina_empleado_id,
               SUM(nd.monto - LEAST(
                   nd.monto * COALESCE(rf.porcentaje_exencion, 0) / 100,
                   COALESCE(rf.limite_exencion, nd.monto)
               )) AS base
        FROM nomina_detalle nd
        JOIN nomina_empleado ne      ON ne.nomina_empleado_id = nd.nomina_empleado_id
        JOIN concepto_regla_fiscal rf ON rf.concepto_id = nd.concepto_id
                                     AND rf.pais = c_pais
                                     AND rf.anio = v_periodo.anio
                                     AND rf.tipo_impuesto = 'IGSS'
                                     AND rf.es_base_calculo
                                     AND rf.activo
        WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES'
        GROUP BY nd.nomina_empleado_id
    ) b
    JOIN concepto c             ON c.codigo = c_igss AND c.activo
    JOIN naturaleza_concepto nc ON nc.naturaleza_id = c.naturaleza_id
    WHERE b.base > 0;

    -- ISR asalariados: proyección anual, deducción personal y cuotas IGSS; tasa por tramos
    INSERT INTO nomina_detalle
        (nomina_empleado_id, concepto_id, concepto_codigo, concepto_nombre, naturaleza_codigo, monto, orden, creado_por)
    SELECT r.nomina_empleado_id, c.concepto_id, c.codigo, c.nombre, nc.codigo,
           ROUND(
               CASE WHEN r.renta_imponible <= v_isr_limite
                    THEN r.renta_imponible * v_isr_pct_1
                    ELSE v_isr_cuota_fija + (r.renta_imponible - v_isr_limite) * v_isr_pct_2
               END / c_meses_anio,
               c_decimales),
           c.orden, p_usuario_id
    FROM (
        SELECT g.nomina_empleado_id,
               (g.gravable - COALESCE(igss.monto, 0)) * c_meses_anio - v_isr_deduccion AS renta_imponible
        FROM (
            SELECT nd.nomina_empleado_id,
                   SUM(nd.monto - LEAST(
                       nd.monto * COALESCE(rf.porcentaje_exencion, 0) / 100,
                       COALESCE(rf.limite_exencion, nd.monto)
                   )) AS gravable
            FROM nomina_detalle nd
            JOIN nomina_empleado ne      ON ne.nomina_empleado_id = nd.nomina_empleado_id
            JOIN concepto_regla_fiscal rf ON rf.concepto_id = nd.concepto_id
                                         AND rf.pais = c_pais
                                         AND rf.anio = v_periodo.anio
                                         AND rf.tipo_impuesto = 'ISR'
                                         AND rf.es_gravable
                                         AND rf.activo
            WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES'
            GROUP BY nd.nomina_empleado_id
        ) g
        LEFT JOIN nomina_detalle igss ON igss.nomina_empleado_id = g.nomina_empleado_id
                                     AND igss.concepto_codigo = c_igss
    ) r
    JOIN concepto c             ON c.codigo = c_isr AND c.activo
    JOIN naturaleza_concepto nc ON nc.naturaleza_id = c.naturaleza_id
    WHERE r.renta_imponible > 0;

    -- Provisiones patronales sobre el salario ordinario
    INSERT INTO nomina_detalle
        (nomina_empleado_id, concepto_id, concepto_codigo, concepto_nombre, naturaleza_codigo, monto, orden, creado_por)
    SELECT s.nomina_empleado_id, c.concepto_id, c.codigo, c.nombre, nc.codigo,
           ROUND(s.monto * CASE c.codigo WHEN c_aguinaldo THEN v_pct_aguinaldo ELSE v_pct_bono14 END, c_decimales),
           c.orden, p_usuario_id
    FROM nomina_detalle s
    JOIN nomina_empleado ne     ON ne.nomina_empleado_id = s.nomina_empleado_id
    JOIN concepto c             ON c.codigo IN (c_aguinaldo, c_bono14) AND c.activo
    JOIN naturaleza_concepto nc ON nc.naturaleza_id = c.naturaleza_id
    WHERE ne.periodo_id = p_periodo_id
      AND ne.tipo_nomina = 'FINMES'
      AND s.concepto_codigo = c_salario;

    UPDATE nomina_empleado ne
    SET total_percepciones = t.percepciones,
        total_deducciones  = t.deducciones,
        total_provisiones  = t.provisiones,
        liquido            = t.percepciones - t.deducciones - ne.anticipo
    FROM (
        SELECT nd.nomina_empleado_id,
               COALESCE(SUM(nd.monto) FILTER (WHERE nd.naturaleza_codigo = 'PERCEPCION'), 0) AS percepciones,
               COALESCE(SUM(nd.monto) FILTER (WHERE nd.naturaleza_codigo = 'DEDUCCION'), 0)  AS deducciones,
               COALESCE(SUM(nd.monto) FILTER (WHERE nd.naturaleza_codigo = 'PROVISION'), 0)  AS provisiones
        FROM nomina_detalle nd
        GROUP BY nd.nomina_empleado_id
    ) t
    WHERE t.nomina_empleado_id = ne.nomina_empleado_id
      AND ne.periodo_id = p_periodo_id
      AND ne.tipo_nomina = 'FINMES';

    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_cerrar_nomina(p_periodo_id INTEGER, p_usuario_id INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total INTEGER;
BEGIN
    PERFORM fn_periodo_abierto(p_periodo_id);

    UPDATE nomina_empleado
    SET estado = 'CERRADA', modificado_por = p_usuario_id, fecha_modificacion = now()
    WHERE periodo_id = p_periodo_id AND activo;

    GET DIAGNOSTICS v_total = ROW_COUNT;

    IF v_total = 0 THEN
        RAISE EXCEPTION 'No hay nóminas calculadas para este período';
    END IF;

    UPDATE periodo
    SET estado = 'CERRADO',
        fecha_cierre = now(),
        cerrado_por = p_usuario_id,
        fecha_modificacion = now(),
        modificado_por = p_usuario_id
    WHERE periodo_id = p_periodo_id;

    RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION fn_listado_cumpleanieros(p_mes INTEGER)
RETURNS TABLE (
    empleado_id         INTEGER,
    codigo_empleado     VARCHAR,
    empleado            TEXT,
    departamento        VARCHAR,
    puesto              VARCHAR,
    correo_corporativo  VARCHAR,
    fecha_nacimiento    DATE,
    dia                 INTEGER,
    mes_nacimiento      VARCHAR,
    edad                INTEGER
)
LANGUAGE sql
STABLE
AS $$
    SELECT e.empleado_id,
           e.codigo_empleado,
           e.nombres || ' ' || e.apellidos,
           d.nombre,
           e.puesto,
           e.correo_corporativo,
           e.fecha_nacimiento,
           EXTRACT(DAY FROM e.fecha_nacimiento)::INTEGER,
           fn_nombre_mes(EXTRACT(MONTH FROM e.fecha_nacimiento)::INTEGER),
           (EXTRACT(YEAR FROM current_date) - EXTRACT(YEAR FROM e.fecha_nacimiento))::INTEGER
    FROM empleado e
    JOIN departamento d ON d.departamento_id = e.departamento_id
    WHERE EXTRACT(MONTH FROM e.fecha_nacimiento) = p_mes
      AND e.activo
    ORDER BY EXTRACT(DAY FROM e.fecha_nacimiento), e.apellidos;
$$;

CREATE OR REPLACE FUNCTION fn_listado_descuento(p_periodo_id INTEGER, p_concepto_codigo VARCHAR)
RETURNS TABLE (
    anio             INTEGER,
    mes              VARCHAR,
    numero_periodo   INTEGER,
    tipo_periodo     VARCHAR,
    codigo_empleado  VARCHAR,
    empleado         TEXT,
    departamento     VARCHAR,
    salario_base     NUMERIC,
    monto            NUMERIC,
    fecha_calculo    TIMESTAMPTZ
)
LANGUAGE sql
STABLE
AS $$
    SELECT p.anio,
           fn_nombre_mes(p.mes),
           p.numero_periodo,
           p.tipo_periodo,
           e.codigo_empleado,
           e.nombres || ' ' || e.apellidos,
           d.nombre,
           e.salario_base,
           nd.monto,
           ne.fecha_calculo
    FROM nomina_detalle nd
    JOIN nomina_empleado ne ON ne.nomina_empleado_id = nd.nomina_empleado_id
    JOIN empleado e         ON e.empleado_id = ne.empleado_id
    JOIN departamento d     ON d.departamento_id = e.departamento_id
    JOIN periodo p          ON p.periodo_id = ne.periodo_id
    WHERE nd.concepto_codigo = p_concepto_codigo
      AND ne.periodo_id = p_periodo_id
      AND ne.tipo_nomina = 'FINMES'
      AND ne.activo
    ORDER BY d.nombre, e.apellidos, e.nombres;
$$;

CREATE OR REPLACE FUNCTION fn_poliza_contabilidad(p_periodo_id INTEGER)
RETURNS TABLE (
    cuenta_contable  VARCHAR,
    departamento     VARCHAR,
    tipo_movimiento  VARCHAR,
    concepto         VARCHAR,
    debe             NUMERIC,
    haber            NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    c_concepto_anticipo CONSTANT VARCHAR := '204';
    v_anio              INTEGER;
    v_cuenta_sueldos    VARCHAR;
    v_cuenta_anticipo   VARCHAR;
BEGIN
    SELECT p.anio INTO v_anio FROM periodo p WHERE p.periodo_id = p_periodo_id;
    v_cuenta_sueldos := fn_parametro_texto('CUENTA_SUELDOS_POR_PAGAR', v_anio);
    SELECT c.cuenta_contable INTO v_cuenta_anticipo FROM concepto c WHERE c.codigo = c_concepto_anticipo AND c.activo;

    RETURN QUERY
    SELECT x.cuenta_contable, x.departamento, x.tipo_movimiento, x.concepto, x.debe, x.haber
    FROM (
        SELECT d.cuenta_contable,
               d.nombre AS departamento,
               'DEBE'::VARCHAR AS tipo_movimiento,
               'Gasto de nómina'::VARCHAR AS concepto,
               SUM(ne.total_percepciones) AS debe,
               0::NUMERIC AS haber
        FROM nomina_empleado ne
        JOIN empleado e     ON e.empleado_id = ne.empleado_id
        JOIN departamento d ON d.departamento_id = e.departamento_id
        WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES' AND ne.activo
        GROUP BY d.cuenta_contable, d.nombre

        UNION ALL

        SELECT c.cuenta_contable, d.nombre, 'HABER', c.nombre, 0, SUM(nd.monto)
        FROM nomina_detalle nd
        JOIN concepto c         ON c.concepto_id = nd.concepto_id
        JOIN nomina_empleado ne ON ne.nomina_empleado_id = nd.nomina_empleado_id
        JOIN empleado e         ON e.empleado_id = ne.empleado_id
        JOIN departamento d     ON d.departamento_id = e.departamento_id
        WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES' AND ne.activo
          AND nd.naturaleza_codigo = 'DEDUCCION'
        GROUP BY c.cuenta_contable, d.nombre, c.nombre

        UNION ALL

        SELECT v_cuenta_anticipo, d.nombre, 'HABER', 'Anticipo a empleados', 0, SUM(ne.anticipo)
        FROM nomina_empleado ne
        JOIN empleado e     ON e.empleado_id = ne.empleado_id
        JOIN departamento d ON d.departamento_id = e.departamento_id
        WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES' AND ne.activo
          AND ne.anticipo > 0
        GROUP BY d.nombre

        UNION ALL

        SELECT v_cuenta_sueldos, d.nombre, 'HABER', 'Sueldos por pagar', 0, SUM(ne.liquido)
        FROM nomina_empleado ne
        JOIN empleado e     ON e.empleado_id = ne.empleado_id
        JOIN departamento d ON d.departamento_id = e.departamento_id
        WHERE ne.periodo_id = p_periodo_id AND ne.tipo_nomina = 'FINMES' AND ne.activo
        GROUP BY d.nombre
    ) x
    ORDER BY x.tipo_movimiento, x.cuenta_contable, x.departamento;
END;
$$;

CREATE OR REPLACE FUNCTION fn_libro_salarios(p_periodo_id INTEGER)
RETURNS TABLE (
    anio             INTEGER,
    mes              VARCHAR,
    numero_periodo   INTEGER,
    tipo_periodo     VARCHAR,
    departamento     VARCHAR,
    codigo_empleado  VARCHAR,
    empleado         TEXT,
    puesto           VARCHAR,
    salario_base     NUMERIC,
    dias_laborados   INTEGER,
    ingresos         NUMERIC,
    egresos          NUMERIC,
    provisiones      NUMERIC,
    anticipo         NUMERIC,
    liquido          NUMERIC,
    estado           VARCHAR
)
LANGUAGE sql
STABLE
AS $$
    SELECT p.anio,
           fn_nombre_mes(p.mes),
           p.numero_periodo,
           p.tipo_periodo,
           d.nombre,
           e.codigo_empleado,
           e.nombres || ' ' || e.apellidos,
           e.puesto,
           e.salario_base,
           ne.dias_laborados,
           ne.total_percepciones,
           ne.total_deducciones,
           ne.total_provisiones,
           ne.anticipo,
           ne.liquido,
           ne.estado
    FROM nomina_empleado ne
    JOIN empleado e     ON e.empleado_id = ne.empleado_id
    JOIN departamento d ON d.departamento_id = e.departamento_id
    JOIN periodo p      ON p.periodo_id = ne.periodo_id
    WHERE ne.periodo_id = p_periodo_id
      AND ne.tipo_nomina = 'FINMES'
      AND ne.activo
    ORDER BY d.nombre, e.apellidos, e.nombres;
$$;
