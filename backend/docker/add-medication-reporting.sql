USE AgendaVital;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.EvaluacionOcupacional', 'TomaMedicamentos') IS NULL
BEGIN
  ALTER TABLE dbo.EvaluacionOcupacional
  ADD TomaMedicamentos BIT NULL;
END;

IF COL_LENGTH('dbo.EvaluacionOcupacional', 'MedicamentosRevisados') IS NULL
BEGIN
  ALTER TABLE dbo.EvaluacionOcupacional
  ADD MedicamentosRevisados BIT NULL;
END;

IF OBJECT_ID('dbo.MedicamentoReportado', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MedicamentoReportado (
    MedicamentoReportadoId BIGINT IDENTITY(1,1) NOT NULL,
    EvaluacionOcupacionalId BIGINT NOT NULL,
    Nombre NVARCHAR(160) NOT NULL,
    Dosis NVARCHAR(120) NULL,
    Frecuencia NVARCHAR(120) NULL,
    CONSTRAINT PK_MedicamentoReportado
      PRIMARY KEY (MedicamentoReportadoId),
    CONSTRAINT FK_MedicamentoReportado_Evaluacion
      FOREIGN KEY (EvaluacionOcupacionalId)
      REFERENCES dbo.EvaluacionOcupacional (EvaluacionOcupacionalId)
  );

END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_MedicamentoReportado_Evaluacion'
    AND object_id = OBJECT_ID('dbo.MedicamentoReportado')
)
BEGIN
  CREATE INDEX IX_MedicamentoReportado_Evaluacion
    ON dbo.MedicamentoReportado (EvaluacionOcupacionalId);
END;

COMMIT TRANSACTION;
GO
