/**
 * Audit logging utility for admin actions.
 * Uses the service role client to write to audit_logs, bypassing RLS.
 */

import { supabaseAdmin } from './supabase-server';

export interface AuditLogParams {
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    const { error } = await supabaseAdmin.from('audit_logs').insert({
      user_id: params.userId,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      old_data: params.oldData ?? null,
      new_data: params.newData ?? null,
    });
    if (error) {
      console.error('Failed to write audit log:', error.message);
    }
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
