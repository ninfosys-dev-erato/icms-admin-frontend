import { NotificationService } from '@/services/notification-service';
import type { Media } from '../types/media';

export class MediaNotificationService extends NotificationService {
  static created(media?: Media | string) {
    const name = typeof media === 'string' ? media : media?.originalName || media?.fileName;
    return this.showCreateSuccess(name);
  }

  static updated(media?: Media | string) {
    const name = typeof media === 'string' ? media : media?.originalName || media?.fileName;
    return this.showUpdateSuccess(name);
  }

  static deleted(media?: Media | string) {
    const name = typeof media === 'string' ? media : media?.originalName || media?.fileName;
    return this.showDeleteSuccess(name);
  }

  static bulk(operation: string, count: number) {
    return this.showSuccess(`${operation} complete`, `${count} item(s) processed.`);
  }

  static uploadStarted(count = 1) {
    return this.showInfo(count > 1 ? 'Uploading files…' : 'Uploading file…');
  }

  static uploadFailed(error: string) {
    return this.showCreateError(error, 'media');
  }
}


