import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE_URL } from '../seo/seo.constants';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';
import { SCHOOL_VISITS, SCHOOL_VISITS_TEASER, VisitPhoto } from './visits';

@Component({
  selector: 'app-school-visits',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './school-visits.html',
  styleUrls: ['../shared/content-page.css', './school-visits.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchoolVisits implements OnInit {
  readonly visits = SCHOOL_VISITS;
  readonly selected = signal<VisitPhoto | null>(null);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'School Visits — Strolling Adventure in the Classroom',
      description:
        'Gloria Taylor Crone and Brandy Taylor Strzelecki visit schools to share Strolling Adventure — photos from a Yorktown Elementary classroom visit.',
      path: '/school-visits',
      ogImage: `${SITE_URL}/${SCHOOL_VISITS_TEASER.src}`,
    });
    this.seo.clearJsonLd();
  }

  openPhoto(photo: VisitPhoto, dialog: HTMLDialogElement): void {
    this.selected.set(photo);
    dialog.showModal();
  }

  closePhoto(dialog: HTMLDialogElement): void {
    dialog.close();
    this.selected.set(null);
  }

  onDialogClick(event: MouseEvent, dialog: HTMLDialogElement): void {
    if (event.target === dialog) {
      this.closePhoto(dialog);
    }
  }
}
