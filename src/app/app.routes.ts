import { Routes } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Redirect empty path to 'home'
  { path: 'main', component: MainComponent, canActivate: [AuthGuard] }, // Route for 'home'
  { path: 'login', component: LoginComponent }, // Route for 'login'
  { path: '**', redirectTo: 'main' }, // Redirect all unknown paths to 'home'
];
