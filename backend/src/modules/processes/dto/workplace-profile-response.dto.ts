export class WorkplaceProfileResponseDto {
  nombreCargo!: string;
  funcionesResponsabilidades!: string;
  habilidadesCompetencias!: string;
  requisitosFisicosMentales!: string;
  riesgosLaborales!: string;
  medidasPreventivas!: string;
  indicadoresEpidemiologicos!: string;
  matrizPeligrosRiesgos!: string;
  estudiosTecnicos!: string;
  indicadoresBiologicos!: string;
  registradoEn!: string;
}

export class WorkplaceProfileSaveResultDto {
  message!: string;
  registradoEn!: string;
}
