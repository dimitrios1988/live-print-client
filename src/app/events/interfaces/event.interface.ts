export interface IEvent {
  name: string;
  name_for_printing: string | null;
  allow_reprinting: boolean;
  id: number;
  bib_frontside_background_url: string;
  bib_backside_background_url: string;
  bib_backside_printing: boolean;
  bib_backside_template: string | null;
  bib_frontside_printing: true;
  bib_frontside_template: string | null;
  bib_styling: string | null;
  has_timing: boolean;
  numberPrinter: any;
  ticketPrinter: any;
  enabled: boolean;
}
