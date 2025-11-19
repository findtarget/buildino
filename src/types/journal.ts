// src/types/journal.ts
export interface JournalEntry {
  id: string;
  journalNumber: string;
  date: string;
  reference: string;
  description: string;
  entries: JournalEntryLine[];
  totalDebit: number;
  totalCredit: number;
  status: JournalStatus;
  createdBy: string;
  approvedBy?: string;
  attachments?: string[];
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountTitle: string;
  debit: number;
  credit: number;
  description?: string;
}

export enum JournalStatus {
  Draft = 'Draft',
  Posted = 'Posted',
  Reversed = 'Reversed'
}
