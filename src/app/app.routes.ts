import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'training',
        loadComponent: () => import('./pages/training/training.page').then(m => m.TrainingPage)
      },
      {
        path: 'diet',
        loadComponent: () => import('./pages/diet/diet.page').then(m => m.DietPage)
      },
      {
        path: 'user',
        loadComponent: () => import('./pages/user/user.page').then(m => m.UserPage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: '**',
    redirectTo: 'tabs',
    pathMatch: 'full',
  },
];
