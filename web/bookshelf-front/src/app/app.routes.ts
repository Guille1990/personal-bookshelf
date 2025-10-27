import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { LibraryComponent } from './components/library/library.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { EditItemComponent } from './components/edit-item/edit-item.component';
import { ViewItemComponent } from './components/view-item/view-item.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'library/view/:id', component: ViewItemComponent },
  { path: 'library/edit/:id', component: EditItemComponent },
  { path: 'add-item', component: AddItemComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
