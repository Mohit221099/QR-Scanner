export interface QRData {
  id: string;
  email: string;
  name: string;
  ticketType: string;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  isCheckedIn: boolean;
  checkInTime?: string;
}