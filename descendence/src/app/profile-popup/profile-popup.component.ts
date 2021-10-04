import { Component, OnInit } from '@angular/core';

interface User {
  status: string,
};

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.component.html',
  styleUrls: ['./profile-popup.component.scss']
})
export class ProfilePopupComponent implements OnInit {

  user: User;
  constructor() {
    this.user = {
      status: 'ingame'
    };
  }

  ngOnInit(): void {
  }

}
