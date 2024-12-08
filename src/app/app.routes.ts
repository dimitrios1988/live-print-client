import { Routes } from '@angular/router';
import { PrintUiComponent } from './print-ui/print-ui.component';
import { MainComponent } from './main/main.component';

export const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' }, // Redirect empty path to 'home'
  { path: 'main', component: MainComponent }, // Route for 'home'
  { path: '**', redirectTo: 'main' }, // Redirect all unknown paths to 'home'
];
