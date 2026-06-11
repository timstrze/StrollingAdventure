import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { topicBySlug, LearnTopic as LearnTopicData } from './topics';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-learn-topic',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './learn-topic.html',
  styleUrls: ['../shared/content-page.css'],
})
export class LearnTopic implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  topic: LearnTopicData | undefined;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.topic = topicBySlug(slug);
      if (this.topic) {
        this.seo.update({
          title: `${this.topic.title} | Strolling Adventure`,
          description: this.topic.description,
          path: `/learn/${slug}`,
        });
      }
      this.seo.clearJsonLd();
    });
  }
}
