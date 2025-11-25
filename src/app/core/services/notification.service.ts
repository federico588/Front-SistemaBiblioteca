import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  private setNotifications(notifications: Notification[]): void {
    this.notificationsSubject.next(notifications);
  }

  showSuccess(message: string): void {
    this.addNotification(message, 'success', 3000);
  }

  showError(message: string): void {
    this.addNotification(message, 'error', 5000);
  }

  showInfo(message: string): void {
    this.addNotification(message, 'info', 3000);
  }

  showWarning(message: string): void {
    this.addNotification(message, 'warning', 4000);
  }

  private addNotification(message: string, type: 'success' | 'error' | 'info' | 'warning', duration: number): void {
    const notification: Notification = {
      id: this.generateId(),
      message,
      type,
      duration
    };

    const notifications = [...this.getNotifications(), notification];
    this.setNotifications(notifications);

    setTimeout(() => {
      this.removeNotification(notification.id);
    }, duration);
  }

  removeNotification(id: string): void {
    const notifications = this.getNotifications().filter(n => n.id !== id);
    this.setNotifications(notifications);
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getNotifications$(): Observable<Notification[]> {
    return this.notifications$;
  }
}




