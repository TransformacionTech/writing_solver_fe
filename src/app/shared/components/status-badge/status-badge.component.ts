import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
  styles: [`
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;

      &--idle     { background: var(--ws-border-strong); color: var(--ws-text-muted); }
      &--running  { background: rgba(76, 175, 80, 0.15); color: var(--ws-success); }
      &--paused   { background: rgba(230, 81, 0, 0.15); color: #e65100; }
      &--error    { background: rgba(198, 40, 40, 0.15); color: var(--ws-error); }
      &--completed { background: rgba(21, 101, 192, 0.15); color: #42a5f5; }
      &--failed   { background: rgba(198, 40, 40, 0.15); color: var(--ws-error); }
      &--active   { background: rgba(76, 175, 80, 0.15); color: var(--ws-success); }
      &--draft    { background: var(--ws-primary-bg); color: var(--ws-primary-light); }
    }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();
}
