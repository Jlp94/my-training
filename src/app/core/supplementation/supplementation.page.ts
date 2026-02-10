import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg, IonText, IonTitle } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';

@Component({
  selector: 'app-supplementation',
  templateUrl: './supplementation.page.html',
  styleUrls: ['./supplementation.page.scss'],
  standalone: true,
  imports: [IonTitle, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardContent, IonImg, IonText, CommonModule, FormsModule, HeaderComponent, LayoutComponent]
})
export class SupplementationPage implements OnInit {

  brands = [
    { name: 'HSN', image: 'assets/images/hsn.jpg', url: 'https://www.hsnstore.com/' },
    { name: 'MyProtein', image: 'assets/images/my-protein.png', url: 'https://www.myprotein.es/' },
    { name: 'Prozis', image: 'assets/images/prozis.png', url: 'https://www.prozis.com/es/es' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
