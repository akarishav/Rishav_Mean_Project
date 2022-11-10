import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  // selector: 'app-login',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy{
  isLoading = false;
  private authStatusSub: Subscription;

  public showPassword: boolean = false;

  constructor(public authService: AuthService){}

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

  onSignup(form:NgForm){
    if(form.invalid){
      return;
    }


    this.authService.createUser(form.value.email, form.value.password);
  }
}
