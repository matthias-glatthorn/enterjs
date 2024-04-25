import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-icon-bar',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './icon-bar.component.html',
  styleUrl: './icon-bar.component.scss'
})
export class IconBarComponent {

}
