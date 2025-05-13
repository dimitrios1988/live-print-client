export interface IGetEventResponse {
  '0(event)': _event;
}

interface _event {
  name: string;
  printed_text: string;
  allow_reprinting: boolean;
  id: number;
  front_bib_template?: Bibtemplate[];
  back_bib_template?: Bibtemplate[];
}

interface Bibtemplate {
  changed: number;
  hash: string;
  id: string;
  name: string;
  size: number;
  version: number;
}
