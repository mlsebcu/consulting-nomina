-- Catálogos base y datos de demostración.
-- El usuario administrador se crea con `npm run seed:admin` (backend) para no versionar credenciales.

BEGIN;

INSERT INTO naturaleza_concepto (codigo, nombre, afecta_neto, es_provision, orden) VALUES
    ('PERCEPCION', 'Percepción', TRUE,  FALSE, 1),
    ('DEDUCCION',  'Deducción',  TRUE,  FALSE, 2),
    ('PROVISION',  'Provisión',  FALSE, TRUE,  3);

INSERT INTO concepto (codigo, nombre, naturaleza_id, tipo_calculo, cuenta_contable, orden, es_sistema)
SELECT v.codigo, v.nombre, n.naturaleza_id, v.tipo_calculo, v.cuenta, v.orden, v.es_sistema
FROM (VALUES
    ('100', 'Salario Base',                  'PERCEPCION', 'FIJO',       '5101-01', 1, TRUE),
    ('101', 'Horas Extras',                  'PERCEPCION', 'FORMULA',    '5101-02', 2, TRUE),
    ('102', 'Horas Dobles',                  'PERCEPCION', 'FORMULA',    '5101-03', 3, TRUE),
    ('103', 'Bonificación Decreto 37-2001',  'PERCEPCION', 'FIJO',       '5101-04', 4, TRUE),
    ('104', 'Bonificación por Producción',   'PERCEPCION', 'MANUAL',     '5101-05', 5, FALSE),
    ('105', 'Comisiones',                    'PERCEPCION', 'MANUAL',     '5101-06', 6, FALSE),
    ('200', 'IGSS Laboral',                  'DEDUCCION',  'PORCENTAJE', '2101-01', 1, TRUE),
    ('201', 'ISR',                           'DEDUCCION',  'FORMULA',    '2101-02', 2, TRUE),
    ('202', 'Asociación Solidarista',        'DEDUCCION',  'MANUAL',     '2101-03', 3, FALSE),
    ('203', 'Descuento Tienda Solidarista',  'DEDUCCION',  'MANUAL',     '2101-04', 4, FALSE),
    ('204', 'Anticipo Quincenal',            'DEDUCCION',  'FORMULA',    '1105-01', 5, TRUE),
    ('300', 'Provisión Aguinaldo',           'PROVISION',  'PORCENTAJE', '2201-01', 1, TRUE),
    ('301', 'Provisión Bono 14',             'PROVISION',  'PORCENTAJE', '2201-02', 2, TRUE)
) AS v (codigo, nombre, naturaleza, tipo_calculo, cuenta, orden, es_sistema)
JOIN naturaleza_concepto n ON n.codigo = v.naturaleza
ORDER BY v.codigo;

-- Tratamiento fiscal 2026: la bonificación decreto no es base de IGSS ni gravable para ISR.
INSERT INTO concepto_regla_fiscal (concepto_id, pais, anio, tipo_impuesto, es_gravable, es_base_calculo)
SELECT c.concepto_id, 'GTM', 2026, t.tipo, c.codigo <> '103', c.codigo <> '103'
FROM concepto c
CROSS JOIN (VALUES ('IGSS'), ('ISR')) AS t (tipo)
WHERE c.codigo IN ('100', '101', '102', '103', '104', '105');

INSERT INTO parametro_nomina (codigo, descripcion, tipo_dato, valor, anio) VALUES
    ('ANTICIPO_PORCENTAJE',      'Porcentaje del salario base pagado como anticipo el día 15', 'NUMERO', '50',     2026),
    ('DIAS_MES_COMERCIAL',       'Días del mes comercial para prorrateo de salario',           'NUMERO', '30',     2026),
    ('HORAS_JORNADA_DIARIA',     'Horas de la jornada ordinaria diurna',                       'NUMERO', '8',      2026),
    ('FACTOR_HORA_EXTRA',        'Recargo de hora extra sobre el valor hora ordinario',        'NUMERO', '1.5',    2026),
    ('FACTOR_HORA_DOBLE',        'Recargo de hora en día de descanso o asueto',                'NUMERO', '2',      2026),
    ('BONIFICACION_DECRETO',     'Bonificación incentivo mensual (Decreto 37-2001)',           'NUMERO', '250',    2026),
    ('IGSS_LABORAL_PORCENTAJE',  'Cuota laboral IGSS',                                         'NUMERO', '4.83',   2026),
    ('ISR_DEDUCCION_PERSONAL',   'Deducción personal anual sin comprobación',                  'NUMERO', '48000',  2026),
    ('ISR_TRAMO1_LIMITE',        'Renta imponible anual máxima del primer tramo',              'NUMERO', '300000', 2026),
    ('ISR_TRAMO1_PORCENTAJE',    'Tasa ISR primer tramo',                                      'NUMERO', '5',      2026),
    ('ISR_TRAMO2_PORCENTAJE',    'Tasa ISR sobre el excedente del primer tramo',               'NUMERO', '7',      2026),
    ('ISR_TRAMO2_CUOTA_FIJA',    'Importe fijo anual del segundo tramo',                       'NUMERO', '15000',  2026),
    ('AGUINALDO_PORCENTAJE',     'Provisión mensual de aguinaldo',                             'NUMERO', '8.33',   2026),
    ('BONO14_PORCENTAJE',        'Provisión mensual de bono 14',                               'NUMERO', '8.33',   2026),
    ('CUENTA_SUELDOS_POR_PAGAR', 'Cuenta contable del líquido a pagar',                        'TEXTO',  '2101-99', 2026);

INSERT INTO departamento (nombre, cuenta_contable) VALUES
    ('Finanzas',         '5101-10'),
    ('Producción',       '5101-20'),
    ('Logística',        '5101-30'),
    ('Recursos Humanos', '5101-40'),
    ('Mercadeo',         '5101-50');

INSERT INTO empleado (
    codigo_empleado, nombres, apellidos, dpi, nit, fecha_nacimiento, genero, estado_civil, direccion,
    telefono_movil, correo_personal, correo_corporativo, contacto_emergencia_nombre, contacto_emergencia_telefono,
    banco, tipo_cuenta, numero_cuenta, fecha_ingreso, puesto, salario_base, dias_laborados, departamento_id
)
SELECT v.codigo, v.nombres, v.apellidos, v.dpi, v.nit, v.nacimiento::DATE, v.genero, v.estado_civil, 'Ciudad de Guatemala',
       v.telefono, translate(lower(v.nombres), 'áéíóúñ', 'aeioun') || '@correo.test',
       translate(lower(v.nombres || '.' || split_part(v.apellidos, ' ', 1)), 'áéíóúñ', 'aeioun') || '@consulting.test',
       'Contacto ' || v.nombres, '55550000', 'Banco Industrial', v.tipo_cuenta, v.cuenta, v.ingreso::DATE, v.puesto,
       v.salario, 30, d.departamento_id
FROM (VALUES
    ('EMP-001', 'Ana',     'López Méndez',    '1000000000101', '1000001', '1990-11-12', 'FEMENINO',  'CASADO',  '55551001', 'MONETARIA', '3000001', '2019-02-01', 'Contadora General',      12500.00, 'Finanzas'),
    ('EMP-002', 'Carlos',  'Pérez Ruiz',      '1000000000202', '1000002', '1988-03-04', 'MASCULINO', 'SOLTERO', '55551002', 'AHORRO',    '3000002', '2020-06-15', 'Analista Financiero',     7800.00, 'Finanzas'),
    ('EMP-003', 'María',   'García Soto',     '1000000000303', '1000003', '1995-11-28', 'FEMENINO',  'SOLTERO', '55551003', 'MONETARIA', '3000003', '2021-01-10', 'Supervisora de Planta',   9200.00, 'Producción'),
    ('EMP-004', 'José',    'Hernández Cruz',  '1000000000404', '1000004', '1992-07-19', 'MASCULINO', 'CASADO',  '55551004', 'MONETARIA', '3000004', '2018-09-03', 'Operario',                4500.00, 'Producción'),
    ('EMP-005', 'Lucía',   'Martínez Paz',    '1000000000505', '1000005', '1993-05-08', 'FEMENINO',  'CASADO',  '55551005', 'AHORRO',    '3000005', '2022-03-01', 'Coordinadora Logística',  8600.00, 'Logística'),
    ('EMP-006', 'Pedro',   'Ramírez Luna',    '1000000000606', '1000006', '1985-11-02', 'MASCULINO', 'DIVORCIADO', '55551006', 'MONETARIA', '3000006', '2017-11-20', 'Piloto Repartidor',  4200.00, 'Logística'),
    ('EMP-007', 'Sofía',   'Castillo Ortiz',  '1000000000707', '1000007', '1991-01-25', 'FEMENINO',  'SOLTERO', '55551007', 'MONETARIA', '3000007', '2020-02-17', 'Jefa de Recursos Humanos', 14000.00, 'Recursos Humanos'),
    ('EMP-008', 'Diego',   'Morales Vega',    '1000000000808', '1000008', '1997-09-30', 'MASCULINO', 'SOLTERO', '55551008', 'AHORRO',    '3000008', '2023-05-02', 'Reclutador',              6200.00, 'Recursos Humanos'),
    ('EMP-009', 'Valeria', 'Rodríguez Gil',   '1000000000909', '1000009', '1994-12-14', 'FEMENINO',  'CASADO',  '55551009', 'MONETARIA', '3000009', '2021-08-09', 'Gerente de Mercadeo',    32000.00, 'Mercadeo'),
    ('EMP-010', 'Andrés',  'Flores Reyes',    '1000000001010', '1000010', '1996-11-21', 'MASCULINO', 'SOLTERO', '55551010', 'AHORRO',    '3000010', '2022-10-03', 'Ejecutivo de Ventas',     5500.00, 'Mercadeo')
) AS v (codigo, nombres, apellidos, dpi, nit, nacimiento, genero, estado_civil, telefono, tipo_cuenta, cuenta, ingreso, puesto, salario, departamento)
JOIN departamento d ON d.nombre = v.departamento
ORDER BY v.codigo;

INSERT INTO periodo (anio, mes, numero_periodo, tipo_periodo, fecha_inicio, fecha_fin) VALUES
    (2026, 10, 10, 'MENSUAL', '2026-10-01', '2026-10-31'),
    (2026, 11, 11, 'MENSUAL', '2026-11-01', '2026-11-30');

INSERT INTO novedad_nomina (empleado_id, periodo_id, concepto_id, cantidad, monto, observacion)
SELECT e.empleado_id, p.periodo_id, c.concepto_id, v.cantidad, v.monto, v.observacion
FROM (VALUES
    ('EMP-003', '101', 10::NUMERIC,  NULL::NUMERIC, 'Cierre de producción'),
    ('EMP-004', '101', 16,           NULL,          'Turno extendido'),
    ('EMP-004', '102', 8,            NULL,          'Trabajo en día de asueto'),
    ('EMP-004', '104', NULL,         600.00,        'Meta de producción alcanzada'),
    ('EMP-006', '101', 6,            NULL,          'Rutas adicionales'),
    ('EMP-010', '105', NULL,         3200.00,       'Comisión ventas octubre'),
    ('EMP-009', '105', NULL,         1500.00,       'Comisión cuenta corporativa'),
    ('EMP-001', '202', NULL,         625.00,        'Ahorro mensual 5%'),
    ('EMP-004', '202', NULL,         225.00,        'Ahorro mensual 5%'),
    ('EMP-007', '202', NULL,         700.00,        'Ahorro mensual 5%'),
    ('EMP-004', '203', NULL,         180.50,        'Compra de víveres'),
    ('EMP-006', '203', NULL,         95.00,         'Compra de útiles escolares')
) AS v (codigo_empleado, codigo_concepto, cantidad, monto, observacion)
JOIN empleado e ON e.codigo_empleado = v.codigo_empleado
JOIN concepto c ON c.codigo = v.codigo_concepto
JOIN periodo p  ON p.anio = 2026 AND p.mes = 11;

COMMIT;
