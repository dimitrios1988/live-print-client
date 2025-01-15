export interface IRunner {
  bib: number;
  birthdate: Date | null;
  chip_2_go_qr_data: string;
  chip_2_go_qr_base64?: string;
  club: string | null;
  fathers_name: string | null;
  first_name: string;
  id: number;
  is_printed: boolean;
  last_name: string;
  event_name: string;
  event_id: number;
  allow_reprinting: boolean;
  tshirt_size: string | null;
  gender: string;
  block: number | null;
  nationality: string | null;
  group_name: string | null;
  group_id: number | null;
  printed_at: Date | null;
  registration_level: string | null;
}
