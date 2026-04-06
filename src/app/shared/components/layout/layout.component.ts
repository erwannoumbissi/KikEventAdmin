import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="ke-shell">
      <app-sidebar></app-sidebar>
      <main class="ke-main"><router-outlet></router-outlet></main>
    </div>
  `,
  styles: [
    `.ke-shell{display:flex;min-height:100vh}
     .ke-main{margin-left:230px;flex:1;min-height:100vh;background:#F5F5F7}`
  ]
})
export class LayoutComponent {}
