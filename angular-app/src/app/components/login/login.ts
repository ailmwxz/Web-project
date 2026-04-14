import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  errorMessage: string = '';

  constructor(private router: Router) {}

  onLogin() {
    // пока нет бека "фейк" проверка
    if (this.loginData.username === 'admin' && this.loginData.password === '12345') {
      console.log('Успешный вход!');
      // В будущем тут будет запись JWT токена в LocalStorage
      this.router.navigate(['/dashboard']); 
    } else {
      this.errorMessage = 'Неверное имя пользователя или пароль';
    }
  }
}