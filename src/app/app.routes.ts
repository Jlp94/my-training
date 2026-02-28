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
            path: 'shopping-list',
            loadComponent: () => import('./core/shopping-list/shopping-list.page').then(m => m.ShoppingListPage)
          },
          {
            path: 'supplementation',
            loadComponent: () => import('./core/supplementation/supplementation.page').then(m => m.SupplementationPage)
          },
          {
            path: 'food-equivalence',
            loadComponent: () => import('./core/food-equivalence/food-equivalence.page').then(m => m.FoodEquivalencePage)
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
          },
          {
            path: 'settings-user',
            loadComponent: () => import('./core/settings-user/settings-user.page').then(m => m.SettingsUserPage)
          },


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
    loadComponent: () => import('./auth/login/login.page').then(m => m.LoginPage)
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
