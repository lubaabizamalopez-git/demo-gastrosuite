import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, Event as RouterEvent, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { GourmetSpinnerComponent } from './shared/components/gourmet-spinner/gourmet-spinner.component';
import { SidebarService } from './shared/components/sidebar/sidebar.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent, CommonModule, GourmetSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'gastrosuite';
  router = inject(Router);
  public sidebarService = inject(SidebarService);

  get isLoginRoute() {
    return this.router.url === '/login' || this.router.url === '/';
  }
}
