import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LEARN_TOPICS } from './topics';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-learn-hub',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './learn-hub.html',
  styleUrls: ['../shared/content-page.css'],
})
export class LearnHub implements OnInit {
  readonly topics = LEARN_TOPICS;
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: 'Learn About Nature — Strolling Adventure | Yorktown, Virginia',
      description:
        'Explore ten nature topics from Strolling Adventure — sun, trees, birds, honeybees, butterflies, and more, inspired by walks in Yorktown, Virginia.',
      path: '/learn',
    });
    this.seo.clearJsonLd();
  }
}
