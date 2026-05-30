/** Matches campuses seeded in database/seed.sql */
export interface CampusOption {
  id: string;
  name: string;
}

export const CAMPUSES: CampusOption[] = [
  { id: 'newnham', name: 'Newnham' },
  { id: 'seneca-york', name: 'Seneca@York' },
  { id: 'king', name: 'King' },
  { id: 'peterborough', name: 'Peterborough' },
];

export const DEFAULT_CAMPUS_ID = CAMPUSES[0].id;
