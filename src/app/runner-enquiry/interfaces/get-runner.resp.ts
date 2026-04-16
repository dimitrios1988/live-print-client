export interface IGetRunnerResponse {
  '0(runner)': _0runner;
  '1(event)': _1event;
  '2(gender)': _2gender;
  '3(group)': _3group;
  '4(print_log)': _4printlog;
  '5(t_shirt_size)': _5t_shirt_size;
  '6(registration_level)': _6registrationlevel;
  '7(nationality)': _7nationality;
  '8(age_group)': _8agegroup;
}

interface _8agegroup {
  name: string | null;
  printed_text: string | null;
}

interface _7nationality {
  name: string;
  printed_text: string | null;
}

interface _5t_shirt_size {
  name: string | null;
  printed_text: string | null;
}

interface _6registrationlevel {
  has_tshirt: boolean;
  name: string;
  printed_text: string;
}

interface _4printlog {
  printed_at: null;
}

interface _3group {
  id: number;
  name: string;
  printed_text: string;
}

interface _2gender {
  name: string;
  printed_text: string;
}

interface _1event {
  allow_reprinting: boolean;
  id: number;
  name: string;
  printed_text: string;
}

interface _0runner {
  bib: number;
  birthdate: number;
  block: number;
  chip_2_go_data: string | null;
  club: string | null;
  fathers_name: string | null;
  first_name_greek: string | null;
  first_name_latin: string;
  id: number;
  is_printed: boolean;
  last_name_greek: string | null;
  last_name_latin: string;
  receives_as_a_group: boolean;
}
