export type User = {
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
};

export type Address = {
  line1: string | null;
  line2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode?: string | null;
};
