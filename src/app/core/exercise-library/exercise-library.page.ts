import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonAccordionGroup,
  IonAccordion,
  IonThumbnail,
  IonIcon,
  IonSearchbar,
  IonBadge,
  IonText
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { addIcons } from 'ionicons';
import { barbell, logoYoutube } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

@Component({
  selector: 'app-exercise-library',
  templateUrl: './exercise-library.page.html',
  styleUrls: ['./exercise-library.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonItem,
    IonLabel,
    IonAccordionGroup,
    IonAccordion,
    IonThumbnail,
    IonIcon,
    IonSearchbar,
    IonBadge,
    IonText,
    CommonModule,
    FormsModule,
    HeaderComponent,
    LayoutComponent
  ]
})
export class ExerciseLibraryPage implements OnInit {

  exercises = [
    {
      id: "1",
      name: "ABDOMINALES EN V",
      target: "Abdominales",
      equipment: "Peso corporal",
      description: "Acostado, eleva el tronco llevando las manos hacia los pies. Mantén tensión constante en la zona superior del abdomen.",
      tags: ["ABDOMINALES", "TUMBADO"],
      videoUrl: "https://www.youtube.com/watch?v=1"
    },
    {
      id: "2",
      name: "ABDOMINALES TIPO CRUNCH EN MÁQUINA",
      target: "Abdominales",
      equipment: "Máquina",
      description: "Realiza la flexión del tronco utilizando la resistencia de la máquina de crunch abdominal.",
      tags: ["ABDOMINALES", "MÁQUINA"],
      videoUrl: "https://www.youtube.com/watch?v=2"
    },
    {
      id: "3",
      name: "ABDOMINALES TIPO CRUNCH EN PARALELAS",
      target: "Abdominales",
      equipment: "Paralelas",
      description: "Realiza la flexión del tronco en las barras paralelas elevando las piernas o el torso.",
      tags: ["ABDOMINALES", "PARALELAS"],
      videoUrl: "https://www.youtube.com/watch?v=3"
    },
    {
      id: "4",
      name: "ADUCCIÓN HORIZONTAL CON POLEAS EN PIE",
      target: "Pectoral (aducción)",
      equipment: "Polea",
      description: "Tracción de las poleas hacia el centro del pecho manteniendo la posición de pie.",
      tags: ["PECTORAL", "POLEA"],
      videoUrl: "https://www.youtube.com/watch?v=4"
    }
  ];

  constructor() {
    addIcons({ barbell, logoYoutube });
  }

  ngOnInit() {
  }

}
