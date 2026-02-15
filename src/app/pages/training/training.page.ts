import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonIcon, IonCardContent } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { barbell, book, fitness } from 'ionicons/icons';
import { RouterLink } from '@angular/router';
import { LayoutComponent } from "src/app/components/layout/layout.component";

@Component({
  selector: 'app-training',
  templateUrl: './training.page.html',
  styleUrls: ['./training.page.scss'],
  standalone: true,
  imports: [IonCardContent, IonIcon, IonCard, IonContent, CommonModule, FormsModule, HeaderComponent, RouterLink, LayoutComponent]
})
export class TrainingPage implements OnInit {


  options = [
    { title: "Mi rutina", img: "barbell", url: "/tabs/training/my-routine" },
    { title: "Explicación de ejercicios", img: "book", url: "/tabs/training/exercise-library" },
    { title: "Cardio", img: "fitness", url: "/tabs/training/cardio" },
  ];

  constructor() {
    addIcons({
      barbell,
      book,
      fitness,
    })
  }

  ngOnInit() {
  }

}
