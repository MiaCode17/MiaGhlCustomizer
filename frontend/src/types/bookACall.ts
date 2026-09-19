export interface BookACallConfig {
  enabled: boolean;
  buttonLabel: string;
  bookingUrl: string;
  backgroundColor: string;
  textColor: string;
}

export const emptyBookACallConfig: BookACallConfig = {
  enabled: false,
  buttonLabel: 'Book a Call',
  bookingUrl: '',
  backgroundColor: '#6366f1',
  textColor: '#ffffff',
};
