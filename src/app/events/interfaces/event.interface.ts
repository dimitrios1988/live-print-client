export interface IEvent {
  name: string;
  name_for_printing: string | null;
  name_for_printing_en: string | null;
  allow_reprinting: boolean;
  id: number;
  bib_backside_printing: boolean;
  bib_frontside_printing: boolean;
  label_template: string | null;
  numberPrinter: any;
  ticketPrinter: any;
  enabled: boolean;
}
