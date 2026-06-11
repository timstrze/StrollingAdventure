import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BOOK_JSON_LD } from '../seo/seo.constants';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './about.html',
  styleUrls: ['../shared/content-page.css', './about.css'],
})
export class About implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'About Strolling Adventure — Christian Children\'s Book | Gloria Taylor Crone',
      description:
        'Learn about Strolling Adventure, a Christian children\'s book inspired by nature walks in Yorktown, Virginia — with music, colors, numbers, and wonder at God\'s creation.',
      path: '/about',
    });
    this.seo.setJsonLd(BOOK_JSON_LD);
  }
}
