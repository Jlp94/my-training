import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonIcon, IonCardContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, book, pulseSharp } from 'ionicons/icons';

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonIcon, IonCard, IonContent, CommonModule, FormsModule, HeaderComponent]
})
export class TrainingPage implements OnInit {


  options = [
    { title: "Mi rutina", img: "barbell" },
    { title: "Explicación de ejercicios", img: "book" },
    { title: "Cardio", img: "pulse-sharp" },
  ];

  constructor() {
    addIcons({
      barbell,
      book,
      pulseSharp,
    })
  }

  ngOnInit() {
  }

}
