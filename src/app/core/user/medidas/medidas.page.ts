import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonLabel, IonNote } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { body, barbell, restaurant } from 'ionicons/icons';

@Component({
  selector: 'app-medidas',
  templateUrl: './medidas.page.html',
  styleUrls: ['./medidas.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonList, IonItem, IonLabel, IonNote
  ]
})
export class MedidasPage implements OnInit {

  medidas = [
    { name: 'Hombros', value: 99, unit: 'cm' },
    { name: 'Pecho', value: 105, unit: 'cm' },
    { name: 'Bíceps', value: 36, unit: 'cm' },
    { name: 'Cintura', value: 80, unit: 'cm' },
    { name: 'Cadera', value: 96, unit: 'cm' },
    { name: 'Pierna', value: 56, unit: 'cm' },
    { name: 'Gemelo', value: 33, unit: 'cm' },
  ];

  constructor() {
    addIcons({ body, barbell, restaurant });
  }

  ngOnInit() {
  }

}
