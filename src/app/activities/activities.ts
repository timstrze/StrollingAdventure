import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-activities-page',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './activities.html',
  styleUrls: ['../shared/content-page.css'],
})
export class ActivitiesPage implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Free Printable Activities — Strolling Adventure Maze & Word Search',
      description:
        'Free printable maze and word search puzzles based on Strolling Adventure — help GiGi find her way and discover words from the book!',
      path: '/activities',
    });
    this.seo.clearJsonLd();
  }
}
