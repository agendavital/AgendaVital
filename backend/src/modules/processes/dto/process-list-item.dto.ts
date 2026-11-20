export class ProcessListItemDto {
  id!: string;
  candidateName!: string;
  documentType!: string;
  documentNumber!: string;
  company!: string;
  status!: string;
  startDate!: string;
  closeDate!: string | null;
}
