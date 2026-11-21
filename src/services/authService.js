import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { auditService } from './auditService';

const LOCAL_STAFF_USERS_KEY = 'kia_staff_users_v3';
const LOCAL_CREDENTIALS_KEY = 'kia_staff_credentials_v3';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 30000;

export const STAFF_ROLE_OPTIONS = [
  {
    role: 'team_leader',
    label: 'Grant Application Team Leader',
    description: 'Supervises officers, resolves Level 1 escalations, and signs off on Internal QA gates.'
  },
  {
    role: 'application_officer',
    label: 'Senior Application Officer',
    description: 'Manages client dossiers, document verification, readiness diagnostics, and proposals.'
  },
  {
    role: 'application_officer',
    label: 'Grant Application Officer',
    description: 'Handles client onboarding, document collection, and grant application drafting.'
  },
  {
    role: 'finance_officer',
    label: 'Finance & Admin Officer',
    description: 'Issues invoices and holds exclusive authority (with CEO) to verify fee payments.'
  }
];

const DEFAULT_STAFF_USERS = [
  {
    id: 'staff-01',
    email: 'info@kiastartupconsult.com',
    fullName: 'Isaac Agya Koomson',
    role: 'ceo',
    roleLabel: 'Founder / CEO',
    phone: '+233 24 411 2233',
    isActive: true,
    isFounder: true
  }
];

function generateRandomHex(bytes = 16) {
  const arr = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function loadCredentialsMap() {
  try {
    const saved = localStorage.getItem(LOCAL_CREDENTIALS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.error('Failed to load credentials:', e);
  }
  return {};
}

function saveCredentialsMap(map) {
  try {
    localStorage.setItem(LOCAL_CREDENTIALS_KEY, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save credentials:', e);
  }
}

async function ensureSeedCredentials() {
  const existing = loadCredentialsMap();
  if (Object.keys(existing).length > 0) return existing;

  const seeded = {};
  for (const user of DEFAULT_STAFF_USERS) {
    const salt = generateRandomHex(16);
    const defaultPw = user.role === 'ceo' ? 'Kiastartup2026' : 'KIA-Staff#2026';
    seeded[user.id] = {
      salt,
      hash: await hashPassword(defaultPw, salt),
      updatedAt: new Date().toISOString()
    };
  }
  saveCredentialsMap(seeded);
  return seeded;
}

function loadInitialStaffUsers() {
  try {
    const saved = localStorage.getItem(LOCAL_STAFF_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(u =>
          u.id === 'staff-01'
            ? {
                ...u,
                email: 'info@kiastartupconsult.com',
                fullName: 'Isaac Agya Koomson',
                role: 'ceo',
                roleLabel: 'Founder / CEO',
                isActive: true,
                isFounder: true
              }
            : u
        );
      }
    }
  } catch (e) {
    console.error('Failed to load staff users:', e);
  }
  return [...DEFAULT_STAFF_USERS];
}

// Keep STAFF_USERS live and mutated in-place so all existing imports reflect updates immediately
export const STAFF_USERS = loadInitialStaffUsers();

function persistStaffUsers() {
  try {
    localStorage.setItem(LOCAL_STAFF_USERS_KEY, JSON.stringify(STAFF_USERS));
  } catch (e) {
    console.error('Failed to save staff users:', e);
  }
}

// Never auto-authenticate as CEO or any staff user on startup
let currentStaffUser = null;
const failedLoginTracker = new Map();

function getRoleLabel(role) {
  if (role === 'ceo') return 'Founder / CEO';
  if (role === 'admin') return 'System Administrator';
  return STAFF_ROLE_OPTIONS.find(r => r.role === role)?.label || role;
}

export const authService = {
  getCurrentUser() {
    return currentStaffUser;
  },

  async syncStaffFromSupabase() {
    if (!isSupabaseConfigured || !supabase) return [...STAFF_USERS];
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [...STAFF_USERS];

      const { data, error } = await supabase
        .from('staff_users')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !Array.isArray(data) || data.length === 0) {
        return [...STAFF_USERS];
      }

      const mapped = data.map(row => ({
        id: row.id,
        authUserId: row.auth_user_id || null,
        email: row.email,
        fullName: row.full_name,
        role: row.role,
        roleLabel: getRoleLabel(row.role),
        phone: row.phone_number || 'Not provided',
        isActive: row.is_active !== false,
        isFounder: row.email.toLowerCase() === 'info@kiastartupconsult.com' || row.role === 'ceo',
        createdAt: row.created_at
      }));

      STAFF_USERS.splice(0, STAFF_USERS.length, ...mapped);
      persistStaffUsers();

      if (currentStaffUser) {
        const refreshedSelf = STAFF_USERS.find(
          u => u.email.toLowerCase() === currentStaffUser.email.toLowerCase()
        );
        if (refreshedSelf) currentStaffUser = refreshedSelf;
      }

      return [...STAFF_USERS];
    } catch (e) {
      console.warn('Supabase staff sync skipped:', e);
      return [...STAFF_USERS];
    }
  },

  setCurrentUser(userOrId) {
    if (typeof userOrId === 'string') {
      const found = STAFF_USERS.find(u => u.id === userOrId && u.isActive !== false);
      if (found) currentStaffUser = found;
    } else if (userOrId && userOrId.id && userOrId.isActive !== false) {
      currentStaffUser = userOrId;
    }
    return currentStaffUser;
  },

  async authenticateStaff(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const rawPassword = password || '';

    if (!cleanEmail || !rawPassword) {
      throw new Error('Please enter both your staff email and password.');
    }

    const tracker = failedLoginTracker.get(cleanEmail) || { count: 0, lockedUntil: 0 };
    if (tracker.lockedUntil > Date.now()) {
      const secsLeft = Math.ceil((tracker.lockedUntil - Date.now()) / 1000);
      throw new Error(`Too many failed sign-in attempts. Please wait ${secsLeft} seconds before trying again.`);
    }

    // Use live Supabase Auth if configured
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: rawPassword
      });
      if (error || !data?.user) {
        const nextCount = tracker.count + 1;
        failedLoginTracker.set(cleanEmail, {
          count: nextCount,
          lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
        });
        throw new Error('Invalid email or password.');
      }
      await this.syncStaffFromSupabase();
    }

    const matchedUser = STAFF_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      const nextCount = tracker.count + 1;
      failedLoginTracker.set(cleanEmail, {
        count: nextCount,
        lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
      });
      throw new Error('Invalid email or password.');
    }

    if (matchedUser.isActive === false) {
      throw new Error('This account is inactive. Please contact the Founder & CEO.');
    }

    if (!isSupabaseConfigured) {
      const credsMap = await ensureSeedCredentials();
      const record = credsMap[matchedUser.id];
      if (!record) {
        throw new Error('No credentials configured for this account. Contact the Founder & CEO.');
      }
      const attemptHash = await hashPassword(rawPassword, record.salt);
      if (attemptHash !== record.hash) {
        const nextCount = tracker.count + 1;
        failedLoginTracker.set(cleanEmail, {
          count: nextCount,
          lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_MS : 0
        });
        throw new Error('Invalid email or password.');
      }
    }

    failedLoginTracker.delete(cleanEmail);
    currentStaffUser = matchedUser;

    try {
      await auditService.logEvent({
        entityType: 'staff_session',
        entityId: matchedUser.id,
        action: 'staff_sign_in',
        notes: `${matchedUser.fullName} (${matchedUser.roleLabel}) signed in.`
      });
    } catch (e) {
      console.warn('Audit log skipped:', e);
    }

    return matchedUser;
  },

  async changeOwnPassword(currentPassword, newPassword) {
    if (!currentStaffUser) {
      throw new Error('You must be signed in to change your password.');
    }
    if (!newPassword || newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long.');
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return true;
    }

    const credsMap = await ensureSeedCredentials();
    const record = credsMap[currentStaffUser.id];
    if (record) {
      const currentHash = await hashPassword(currentPassword || '', record.salt);
      if (currentHash !== record.hash) {
        throw new Error('Current password is incorrect.');
      }
    }

    const newSalt = generateRandomHex(16);
    credsMap[currentStaffUser.id] = {
      salt: newSalt,
      hash: await hashPassword(newPassword, newSalt),
      updatedAt: new Date().toISOString()
    };
    saveCredentialsMap(credsMap);
    return true;
  },

  async signOut() {
    const actor = currentStaffUser;
    currentStaffUser = null;
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    if (actor) {
      try {
        await auditService.logEvent({
          entityType: 'staff_session',
          entityId: actor.id,
          action: 'staff_sign_out',
          notes: `${actor.fullName} signed out.`
        });
      } catch (e) {
        console.warn('Audit log skipped:', e);
      }
    }
  },

  getAllStaffUsers() {
    return [...STAFF_USERS];
  },

  getActiveStaffUsers() {
    return STAFF_USERS.filter(u => u.isActive !== false);
  },

  getStaffUserById(id) {
    return STAFF_USERS.find(u => u.id === id) || null;
  },

  async addTeamMember({ fullName, email, phone = '', role, roleLabel, initialPassword }) {
    if (!currentStaffUser || currentStaffUser.role !== 'ceo') {
      throw new Error('ACCESS DENIED: Only the Founder & CEO (Isaac Agya Koomson) can add team members.');
    }

    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanName || !cleanEmail || !role) {
      throw new Error('Full name, email address, and role selection are required.');
    }

    const duplicate = STAFF_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error(`A team member with email "${cleanEmail}" already exists (${duplicate.fullName}).`);
    }

    const roleMeta = STAFF_ROLE_OPTIONS.find(r => r.role === role);
    let memberId = `staff-${String(STAFF_USERS.length + 1).padStart(2, '0')}-${Date.now().toString().slice(-3)}`;

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: inserted, error: insertErr } = await supabase
          .from('staff_users')
          .insert({
            email: cleanEmail,
            full_name: cleanName,
            phone_number: (phone || '').trim() || null,
            role,
            is_active: true
          })
          .select()
          .single();
        if (insertErr) {
          throw new Error(`Could not save staff member to Supabase: ${insertErr.message}`);
        }
        if (inserted?.id) {
          memberId = inserted.id;
        }
      }
    }

    const newMember = {
      id: memberId,
      email: cleanEmail,
      fullName: cleanName,
      role,
      roleLabel: (roleLabel || '').trim() || roleMeta?.label || role,
      phone: (phone || '').trim() || 'Not provided',
      isActive: true,
      addedBy: currentStaffUser.id,
      createdAt: new Date().toISOString()
    };

    STAFF_USERS.push(newMember);
    persistStaffUsers();

    // Provision per-user salted password hash
    const tempPassword = (initialPassword || '').trim() || `KIA-${generateRandomHex(4)}`;
    const credsMap = await ensureSeedCredentials();
    const salt = generateRandomHex(16);
    credsMap[newMember.id] = {
      salt,
      hash: await hashPassword(tempPassword, salt),
      updatedAt: new Date().toISOString()
    };
    saveCredentialsMap(credsMap);

    try {
      await auditService.logEvent({
        entityType: 'staff_user',
        entityId: newMember.id,
        action: 'add_team_member',
        newState: { fullName: newMember.fullName, email: newMember.email, role: newMember.role, roleLabel: newMember.roleLabel },
        notes: `Founder/CEO ${currentStaffUser.fullName} added ${newMember.fullName} as ${newMember.roleLabel}.`
      });
    } catch (e) {
      console.warn('Audit log skipped:', e);
    }

    return { ...newMember, tempPassword };
  },

  async updateTeamMemberRole(memberId, newRole, newRoleLabel) {
    if (!currentStaffUser || currentStaffUser.role !== 'ceo') {
      throw new Error('ACCESS DENIED: Only the Founder & CEO (Isaac Agya Koomson) can change team member roles.');
    }

    const member = STAFF_USERS.find(u => u.id === memberId);
    if (!member) throw new Error('Team member not found.');
    if (member.isFounder || member.id === 'staff-01' || member.email.toLowerCase() === 'info@kiastartupconsult.com') {
      throw new Error('The Founder & CEO role cannot be modified.');
    }

    const prevRole = member.roleLabel;
    const roleMeta = STAFF_ROLE_OPTIONS.find(r => r.role === newRole);
    member.role = newRole;
    member.roleLabel = (newRoleLabel || '').trim() || roleMeta?.label || newRole;

    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error: updErr } = await supabase
          .from('staff_users')
          .update({ role: newRole })
          .eq('email', member.email);
        if (updErr) throw new Error(`Could not update role in Supabase: ${updErr.message}`);
      }
    }

    persistStaffUsers();

    try {
      await auditService.logEvent({
        entityType: 'staff_user',
        entityId: member.id,
        action: 'update_team_member_role',
        previousState: { roleLabel: prevRole },
        newState: { role: member.role, roleLabel: member.roleLabel },
        notes: `Founder/CEO ${currentStaffUser.fullName} updated ${member.fullName}'s role from ${prevRole} to ${member.roleLabel}.`
      });
    } catch (e) {
      console.warn('Audit log skipped:', e);
    }

    return member;
  },

  async toggleTeamMemberStatus(memberId) {
    if (!currentStaffUser || currentStaffUser.role !== 'ceo') {
      throw new Error('ACCESS DENIED: Only the Founder & CEO (Isaac Agya Koomson) can activate or deactivate users.');
    }

    const member = STAFF_USERS.find(u => u.id === memberId);
    if (!member) throw new Error('Team member not found.');
    if (member.isFounder || member.id === 'staff-01' || member.email.toLowerCase() === 'info@kiastartupconsult.com') {
      throw new Error('The Founder & CEO account cannot be deactivated.');
    }

    const nextActive = member.isActive === false ? true : false;
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error: updErr } = await supabase
          .from('staff_users')
          .update({ is_active: nextActive })
          .eq('email', member.email);
        if (updErr) throw new Error(`Could not update staff status in Supabase: ${updErr.message}`);
      }
    }

    member.isActive = nextActive;
    persistStaffUsers();
    return member;
  },

  async fetchLiveSession() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
    return null;
  }
};
