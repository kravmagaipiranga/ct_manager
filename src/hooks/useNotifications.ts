import { useMemo } from 'react';
import { useDataStore } from '../store/useDataStore';
import { useAuthStore } from '../store/useAuthStore';
import { User, Announcement, AcademyEvent, Checkin } from '../types';

export interface NotificationItem {
  id: string;
  title: string;
  text: string;
  time: string;
  createdAt: string;
  read: boolean;
  type: 'ENROLLMENT' | 'CHECKIN' | 'ANNOUNCEMENT' | 'EVENT' | 'FINANCIAL';
}

export function useNotifications() {
  const user = useAuthStore(state => state.user);
  const students = useDataStore(state => state.students);
  const checkins = useDataStore(state => state.checkins);
  const announcements = useDataStore(state => state.announcements);
  const events = useDataStore(state => state.events);
  
  const lastViewedAt = user?.lastNotificationViewedAt || '1970-01-01T00:00:00Z';

  return useMemo(() => {
    if (!user) return [];

    const notifications: NotificationItem[] = [];

    if (user.role === 'ADMIN' || user.role === 'INSTRUCTOR') {
      // 1. Pending Enrollments
      students.filter(s => s.academyId === user.academyId && s.enrollmentStatus === 'PENDING').forEach(s => {
        notifications.push({
          id: `enroll-${s.id}`,
          title: 'Nova Matrícula Pendente',
          text: `${s.name} se cadastrou no portal.`,
          time: formatRelativeTime(s.createdAt),
          createdAt: s.createdAt,
          read: s.createdAt <= lastViewedAt,
          type: 'ENROLLMENT'
        });
      });

      // 2. Pending Checkins
      checkins.filter(c => c.academyId === user.academyId && c.status === 'PENDING').forEach(c => {
        const student = students.find(s => s.id === c.studentId);
        notifications.push({
          id: `checkin-${c.id}`,
          title: 'Novo Check-in',
          text: `${student?.name || 'Aluno'} aguardando aprovação.`,
          time: formatRelativeTime(c.timestamp),
          createdAt: c.timestamp,
          read: c.timestamp <= lastViewedAt,
          type: 'CHECKIN'
        });
      });
    }

    if (user.role === 'STUDENT') {
      // 1. Announcements
      announcements.filter(a => !a.academyId || a.academyId === user.academyId).forEach(a => {
        notifications.push({
          id: `announ-${a.id}`,
          title: 'Novo Comunicado',
          text: a.title,
          time: formatRelativeTime(a.createdAt),
          createdAt: a.createdAt,
          read: a.createdAt <= lastViewedAt,
          type: 'ANNOUNCEMENT'
        });
      });

      // 2. Events
      events.filter(e => !e.academyId || e.academyId === user.academyId).forEach(e => {
        notifications.push({
          id: `event-${e.id}`,
          title: 'Novo Evento',
          text: e.title,
          time: formatRelativeTime(e.date), // Using date as createdAt for events for simplicity
          createdAt: e.date,
          read: e.date <= lastViewedAt,
          type: 'EVENT'
        });
      });

      // 3. Checkin Status (Only approved/rejected)
      checkins.filter(c => c.studentId === user.id && c.status !== 'PENDING').forEach(c => {
        notifications.push({
          id: `checkinstatus-${c.id}`,
          title: `Check-in ${c.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}`,
          text: `Seu check-in de ${new Date(c.timestamp).toLocaleDateString()} foi processado.`,
          time: formatRelativeTime(c.timestamp),
          createdAt: c.timestamp,
          read: c.timestamp <= lastViewedAt,
          type: 'CHECKIN'
        });
      });
    }

    // Sort by most recent
    return notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20);
  }, [user, students, checkins, announcements, events, lastViewedAt]);
}

function formatRelativeTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  } catch {
    return '';
  }
}
