export interface Notice {
  id: string;
  title: string;
  date: string;
  category: 'urgent' | 'maintenance' | 'meeting' | 'general';
  issuedBy: string;
  content: string;
  attachmentUrl?: string;
  pinned?: boolean;
}

export const initialNotices: Notice[] = [
  {
    id: 'not_1',
    title: 'Annual General Body Meeting (AGM) Notice - FY 2026-27',
    date: '2026-08-15',
    category: 'meeting',
    issuedBy: 'Rajesh Sharma (Hon. Secretary & Treasurer)',
    content: 'All residents and flat owners are cordially invited to attend the Annual General Body Meeting scheduled for Sunday, August 30, 2026, at 10:30 AM in the Society Clubhouse. Agenda includes presentation of annual audited accounts and approval of sinking fund allocation.',
    pinned: true
  },
  {
    id: 'not_2',
    title: 'Overhead & Underground Water Tank Cleaning Schedule',
    date: '2026-08-12',
    category: 'maintenance',
    issuedBy: 'Managing Committee',
    content: 'Please be informed that annual sanitization and chlorination of overhead tanks for Wing A & Wing B will take place on Thursday from 9:00 AM to 4:00 PM. Water supply will be restricted during this interval. Kindly store required water in advance.',
    pinned: false
  },
  {
    id: 'not_3',
    title: 'Maintenance Dues Reconciliation & Digital Receipts',
    date: '2026-08-05',
    category: 'urgent',
    issuedBy: 'Treasury Department',
    content: 'August maintenance bills have been generated. Members who paid via direct NEFT/UPI are requested to verify their payment approval status in the Resident Portal. Official digital PDF receipts are now available for instant download.',
    pinned: false
  },
  {
    id: 'not_4',
    title: 'Independence Day & Cultural Festival Celebrations',
    date: '2026-08-01',
    category: 'general',
    issuedBy: 'Cultural Committee',
    content: 'Flag hoisting ceremony at 8:30 AM in the society central courtyard followed by breakfast and cultural performances by society children. All families are warmly welcome to join.',
    pinned: false
  }
];
