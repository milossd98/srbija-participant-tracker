export type Client = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  last_contact_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientDriveLink = {
  id: string;
  client_id: string;
  label: string;
  url: string;
  link_date: string;
  created_at: string;
};

export type ClientWithLinks = Client & {
  client_drive_links: ClientDriveLink[];
};
