export interface IEvent {
  name: string;
  name_for_printing: string | null;
  allow_reprinting: boolean;
  id: number;
  front_bib_template_url: string;
  back_bib_template_url: string;
}
