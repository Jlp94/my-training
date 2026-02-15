import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";

@Component({
  selector: 'app-settings-user',
  templateUrl: './settings-user.page.html',
  styleUrls: ['./settings-user.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent]
})
export class SettingsUserPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
