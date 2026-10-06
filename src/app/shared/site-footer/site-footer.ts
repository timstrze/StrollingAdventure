import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { YOUTUBE_PLAYLIST_URL } from '../../seo/seo.constants';
import { RetailerLinks } from '../retailer-links/retailer-links';

@Component({
  selector: 'app-site-footer',
  standalone: true,
  imports: [RouterLink, RetailerLinks],
  templateUrl: './site-footer.html',
  styleUrl: './site-footer.css',
})
export class SiteFooter {
  readonly youtubePlaylistUrl = YOUTUBE_PLAYLIST_URL;
}
