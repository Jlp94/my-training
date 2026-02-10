import { Component, OnInit } from '@angular/core';
import { IonContent, IonGrid, IonRow, IonCol } from "@ionic/angular/standalone";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  imports: [IonCol, IonRow, IonGrid],
})
export class LayoutComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
