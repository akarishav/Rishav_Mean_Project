import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authStatusSub: Subscription;

  public showPassword: boolean = false;

  constructor(public authService: AuthService ){}

  ngOnInit(){
    this.authStatusSub = this.authService.getAuthStatusListener().subscribe(authStatus =>{
      this.isLoading = false;
    });
  }
  ngOnDestroy(){
    this.authStatusSub.unsubscribe();
  }

  public togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }


  onLogin(form:NgForm){
    if(form.invalid){
      return;
    }
    this.isLoading = true;
    this.authService.login(form.value.email, form.value.password);
  }
}
