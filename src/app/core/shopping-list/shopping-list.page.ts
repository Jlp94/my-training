import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonToolbar, IonSegment, IonSegmentButton, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline, cartOutline } from 'ionicons/icons';
import { ShoppingListService } from 'src/app/services/shopping-list-service';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.page.html',
  styleUrls: ['./shopping-list.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonToolbar,
    IonSegment, IonSegmentButton, IonSpinner
  ]
})
export class ShoppingListPage implements OnInit {

  readonly shoppingListService: ShoppingListService = inject(ShoppingListService);

  selectedPeriod: string = 'semanal';
  multiplier: number = 7;

  constructor() {
    addIcons({ checkboxOutline, squareOutline, cartOutline });
  }

  ngOnInit() {
    this.shoppingListService.loadShoppingList();
  }

  segmentChanged(event: any) {
    this.selectedPeriod = event.detail.value;
    switch (this.selectedPeriod) {
      case 'semanal': this.multiplier = 7; break;
      case '2semanas': this.multiplier = 14; break;
      case 'mensual': this.multiplier = 28; break;
    }
  }
}
