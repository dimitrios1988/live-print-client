export interface IGetRunnerResponse {
  '0(runner)': _0runner;
  '1(event)': _1event;
  '2(runner_gender)': _2runnergender;
  '4(tshirt_size)': _4tshirtsize;
  '5(group)': _5group;
  '6(print_log)': _6printlog;
}

interface _6printlog {
  printed_at: number;
}

interface _5group {
  name: string;
}

interface _4tshirtsize {
  size: string | null;
}

interface _2runnergender {
  name: string;
  printed_text: string;
}

interface _1event {
  allow_reprinting: boolean;
  name_for_printing: string;
  source_name: string;
}

interface _0runner {
  bib: number;
  birthdate: number;
  chip_2_go_qr: string;
  chip_2_go_qr_data: string;
  club: string | null;
  fathers_name: string | null;
  first_name_greek: string | null;
  first_name_latin: string;
  id: number;
  is_printed: boolean;
  last_name_greek: string | null;
  last_name_latin: string;
  block: number | null;
  nationality: string | null;
}
