export interface IGetEventResponse {
  '0(event)': _event;
  '2(bib_template)': _bib_template;
  '3(label_template)': _label_template;
}

interface _event {
  name: string;
  printed_text: string | null;
  printed_text_en: string | null;
  allow_reprinting: boolean;
  id: number;
  bib_backside_printing: boolean;
  bib_frontside_printing: true;
}

interface _bib_template {
  id: number;
  name: string;
  bib_styling: string | null;
  bib_frontside_template: string | null;
  bib_frontside_background: _file[];
  bib_backside_template: string | null;
  bib_backside_background: _file[];
}

interface _label_template {
  id: number;
  name: string;
  label_template: string | null;
}

interface _file {
  changed: number;
  hash: string;
  id: string;
  name: string;
  size: number;
  version: number;
}
