import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';

const FILE = path.join(process.cwd(), 'data', 'credentials.json');

export interface DomainCred { name: string; key: string; password: string }

interface UserRecord {
  email: string;
  passwordHash: string;
  lobbyKey: string;
  role: 'manager' | 'employer';
  allowedDomains: string[]; // ['all'] for manager
  domainKey?: string;       // employer's personal domain key
}

interface CredsFile {
  manager: UserRecord;
  employer: UserRecord;
  domains: DomainCred[];
}

export function readCreds(): CredsFile {
  return JSON.parse(fs.readFileSync(FILE, 'utf-8'));
}

function writeCreds(data: CredsFile) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export function findUser(email: string): UserRecord | null {
  const data = readCreds();
  if (data.manager.email === email) return data.manager;
  if (data.employer.email === email) return data.employer;
  return null;
}

export function getDomainCreds(): DomainCred[] {
  return readCreds().domains;
}

export function getDomainKey(domain: string): string | null {
  const cred = readCreds().domains.find((d) => d.name === domain);
  return cred?.key ?? null;
}

export function verifyDomainKey(domain: string, key: string): boolean {
  return getDomainKey(domain) === key;
}

export function updateDomainField(domain: string, field: 'key' | 'password', value: string) {
  const data = readCreds();
  const idx = data.domains.findIndex((d) => d.name === domain);
  if (idx === -1) throw new Error('Domain not found');
  data.domains[idx][field] = value;
  writeCreds(data);
  return data.domains[idx];
}

export function generateKey(prefix: string): string {
  const part = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${part}`;
}

export function getDomainPrefix(domain: string): string {
  const map: Record<string, string> = {
    'Общий': 'GEN', 'Финансы': 'FIN', 'Маркетинг': 'MKT',
    'Стратегия': 'STR', 'Операции': 'OPS', 'Юридический': 'LEG',
    'Управление': 'MGT', 'Производство': 'PRD', 'Оборудование': 'EQP',
  };
  return map[domain] ?? 'DOM';
}
