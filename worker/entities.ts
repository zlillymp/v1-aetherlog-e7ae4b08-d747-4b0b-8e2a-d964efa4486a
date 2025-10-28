import { IndexedEntity } from "./core-utils";
import type { Contact, CallRecord, User } from "@shared/types";
// CONTACT ENTITY: one DO instance per contact, identified by phone number
export class ContactEntity extends IndexedEntity<Contact> {
  static readonly entityName = "contact";
  static readonly indexName = "contacts";
  static readonly initialState: Contact = { id: "", name: "", phone: "", initials: "", userId: "" };
}
// CALL RECORD ENTITY: one DO instance per call record
export class CallRecordEntity extends IndexedEntity<CallRecord> {
  static readonly entityName = "callRecord";
  static readonly indexName = "callRecords";
  static readonly initialState: CallRecord = { id: "", contactId: "", direction: "outbound", timestamp: "", userId: "" };
}
// USER ENTITY: one DO instance per user, identified by email
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", email: "", name: "" };
  // The custom keyOf is removed to fix the TypeScript error.
  // The base IndexedEntity.keyOf will use state.id, which is correct as we set user.id to the email.
}