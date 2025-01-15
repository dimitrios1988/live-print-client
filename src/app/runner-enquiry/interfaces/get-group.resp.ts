export interface IGetGroupResponse {
  '0(group)': _0group;
  '1(runner)': _1runner;
  '2(event)': _2event;
  '3(runner_gender)': _3runnergender;
  '5(print_log)': _5printlog;
}

interface _5printlog {
  printed_at: number;
}

interface _3runnergender {
  name: string;
  printed_text: string;
}

interface _2event {
  source_name: string;
  allow_reprinting: boolean;
  name_for_printing: string;
  id: number;
}

interface _1runner {
  id: number;
  bib: number;
  birthdate: number;
  club: string;
  fathers_name: string;
  first_name_greek: string;
  first_name_latin: string;
  last_name_greek: string;
  last_name_latin: string;
  is_printed: boolean;
  chip_2_go_qr: string;
  chip_2_go_qr_data: string;
  nationality: string;
  block: number;
  registration_level: string;
  tshirt_size: string;
}

interface _0group {
  name: string;
  id: number;
}
