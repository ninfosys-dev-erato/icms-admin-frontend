import { NotificationService } from '@/services/notification-service';
import type { Album } from '../types/album';

export class AlbumNotificationService extends NotificationService {
  static created(album?: Album | string) {
    const name = typeof album === 'string' ? album : album?.name?.en || album?.name?.ne || 'Album';
    return this.showCreateSuccess(name);
  }

  static updated(album?: Album | string) {
    const name = typeof album === 'string' ? album : album?.name?.en || album?.name?.ne || 'Album';
    return this.showUpdateSuccess(name);
    }

  static deleted(album?: Album | string) {
    const name = typeof album === 'string' ? album : album?.name?.en || album?.name?.ne || 'Album';
    return this.showDeleteSuccess(name);
  }

  static showDeleteConfirmation(
    albumTitle: string,
    onConfirm: () => void,
    onCancel?: () => void
  ): string {
    const title = 'Confirm Deletion';
    const subtitle = `Are you sure you want to delete album "${albumTitle}"? This action cannot be undone.`;
    return this.showConfirmation(title, subtitle, onConfirm, onCancel, { kind: 'warning' });
  }
}
