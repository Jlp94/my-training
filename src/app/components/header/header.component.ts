import { Component, OnInit, model, ModelSignal } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle } from "@ionic/angular/standalone";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle],
})
export class HeaderComponent implements OnInit {
  titulo: ModelSignal<string> = model.required();
  showBack: ModelSignal<boolean> = model.required();
  url: ModelSignal<string> = model.required();

  constructor() { }

  ngOnInit() { }

}
