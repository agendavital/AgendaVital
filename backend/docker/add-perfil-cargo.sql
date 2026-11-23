USE AgendaVital;

IF OBJECT_ID(N'dbo.PerfilCargo', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.PerfilCargo (
    PerfilCargoId BIGINT IDENTITY(1,1) NOT NULL,
    ProcesoOcupacionalId BIGINT NOT NULL,
    NombreCargo NVARCHAR(120) NOT NULL,
    FuncionesResponsabilidades NVARCHAR(MAX) NOT NULL,
    HabilidadesCompetencias NVARCHAR(MAX) NOT NULL,
    RequisitosFisicosMentales NVARCHAR(MAX) NOT NULL,
    RiesgosLaborales NVARCHAR(MAX) NOT NULL,
    MedidasPreventivas NVARCHAR(MAX) NOT NULL,
    IndicadoresEpidemiologicos NVARCHAR(MAX) NOT NULL,
    MatrizPeligrosRiesgos NVARCHAR(MAX) NOT NULL,
    EstudiosTecnicos NVARCHAR(MAX) NOT NULL,
    IndicadoresBiologicos NVARCHAR(MAX) NOT NULL,
    RegistradoPorUsuarioId INT NOT NULL,
    RegistradoEn DATETIME2 NOT NULL
      CONSTRAINT DF_PerfilCargo_RegistradoEn DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PerfilCargo PRIMARY KEY (PerfilCargoId),
    CONSTRAINT UQ_PerfilCargo_Proceso UNIQUE (ProcesoOcupacionalId),
    CONSTRAINT FK_PerfilCargo_Proceso FOREIGN KEY (ProcesoOcupacionalId)
      REFERENCES dbo.ProcesoOcupacional (ProcesoOcupacionalId),
    CONSTRAINT FK_PerfilCargo_RegistradoPor FOREIGN KEY (RegistradoPorUsuarioId)
      REFERENCES dbo.Usuario (UsuarioId)
  );
END;

IF COL_LENGTH(N'dbo.PerfilCargo', N'RecibidoPorProfesionalId') IS NULL
  ALTER TABLE dbo.PerfilCargo ADD RecibidoPorProfesionalId INT NULL;

IF COL_LENGTH(N'dbo.PerfilCargo', N'RecibidoEn') IS NULL
  ALTER TABLE dbo.PerfilCargo ADD RecibidoEn DATETIME2 NULL;

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_PerfilCargo_RecibidoPor'
)
BEGIN
  ALTER TABLE dbo.PerfilCargo
    ADD CONSTRAINT FK_PerfilCargo_RecibidoPor
      FOREIGN KEY (RecibidoPorProfesionalId)
      REFERENCES dbo.Profesional (ProfesionalId);
END;
