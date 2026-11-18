export class CandidateListItemDto {
  id!: number;
  fullName!: string;
  documentType!: string;
  documentNumber!: string;
  email!: string;
  company!: string | null;
  status!: string | null;
  concept!: string | null;
}
