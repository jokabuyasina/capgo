import { bigint, boolean, integer, jsonb, pgEnum, pgTable, serial, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'

// do_not_change

export const disableUpdatePgEnum = pgEnum('disable_update', ['major', 'minor', 'patch', 'version_number', 'none'])
export const keyModePgEnum = pgEnum('key_mode', ['read', 'write', 'all', 'upload'])
export const userMinRightPgEnum = pgEnum('user_min_right', [
  'invite_read',
  'invite_upload',
  'invite_write',
  'invite_admin',
  'read',
  'upload',
  'write',
  'admin',
  'super_admin',
])

export const apps = pgTable('apps', {
  created_at: timestamp('created_at').notNull().defaultNow(),
  app_id: varchar('app_id').notNull(),
  icon_url: varchar('icon_url').notNull(),
  owner_org: uuid('owner_org').notNull(),
  name: varchar('name').unique(),
  last_version: varchar('last_version'),
  updated_at: timestamp('updated_at'),
  id: uuid('id').primaryKey().unique(),
  retention: bigint('retention', { mode: 'number' }).notNull().default(2592000),
  channel_device_count: bigint('channel_device_count', { mode: 'number' }).notNull().default(0),
  manifest_bundle_count: bigint('manifest_bundle_count', { mode: 'number' }).notNull().default(0),
  expose_metadata: boolean('expose_metadata').notNull().default(false),
})

export const app_versions = pgTable('app_versions', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  owner_org: uuid('owner_org').notNull(),
  owner_org: uuid('owner_org').notNull(),
})

export const orgs = pgTable('orgs', {
  id: uuid('id').notNull(),
  created_by: uuid('created_by').notNull(),
  logo: text('logo'),
  name: text('name').notNull(),
  management_email: text('management_email').notNull(),
  customer_id: text('customer_id'),
  require_apikey_expiration: boolean('require_apikey_expiration').notNull().default(false),
  max_apikey_expiration_days: integer('max_apikey_expiration_days'),
})

export const stripe_info = pgTable('stripe_info', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  customer_id: text('customer_id'),
  status: text('status'),
  trial_at: text('trial_at'),
  is_good_plan: boolean('is_good_plan'),
  mau_exceeded: boolean('mau_exceeded'),
  storage_exceeded: boolean('storage_exceeded'),
  bandwidth_exceeded: boolean('bandwidth_exceeded'),
})

export const apikeys = pgTable('apikeys', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  user_id: uuid('user_id').notNull(),
  key: varchar('key'),
  key_hash: varchar('key_hash'),
  mode: keyModePgEnum('mode').notNull(),
  updated_at: timestamp('updated_at').defaultNow(),
  name: varchar('name').notNull(),
  limited_to_orgs: uuid('limited_to_orgs').array(),
  limited_to_apps: varchar('limited_to_apps').array(),
  expires_at: timestamp('expires_at', { withTimezone: true }),
})

export const org_users = pgTable('org_users', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  user_id: uuid('user_id').notNull(),
  org_id: uuid('org_id').notNull(),
  app_id: varchar('app_id'),
  channel_id: bigint('channel_id', { mode: 'number' }),
  user_right: userMinRightPgEnum('user_right'),
})

// SSO SAML Authentication Tables (single clean definitions)
export const org_saml_connections = pgTable('org_saml_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  org_id: uuid('org_id').notNull().references(() => orgs.id),
  sso_provider_id: uuid('sso_provider_id').notNull().unique(),
  provider_name: text('provider_name').notNull(),
  metadata_url: text('metadata_url'),
  metadata_xml: text('metadata_xml'),
  entity_id: text('entity_id').notNull(),
  current_certificate: text('current_certificate'),
  certificate_expires_at: timestamp('certificate_expires_at', { withTimezone: true }),
  certificate_last_checked: timestamp('certificate_last_checked', { withTimezone: true }).defaultNow(),
  enabled: boolean('enabled').notNull().default(false),
  verified: boolean('verified').notNull().default(false),
  auto_join_enabled: boolean('auto_join_enabled').notNull().default(false),
  attribute_mapping: jsonb('attribute_mapping').default('{}'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  created_by: uuid('created_by'),
})

export const saml_domain_mappings = pgTable('saml_domain_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  domain: text('domain').notNull(),
  org_id: uuid('org_id').notNull().references(() => orgs.id),
  sso_connection_id: uuid('sso_connection_id').notNull().references(() => org_saml_connections.id),
  priority: integer('priority').notNull().default(0),
  verified: boolean('verified').notNull().default(true),
  verification_code: text('verification_code'),
  verified_at: timestamp('verified_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const sso_audit_logs = pgTable('sso_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull().defaultNow(),
  user_id: uuid('user_id'),
  email: text('email'),
  event_type: text('event_type').notNull(),
  org_id: uuid('org_id'),
  sso_provider_id: uuid('sso_provider_id'),
  sso_connection_id: uuid('sso_connection_id').references(() => org_saml_connections.id),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  country: text('country'),
  saml_assertion_id: text('saml_assertion_id'),
  saml_session_index: text('saml_session_index'),
  error_code: text('error_code'),
  error_message: text('error_message'),
  metadata: text('metadata'),
})
