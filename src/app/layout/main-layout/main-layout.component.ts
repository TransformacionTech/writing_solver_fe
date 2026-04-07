import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { NotificationToastComponent } from '../../shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, NotificationToastComponent],
  templateUrl: './main-layout.component.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--ws-bg);
      transition: background-color 0.3s;
    }
    .app-shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }
    .content-area {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
      background: var(--ws-bg);
      transition: background-color 0.3s;
    }
    .main-content {
      flex: 1;
      overflow: auto;
      background: inherit;
    }
  `],
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }
}
