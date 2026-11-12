export interface IRunner {
  bib: number | null;
  birthdate: Date | null;
  chip_2_go_data: string;
  chip_2_go_qr_base64?: string;
  club: string | null;
  fathers_name: string | null;
  first_name: string | null;
  id: number;
  is_printed: boolean;
  last_name: string | null;
  event_name: string;
  event_name_en: string | null;
  event_id: number;
  allow_reprinting: boolean;
  tshirt_size: string | null;
  gender: string;
  block: string | null;
  nationality: string | null;
  group_name: string | null;
  group_id: number | null;
  printed_at: Date | null;
  registration_level: string | null;
  has_tshirt: boolean;
  receives_as_a_group: boolean;
  age_group: string | null;
  assigned_bib_template: _assigned_bib_template | null;
}

interface _assigned_bib_template {
  id: number;
  bib_frontside_background_url: string | null;
  bib_backside_background_url: string | null;
  bib_backside_template: string | null;
  bib_frontside_template: string | null;
  bib_styling: string | null;
}
