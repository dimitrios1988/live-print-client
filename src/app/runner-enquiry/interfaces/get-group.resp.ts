export interface IGetGroupResponse {
  '0(group)': _0group;
  '1(runner)': _1runner;
  '2(event)': _2event;
  '3(gender)': _3gender;
  '5(print_log)': _5printlog;
  '6(t_shirt_size)': _6ts_shirt_size;
  '8(registration_level)': _8registrationlevel;
  '9(nationality)': _9nationality;
}

interface _9nationality {
  name: string;
  printed_text: string | null;
}

interface _8registrationlevel {
  name: string;
  printed_text: string | null;
  has_tshirt: boolean;
}

interface _6ts_shirt_size {
  name: string;
  printed_text: string | null;
}

interface _5printlog {
  printed_at: number;
}

interface _3gender {
  name: string;
  printed_text: string | null;
}

interface _2event {
  allow_reprinting: boolean;
  printed_text: string | null;
  id: number;
  name: string;
}

interface _1runner {
  id: number;
  bib: number;
  birthdate: number | null;
  fathers_name: string | null;
  first_name_greek: string | null;
  first_name_latin: string | null;
  last_name_greek: string | null;
  last_name_latin: string | null;
  is_printed: boolean;
  chip_2_go_qr_data: string;
  block: number | null;
  club: string | null;
  receives_as_a_group: boolean;
}

interface _0group {
  id: number;
  printed_text: string;
  name: string;
}
