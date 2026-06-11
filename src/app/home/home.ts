import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  BOOK_JSON_LD,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  YOUTUBE_PLAYLIST_URL,
} from '../seo/seo.constants';
import { SeoService } from '../seo/seo.service';
import { SiteFooter } from '../shared/site-footer/site-footer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SiteFooter],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly youtubePlaylistUrl = YOUTUBE_PLAYLIST_URL;
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.update({
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      path: '/',
    });
    this.seo.setJsonLd(BOOK_JSON_LD);
  }
}
