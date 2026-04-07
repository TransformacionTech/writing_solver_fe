import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'new-post',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'new-post',
        loadComponent: () =>
          import('./features/new-post/new-post.component').then(m => m.NewPostComponent),
      },
      {
        path: 'topic-ideas',
        loadComponent: () =>
          import('./features/topic-ideas/topic-ideas.component').then(m => m.TopicIdeasComponent),
      },
      {
        path: 'writing-solver',
        loadComponent: () =>
          import('./features/writing-solver/writing-solver.component').then(m => m.WritingSolverComponent),
      },
      {
        path: 'knowledge-base',
        loadComponent: () =>
          import('./features/knowledge-base/knowledge-base.component').then(m => m.KnowledgeBaseComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./features/settings/settings.component').then(m => m.SettingsComponent),
      },
    ],
  },
  {
    path: 'login-success',
    loadComponent: () =>
      import('./features/auth/pages/login-success/login-success.component').then(m => m.LoginSuccessComponent),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'new-post',
  },
];
