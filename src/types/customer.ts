export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  externalSource: string;
  externalCustomerRef: string;
  bookingsCount: number;
}
