export interface ILicense {
  data: Data2;
  meta: Meta3;
}

interface Meta3 {
  issued: string;
  expiry: string;
  ttl: number;
}

interface Data2 {
  id: string;
  type: string;
  attributes: Attributes;
  relationships: Relationships;
  links: Links3;
}

interface Links3 {
  self: string;
}

interface Relationships {
  account: Account;
  environment: Environment;
  product: Account;
  policy: Account;
  group: Group;
  owner: Account;
  users: Users;
  machines: Machines;
  tokens: Tokens;
  entitlements: Tokens;
}

interface Tokens {
  links: Links;
}

interface Machines {
  links: Links;
  meta: Meta2;
}

interface Meta2 {
  cores: number;
  count: number;
}

interface Users {
  links: Links;
  meta: Meta;
}

interface Meta {
  count: number;
}

interface Group {
  links: Links;
  data: null;
}

interface Environment {
  links: Links2;
  data: null;
}

interface Links2 {
  related: null;
}

interface Account {
  links: Links;
  data: Data;
}

interface Data {
  type: string;
  id: string;
}

interface Links {
  related: string;
}

interface Attributes {
  name: string;
  key: string;
  expiry: string;
  status: string;
  uses: number;
  suspended: boolean;
  scheme: null;
  encrypted: boolean;
  strict: boolean;
  floating: boolean;
  protected: boolean;
  version: null;
  maxMachines: null;
  maxProcesses: null;
  maxUsers: null;
  maxCores: null;
  maxUses: null;
  requireHeartbeat: boolean;
  requireCheckIn: boolean;
  lastValidated: null;
  lastCheckIn: null;
  nextCheckIn: null;
  lastCheckOut: null;
  permissions: string[];
  metadata: Metadata;
  created: string;
  updated: string;
}

interface Metadata {}
