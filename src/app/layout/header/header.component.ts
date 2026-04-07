import { Component, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule],
  templateUrl: './header.component.html',
  styles: [`
    .app-header {
      background: var(--ws-surface);
      border-bottom: 1px solid var(--ws-border);
      box-shadow: 0 1px 3px var(--ws-shadow);
      z-index: 100;
      padding: 0 16px 0 8px;
      transition: background-color 0.3s, border-color 0.3s;
    }

    .spacer { flex: 1; }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .notif-btn {
      position: relative;
    }

    .notif-dot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--ws-primary);
      border: 2px solid var(--ws-surface);
    }

    .empty-notifications {
      padding: 16px 24px;
      color: var(--ws-text-muted);
      font-size: 0.85rem;
    }

    .user-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 24px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover { background: var(--ws-hover); }
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--ws-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .user-name {
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--ws-text);
    }

    .menu-user-info {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .menu-user-name { font-weight: 600; font-size: 0.9rem; color: var(--ws-text); }
    .menu-user-role { font-size: 0.72rem; color: var(--ws-text-muted); }
  `],
})
export class HeaderComponent {
  toggleSidebar = output();
  protected readonly authService = inject(AuthService);
  protected readonly notificationService = inject(NotificationService);

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(w => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
