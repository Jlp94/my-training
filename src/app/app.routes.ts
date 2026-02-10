import { Routes } from '@angular/router';

export const routes: Routes = [

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
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/training/training.page').then(m => m.TrainingPage)
          },
          {
            path: 'my-routine',
            loadComponent: () => import('./core/my-routine/my-routine.page').then(m => m.MyRoutinePage)
          },
          {
            path: 'exercise-library',
            loadComponent: () => import('./core/exercise-library/exercise-library.page').then(m => m.ExerciseLibraryPage)
          },
          {
            path: 'cardio',
            loadComponent: () => import('./core/cardio/cardio.page').then(m => m.CardioPage)
          },
        ]
      },
      {
        path: 'diet',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/diet/diet.page').then(m => m.DietPage)
          },
          {
            path: 'my-diet',
            loadComponent: () => import('./core/my-diet/my-diet.page').then(m => m.MyDietPage)
          },
          {
            path: 'list-cart-food',
            loadComponent: () => import('./core/list-cart-food/list-cart-food.page').then(m => m.ListCartFoodPage)
          },
          {
            path: 'supplementation',
            loadComponent: () => import('./core/supplementation/supplementation.page').then(m => m.SupplementationPage)
          },
        ]
      },
      {
        path: 'user',
        children: [
          {
            path: '',
            loadComponent: () => import('./pages/user/user.page').then(m => m.UserPage)
          },
          {
            path: 'medidas',
            loadComponent: () => import('./core/medidas/medidas.page').then(m => m.MedidasPage)
          }

        ]
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('./core/login/login.page').then(m => m.LoginPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  },





];
