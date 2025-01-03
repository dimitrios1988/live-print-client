export interface IRunner {
  bib: number;
  birthdate: Date | null;
  chip_2_go_qr_data: string;
  chip_2_go_qr_base64?: string;
  club: string | null;
  fathers_name: string | null;
  first_name_greek: string | null;
  first_name_latin: string;
  id: number;
  is_printed: boolean;
  last_name_greek: string | null;
  last_name_latin: string;
  event: string;
  allow_reprinting: boolean;
  tshirt_size: string | null;
  gender: string;
  block: number | null;
  nationality: string | null;
  group: string | null;
  printed_at: Date | null;
}
