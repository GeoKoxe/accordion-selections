import { Component, OnInit } from "@angular/core";
import { CdkAccordionModule } from "@angular/cdk/accordion";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { CommonModule } from "@angular/common";
import { faChevronDown, faRotateLeft } from "@fortawesome/free-solid-svg-icons";

type Item = { itemId: number; name: string };
type Size = { sizeId: number; name: string };
type PriceEntry = { itemId: number; sizeId: number; price: number };

@Component({
  selector: "cdk-accordion-overview-example",
  templateUrl: "accordion.component.html",
  styleUrl: "accordion.component.css",
  standalone: true,
  imports: [CdkAccordionModule, FontAwesomeModule, CommonModule],
})
export class CdkAccordionOverviewExample implements OnInit {
  faChevronDown = faChevronDown;
  faRotateLeft = faRotateLeft;
  //libs
  items: Item[] = [
    { itemId: 0, name: "Margherita" },
    { itemId: 1, name: "Pepperoni" },
  ];

  itemSizes: Size[] = [
    { sizeId: 0, name: "Small" },
    { sizeId: 1, name: "Medium" },
    { sizeId: 2, name: "Large" },
  ];

  defaultItemPrices: PriceEntry[] = [
    { itemId: 0, sizeId: 0, price: 3.99 },
    { itemId: 0, sizeId: 1, price: 5.99 },
    { itemId: 0, sizeId: 2, price: 7.99 },
    { itemId: 1, sizeId: 0, price: 4.42 },
    { itemId: 1, sizeId: 1, price: 6.52 },
    { itemId: 1, sizeId: 2, price: 8.62 },
  ];

  itemPrices: PriceEntry[] = [];
  initialPrices: PriceEntry[] = [];

  selectedSizeMap = new Map<number, Set<number>>();
  initialSelectedMap = new Map<number, Set<number>>();
  //on first print of page, fetch state for resets
  ngOnInit() {
    const saved = localStorage.getItem("itemPrices");
    this.itemPrices = saved ? JSON.parse(saved) : [...this.defaultItemPrices];
    this.initialPrices = JSON.parse(JSON.stringify(this.defaultItemPrices));

    this.items.forEach((item) => {
      const selectedSizes = this.itemPrices
        .filter((p) => p.itemId === item.itemId && p.price > 0)
        .map((p) => p.sizeId);
      this.selectedSizeMap.set(item.itemId, new Set(selectedSizes));

      const defaultSizes = this.defaultItemPrices
        .filter((p) => p.itemId === item.itemId && p.price > 0)
        .map((p) => p.sizeId);
      this.initialSelectedMap.set(item.itemId, new Set(defaultSizes));
    });
  }

  savePricesToStorage() {
    localStorage.setItem("itemPrices", JSON.stringify(this.itemPrices));
  }

  getPrice(itemId: number, sizeId: number): number {
    return (
      this.itemPrices.find((p) => p.itemId === itemId && p.sizeId === sizeId)
        ?.price ?? 0
    );
  }
  //+price value tracker
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

  toggleCheckbox(itemId: number, sizeId: number): void {
    const currentlySelected = this.isSelected(itemId, sizeId);
    this.onCheckboxChange(itemId, sizeId, !currentlySelected);
  }

  onCheckboxChange(itemId: number, sizeId: number, checked: boolean): void {
    const sizeSet = this.selectedSizeMap.get(itemId) ?? new Set<number>();
    if (checked) {
      sizeSet.add(sizeId);
      if (
        !this.itemPrices.some((p) => p.itemId === itemId && p.sizeId === sizeId)
      ) {
        this.itemPrices.push({ itemId, sizeId, price: 0 });
      }
    } else {
      sizeSet.delete(sizeId);
      const entry = this.itemPrices.find(
        (p) => p.itemId === itemId && p.sizeId === sizeId
      );
      if (entry) {
        entry.price = 0;
      }
    }
    this.selectedSizeMap.set(itemId, sizeSet);
    this.savePricesToStorage();
  }

  onCheckboxKeydown(event: KeyboardEvent, itemId: number, sizeId: number) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      this.toggleCheckbox(itemId, sizeId);
    }
  }

  // undo button
  undoChanges(itemId: number): void {
    this.itemPrices = this.itemPrices.filter((p) => p.itemId !== itemId);
    const original = this.initialPrices.filter((p) => p.itemId === itemId);
    this.itemPrices.push(...original.map((p) => ({ ...p })));

    const originalSet = this.initialSelectedMap.get(itemId);
    if (originalSet) {
      this.selectedSizeMap.set(itemId, new Set(originalSet));
    }

    this.savePricesToStorage();
  }
  //when to pop undo button
  hasChanges(itemId: number): boolean {
    const original = this.initialPrices.filter((p) => p.itemId === itemId);
    const current = this.itemPrices.filter((p) => p.itemId === itemId);

    if (current.length !== original.length) return true;

    for (const c of current) {
      const match = original.find(
        (o) => o.sizeId === c.sizeId && o.price === c.price
      );
      if (!match) return true;
    }

    const originalSet = this.initialSelectedMap.get(itemId);
    const currentSet = this.selectedSizeMap.get(itemId);
    if (!originalSet || !currentSet) return true;
    if (originalSet.size !== currentSet.size) return true;

    for (const size of currentSet) {
      if (!originalSet.has(size)) return true;
    }

    return false;
  }
}
