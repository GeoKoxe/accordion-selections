import { Component } from "@angular/core";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "cdk-accordion-overview-example",
  templateUrl: "accordion.component.html",
  styleUrl: "accordion.component.css",
  standalone: true,
  imports: [CdkAccordionModule, FontAwesomeModule, CommonModule],
})
export class CdkAccordionOverviewExample {
  faChevronDown = faChevronDown;
  faRotateLeft = faRotateLeft;

  defaultItemPrices = [
    { itemId: 0, sizeId: 0, price: 3.99 },
    { itemId: 0, sizeId: 1, price: 5.99 },
    { itemId: 0, sizeId: 2, price: 7.99 },
    { itemId: 1, sizeId: 0, price: 4.42 },
    { itemId: 1, sizeId: 1, price: 6.52 },
    { itemId: 1, sizeId: 2, price: 8.62 },
  ];

  defaultItems = [
    { itemId: 0, name: "Margherita" },
    { itemId: 1, name: "Pepperoni" },
  ];

  items = [...this.defaultItems];
  itemPrices = [...this.defaultItemPrices];

  itemSizes = [
    { sizeId: 0, name: "Small" },
    { sizeId: 1, name: "Medium" },
    { sizeId: 2, name: "Large" },
  ];

  currentItemId = 0;
  selectedSizeMap = new Map<number, Set<number>>();
  initialPrices: any[] = [];
  initialSelectedMap = new Map<number, Set<number>>();

  ngOnInit() {
    const saved = localStorage.getItem("itemPrices");

    if (saved) {
      this.itemPrices = JSON.parse(saved);
    }

    this.initialPrices = JSON.parse(JSON.stringify(this.defaultItemPrices));

    this.items.forEach((item) => {
      const sizes = this.itemPrices
        .filter((p) => p.itemId === item.itemId && p.price > 0)
        .map((p) => p.sizeId);

      this.selectedSizeMap.set(item.itemId, new Set(sizes));

      const originalSizes = this.defaultItemPrices
        .filter((p) => p.itemId === item.itemId && p.price > 0)
        .map((p) => p.sizeId);

      this.initialSelectedMap.set(item.itemId, new Set(originalSizes));
    });
  }

  getPrice(itemId: number, sizeId: number): number | "" {
    const entry = this.itemPrices.find(
      (p) => p.itemId === itemId && p.sizeId === sizeId
    );
    return entry ? entry.price : "";
  }

  savePricesToStorage() {
    localStorage.setItem("itemPrices", JSON.stringify(this.itemPrices));
  }

  updatePrice(itemId: number, sizeId: number, newValue: string) {
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed)) {
      let entry = this.itemPrices.find(
        (p) => p.itemId === itemId && p.sizeId === sizeId
      );
      if (!entry) {
        entry = { itemId, sizeId, price: parsed };
        this.itemPrices.push(entry);
      } else {
        entry.price = parsed;
      }
      this.savePricesToStorage();
    }
  }

  isSelected(itemId: number, sizeId: number): boolean {
    return this.selectedSizeMap.get(itemId)?.has(sizeId) ?? false;
  }

  onCheckboxChange(itemId: number, sizeId: number, checked: boolean) {
    let selectedSet = this.selectedSizeMap.get(itemId);
    if (!selectedSet) {
      selectedSet = new Set<number>();
    }

    if (checked) {
      selectedSet.add(sizeId);
      let entry = this.itemPrices.find(
        (p) => p.itemId === itemId && p.sizeId === sizeId
      );
      if (!entry) {
        this.itemPrices.push({ itemId, sizeId, price: 0 });
        this.savePricesToStorage();
      }
    } else {
      selectedSet.delete(sizeId);
      let entry = this.itemPrices.find(
        (p) => p.itemId === itemId && p.sizeId === sizeId
      );
      if (entry) {
        entry.price = 0;
        this.savePricesToStorage();
      }
    }
    this.selectedSizeMap.set(itemId, selectedSet);
  }

  hasChanges(itemId: number): boolean {
    const current = this.itemPrices.filter((p) => p.itemId === itemId);
    const original = this.initialPrices.filter((p) => p.itemId === itemId);
    if (current.length !== original.length) return true;

    for (let i = 0; i < current.length; i++) {
      const match = original.find(
        (p) => p.sizeId === current[i].sizeId && p.price === current[i].price
      );
      if (!match) return true;
    }

    const currentSet = this.selectedSizeMap.get(itemId);
    const originalSet = this.initialSelectedMap.get(itemId);
    if (!currentSet || !originalSet) return true;
    if (currentSet.size !== originalSet.size) return true;

    for (const sizeId of currentSet) {
      if (!originalSet.has(sizeId)) return true;
    }

    return false;
  }

  undoChanges(itemId: number) {
    this.itemPrices = this.itemPrices.filter((p) => p.itemId !== itemId);
    const original = this.initialPrices.filter((p) => p.itemId === itemId);
    this.itemPrices.push(...original.map((p) => ({ ...p })));

    const originalSet = this.initialSelectedMap.get(itemId);
    if (originalSet) {
      this.selectedSizeMap.set(itemId, new Set(originalSet));
    }

    this.savePricesToStorage();
  }
  toggleCheckbox(itemId: number, sizeId: number): void {
    const current = this.isSelected(itemId, sizeId);
    this.onCheckboxChange(itemId, sizeId, !current);
  }

  onCheckboxKeydown(
    event: KeyboardEvent,
    itemId: number,
    sizeId: number
  ): void {
    const key = event.key;
    if (key === " " || key === "Enter") {
      event.preventDefault();
      this.toggleCheckbox(itemId, sizeId);
    }
  }
}

