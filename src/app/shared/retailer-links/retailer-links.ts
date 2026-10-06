import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-retailer-links',
  templateUrl: './retailer-links.html',
  styleUrl: './retailer-links.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetailerLinks {
  readonly headingId = input<string | undefined>(undefined);
}
