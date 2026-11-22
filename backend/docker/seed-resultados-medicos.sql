USE AgendaVital;
GO

SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF NOT EXISTS (
  SELECT 1 FROM dbo.EstadoCita WHERE Codigo = 'REALIZADA'
)
BEGIN
  INSERT INTO dbo.EstadoCita (Codigo, Nombre)
  VALUES ('REALIZADA', N'Realizada');
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.ConceptoOcupacional WHERE Codigo = 'APTO'
)
BEGIN
  INSERT INTO dbo.ConceptoOcupacional (Codigo, Nombre)
  VALUES ('APTO', N'Apto');
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.ConceptoOcupacional WHERE Codigo = 'APTO_CON_RESTRICCIONES'
)
BEGIN
  INSERT INTO dbo.ConceptoOcupacional (Codigo, Nombre)
  VALUES ('APTO_CON_RESTRICCIONES', N'Apto con restricciones');
END;

IF NOT EXISTS (
  SELECT 1 FROM dbo.ConceptoOcupacional WHERE Codigo = 'NO_APTO'
)
BEGIN
  INSERT INTO dbo.ConceptoOcupacional (Codigo, Nombre)
  VALUES ('NO_APTO', N'No apto');
END;

COMMIT TRANSACTION;
