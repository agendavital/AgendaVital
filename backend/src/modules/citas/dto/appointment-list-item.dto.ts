export class AppointmentListItemDto {
  id!: string;
  examRequestId!: string;
  candidateName!: string;
  document!: string;
  company!: string;
  examType!: string;
  clinic!: string;
  city!: string | null;
  startsAt!: string;
  endsAt!: string;
  status!: string;
}
