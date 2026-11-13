import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCAL_STAFF_USERS_KEY = 'kia_staff_users_v2';

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
    email: 'ceo@kia-startup.com',
    fullName: 'Isaac Agya Koomson',
    role: 'ceo',
    roleLabel: 'Founder / CEO',
    phone: '+233 24 411 2233',
    isActive: true,
    isFounder: true
  },
  {
    id: 'staff-02',
    email: 'teamlead@kia-startup.com',
    fullName: 'Abena Osei',
    role: 'team_leader',
    roleLabel: 'Grant Application Team Leader',
    phone: '+233 20 812 3456',
    isActive: true
  },
  {
    id: 'staff-03',
    email: 'kofi.officer@kia-startup.com',
    fullName: 'Kofi Mensah',
    role: 'application_officer',
    roleLabel: 'Senior Application Officer',
    phone: '+233 55 923 4567',
    isActive: true
  },
  {
    id: 'staff-04',
    email: 'efua.officer@kia-startup.com',
    fullName: 'Efua Addo',
    role: 'application_officer',
    roleLabel: 'Application Officer',
    phone: '+233 27 654 3210',
    isActive: true
  },
  {
    id: 'staff-05',
    email: 'finance@kia-startup.com',
    fullName: 'Emmanuel Darko',
    role: 'finance_officer',
    roleLabel: 'Finance & Admin Officer',
    phone: '+233 24 789 0123',
    isActive: true
  }
];

function loadInitialStaffUsers() {
  try {
    const saved = localStorage.getItem(LOCAL_STAFF_USERS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure Founder & CEO record is always Isaac Agya Koomson
        return parsed.map(u =>
          u.id === 'staff-01'
            ? { ...u, fullName: 'Isaac Agya Koomson', role: 'ceo', roleLabel: 'Founder / CEO', isActive: true, isFounder: true }
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

let currentStaffUser = STAFF_USERS[0]; // Default to Founder / CEO Isaac Agya Koomson

export const authService = {
  getCurrentUser() {
    return currentStaffUser;
  },

  setCurrentUser(userOrId) {
    if (typeof userOrId === 'string') {
      const found = STAFF_USERS.find(u => u.id === userOrId);
      if (found) currentStaffUser = found;
    } else if (userOrId && userOrId.id) {
      currentStaffUser = userOrId;
    }
    return currentStaffUser;
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

  async addTeamMember({ fullName, email, phone = '', role, roleLabel }) {
    if (currentStaffUser.role !== 'ceo') {
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
    const newMember = {
      id: `staff-${String(STAFF_USERS.length + 1).padStart(2, '0')}-${Date.now().toString().slice(-3)}`,
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

    try {
      const { auditService } = await import('./auditService');
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

    return newMember;
  },

  async updateTeamMemberRole(memberId, newRole, newRoleLabel) {
    if (currentStaffUser.role !== 'ceo') {
      throw new Error('ACCESS DENIED: Only the Founder & CEO (Isaac Agya Koomson) can change team member roles.');
    }

    const member = STAFF_USERS.find(u => u.id === memberId);
    if (!member) throw new Error('Team member not found.');
    if (member.isFounder || member.id === 'staff-01') {
      throw new Error('The Founder & CEO role cannot be modified.');
    }

    const prevRole = member.roleLabel;
    const roleMeta = STAFF_ROLE_OPTIONS.find(r => r.role === newRole);
    member.role = newRole;
    member.roleLabel = (newRoleLabel || '').trim() || roleMeta?.label || newRole;
    persistStaffUsers();

    try {
      const { auditService } = await import('./auditService');
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
    if (currentStaffUser.role !== 'ceo') {
      throw new Error('ACCESS DENIED: Only the Founder & CEO (Isaac Agya Koomson) can activate or deactivate users.');
    }

    const member = STAFF_USERS.find(u => u.id === memberId);
    if (!member) throw new Error('Team member not found.');
    if (member.isFounder || member.id === 'staff-01') {
      throw new Error('The Founder & CEO account cannot be deactivated.');
    }

    member.isActive = member.isActive === false ? true : false;
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
