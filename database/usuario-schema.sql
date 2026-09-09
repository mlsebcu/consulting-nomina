/* ============================================================
   PROYECTO: Sistema de Nóminas - Consulting, S.A.
   Contenido: Tabla de usuarios para autenticación (JWT)
   ============================================================ */

CREATE TABLE Usuario (
    UsuarioId        INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario    VARCHAR(50)  NOT NULL UNIQUE,
    PasswordHash     VARCHAR(200) NOT NULL,       -- hash bcrypt, nunca texto plano
    Rol              VARCHAR(20)  NOT NULL,       -- 'ADMIN' o 'RRHH'
    EmpleadoId       INT NULL,
    Activo           BIT NOT NULL DEFAULT 1,
    FechaCreacion    DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Usuario_Empleado FOREIGN KEY (EmpleadoId)
        REFERENCES Empleado(EmpleadoId),
    CONSTRAINT CK_Usuario_Rol CHECK (Rol IN ('ADMIN', 'RRHH'))
);