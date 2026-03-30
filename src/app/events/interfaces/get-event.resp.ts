export interface IGetEventResponse {
  '0(event)': _event;
}

interface _event {
  name: string;
  printed_text: string;
  allow_reprinting: boolean;
  id: number;
  bib_frontside_background?: Bibtemplate[];
  bib_backside_background?: Bibtemplate[];
  bib_backside_printing: boolean;
  bib_backside_template: string | null;
  bib_frontside_printing: true;
  bib_frontside_template: string | null;
  bib_styling: string | null;
}

interface Bibtemplate {
  changed: number;
  hash: string;
  id: string;
  name: string;
  size: number;
  version: number;
}
