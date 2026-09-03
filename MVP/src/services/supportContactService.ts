import { SUPPORT_CONTACTS, type SupportContactMethod } from '@/config/supportContacts'

export interface SupportContactService {
  listContacts(): Promise<SupportContactMethod[]>
}

export class PlaceholderSupportContactService implements SupportContactService {
  async listContacts(): Promise<SupportContactMethod[]> {
    return SUPPORT_CONTACTS.map((contact) => ({ ...contact }))
  }
}

export const placeholderSupportContactService =
  new PlaceholderSupportContactService()
