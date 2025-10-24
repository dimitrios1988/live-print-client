export interface IGetRunnerResponse {
  '0(runner)': _0runner;
  '1(event)': _1event;
  '2(gender)': _2gender;
  '5(group)': _5group;
  '6(print_log)': _6printlog;
  '7(t_shirt_size)': _7t_shirt_size;
  '9(registration_level)': _9registrationlevel;
  '10(nationality)': _10nationality;
}

interface _10nationality {
  name: string;
  printed_text: string | null;
}

interface _9registrationlevel {
  name: string;
  printed_text: string | null;
  has_tshirt: boolean;
}

interface _7t_shirt_size {
  name: string;
  printed_text: string | null;
}

interface _6printlog {
  printed_at: number;
}

interface _5group {
  name: string;
  id: number;
  printed_text: string | null;
}

interface _2gender {
  name: string;
  printed_text: string | null;
}

interface _1event {
  allow_reprinting: boolean;
  printed_text: string | null;
  id: number;
  name: string;
}

interface _0runner {
  id: number;
  bib: number | null;
  birthdate: number | null;
  fathers_name: string | null;
  first_name_greek: string | null;
  last_name_greek: string | null;
  first_name_latin: string | null;
  last_name_latin: string | null;
  is_printed: boolean;
  chip_2_go_qr_data: string;
  block: number | null;
  club: string | null;
  receives_as_a_group: boolean;
}
