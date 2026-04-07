import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule, MatTooltipModule],
  templateUrl: './sidebar.component.html',
  styles: [`
    .sidebar {
      display: flex;
      flex-direction: column;
      width: 240px;
      height: 100%;
      position: relative;
      color: white;
      transition: width 0.3s ease;
      overflow: hidden;

      background: #6200EA;

      &--collapsed { width: 64px; }
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      height: 64px;
      padding: 0 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }

    .logo-icon {
    opacity: 0.5;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      flex-shrink: 0;

      mat-icon {
        font-size: 1.3rem;
        width: 1.3rem;
        height: 1.3rem;
        color: white;
      }
    }

    .logo-text {
      font-weight: 700;
      font-size: 0.95rem;
      white-space: nowrap;
      color: #111111;
      letter-spacing: 0.3px;
      z-index: 99;
    }

    mat-nav-list {
      padding: 8px 0;
      flex: 1;
    }

    .bottom-nav { flex: 0; }

    ::ng-deep .sidebar a.mat-mdc-list-item {
      color: rgba(255, 255, 255, 0.7);
      border-radius: 24px;
      margin: 2px 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: white;
      }

      &.active-link {
        background: var(--ws-primary, #6200EA);
        color: white;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(98, 0, 234, 0.4);
      }
    }

    ::ng-deep .sidebar .mat-icon { color: inherit; }
  `],
})
export class SidebarComponent {
  collapsed = input(false);

  readonly navItems: NavItem[] = [
    { label: 'Nuevo Post', icon: 'add_circle', route: '/new-post' },
    { label: 'Ideas de Temas', icon: 'lightbulb', route: '/topic-ideas' },
    { label: 'Base RAG', icon: 'menu_book', route: '/knowledge-base' },
  ];
}
