import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const STAFF_USERS = [
  {
    id: 'staff-01',
    email: 'ceo@kia-startup.com',
    fullName: 'Kwame Boateng',
    role: 'ceo',
    roleLabel: 'Founder / CEO',
    phone: '+233 24 411 2233'
  },
  {
    id: 'staff-02',
    email: 'teamlead@kia-startup.com',
    fullName: 'Abena Osei',
    role: 'team_leader',
    roleLabel: 'Grant Application Team Leader',
    phone: '+233 20 812 3456'
  },
  {
    id: 'staff-03',
    email: 'kofi.officer@kia-startup.com',
    fullName: 'Kofi Mensah',
    role: 'application_officer',
    roleLabel: 'Senior Application Officer',
    phone: '+233 55 923 4567'
  },
  {
    id: 'staff-04',
    email: 'efua.officer@kia-startup.com',
    fullName: 'Efua Addo',
    role: 'application_officer',
    roleLabel: 'Application Officer',
    phone: '+233 27 654 3210'
  },
  {
    id: 'staff-05',
    email: 'finance@kia-startup.com',
    fullName: 'Emmanuel Darko',
    role: 'finance_officer',
    roleLabel: 'Finance & Admin Officer',
    phone: '+233 24 789 0123'
  }
];

let currentStaffUser = STAFF_USERS[0]; // Default to CEO for development overview

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
    return STAFF_USERS;
  },

  getStaffUserById(id) {
    return STAFF_USERS.find(u => u.id === id) || null;
  },

  async fetchLiveSession() {
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    }
    return null;
  }
};
