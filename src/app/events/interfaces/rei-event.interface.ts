export interface IReiEvent {
  '0(event)': _event;
}

interface _event {
  name: string;
  name_for_printing: string;
  allow_reprinting: boolean;
  id: number;
}
