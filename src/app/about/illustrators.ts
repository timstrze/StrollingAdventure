import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-illustrators',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './illustrators.html',
  styleUrls: ['../shared/content-page.css'],
})
export class Illustrators implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Illustrators of Strolling Adventure — Brandy & Amber Taylor',
      description:
        'Meet Brandy Taylor Strzelecki and Amber Marie Taylor, the illustrators who brought Strolling Adventure to life with watercolor art and hand-lettered text.',
      path: '/about/illustrators',
    });
    this.seo.clearJsonLd();
  }
}
