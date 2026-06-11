import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-author',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './author.html',
  styleUrls: ['../shared/content-page.css'],
})
export class Author implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Gloria Taylor Crone — Author of Strolling Adventure',
      description:
        'Gloria Taylor Crone is the author of Strolling Adventure, a Christian children\'s book inspired by nature walks with her grandson in Yorktown, Virginia.',
      path: '/about/author',
    });
    this.seo.clearJsonLd();
  }
}
