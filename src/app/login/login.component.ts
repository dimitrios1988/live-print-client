import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { LoginService } from './login.service';
import { MatDialog } from '@angular/material/dialog';
import { SettingsDialogComponent } from '../header/settings-dialog/settings-dialog.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  private readonly dialog: MatDialog;

  constructor(fb: FormBuilder, private loginService: LoginService) {
    this.loginForm = fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.dialog = inject(MatDialog);
  }

  onSubmit() {
    this.loginService.login(this.loginForm.value);
  }

  onSettingsClicked() {
    this.displaySettingsDialog();
  }

  displaySettingsDialog() {
    this.dialog.open(SettingsDialogComponent, {
      minWidth: '600px',
      minHeight: '400px',
    });
  }
}
