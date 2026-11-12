export interface IGetEventResponse {
  '0(event)': _event;
  /* '2(bib_template)': _bib_template; */
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
interface _label_template {
  id: number;
  name: string;
  label_template: string | null;
}
