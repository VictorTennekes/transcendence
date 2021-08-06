import { Component } from '@angular/core';

export interface Tile {
    color: string;
    cols: number;
    rows: number;
    text: string;
  }
  
  /**
   * @title Dynamic grid-list
   */
@Component({
  selector: 'app-root',
  templateUrl: './app.component1.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Descendence';
    tiles: Tile[] = [
      {text: 'One', cols: 1, rows: 1, color: 'lightblue'},
      {text: 'Two', cols: 2, rows: 1, color: 'lightgreen'},
      {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    ];
}
