import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './service/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
  loaderSvc = inject(LoaderService);
}
