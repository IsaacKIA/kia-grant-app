import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { authService } from './authService';

const LOCAL_STORAGE_AUDIT_KEY = 'kia_audit_log_v2';

function getLocalAuditEvents() {
  const saved = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

function saveLocalAuditEvent(event) {
  const events = getLocalAuditEvents();
  const updated = [event, ...events].slice(0, 500); // retain last 500
  localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(updated));
  return event;
}

export const auditService = {
  async logEvent({ entityType, entityId, action, previousState = null, newState = null, notes = '' }) {
    const actor = authService.getCurrentUser();
    const event = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      actorId: actor?.id || 'system',
      actorName: actor?.fullName || 'System Automation',
      actorRole: actor?.role || 'system',
      actorType: actor ? 'staff' : 'system_automation',
      entityType,
      entityId,
      action,
      previousState,
      newState,
      notes,
      timestamp: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_events').insert({
          actor_id: actor?.id,
          actor_name: actor?.fullName,
          actor_role: actor?.role,
          actor_type: event.actorType,
          entity_type: entityType,
          entity_id: entityId,
          action,
          previous_state: previousState,
          new_state: newState
        });
      } catch (err) {
        console.warn('Supabase audit log insert fallback to local storage:', err);
      }
    }

    return saveLocalAuditEvent(event);
  },

  async getRecentAuditEvents(limit = 50, entityFilter = null) {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('audit_events').select('*').order('created_at', { ascending: false }).limit(limit);
        if (entityFilter) {
          query = query.eq('entity_type', entityFilter);
        }
        const { data, error } = await query;
        if (!error && data) return data;
      } catch (err) {
        console.warn('Failed to fetch audit events from Supabase:', err);
      }
    }

    let local = getLocalAuditEvents();
    if (entityFilter) {
      local = local.filter(e => e.entityType === entityFilter);
    }
    return local.slice(0, limit);
  }
};

