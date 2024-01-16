import { Component } from '@angular/core';
import { SpotifyService } from '../../../shared/services/spotify.service';
import { AlbumElement, Artist, TracksItem, Tracks} from '../../../shared/interfaces/spotify.interfaces';
import { MusicTableComponent } from "../../../shared/components/music-table/music-table.component";
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'artist-details-page',
    standalone: true,
    templateUrl: './artist-details-page.component.html',
    styles: ``,
    imports: [MusicTableComponent]
})
export class ArtistDetailsPageComponent {
  [x: string]: any;

  private typeList: boolean = false; //* Boolean porque seran 2 tipos: Album y Top Canciones (false = Album <> true = Top)
  public album!: AlbumElement;
  public artist!: Artist;
  public topSongs!: TracksItem[];
  private idArtist: string | null = localStorage.getItem('idArtista')
  //public tracksList!: TracksItem[];

  constructor(
      private spotifyService: SpotifyService,
      private route:ActivatedRoute,
      private router: Router
  ){}

  ngOnInit(){
    this.route.params.subscribe(params => {
      const type = params['type'];
      if (type==='album' || type==='single'){ // Albums or singles
        this.typeList = false;
        this.albumInfo( params['id']);
        this.idArtist !== null ? this.artistInfo(this.idArtist) : console.error('No hay ID de artista almacenado en localStorage.');
      }else{
        this.typeList = true;
        this.artistInfo(params['id']);
      }
    });
  }

  public normalizedData():TracksItem[]{
    let tracksList:TracksItem[] = [];

    if (!this.typeList) {
      let emptyTracks: Tracks = {
        href: '',
        items: [],
        limit: 0,
        next: '',
        offset: 0,
        previous: null,
        total: 0,
      };

      let trackAlbum: AlbumElement = {
        album_type: this.album.album_type,
        artists: [],
        available_markets: [],
        total_tracks: this.album.total_tracks,
        external_urls: this.album.external_urls,
        href: this.album.href,
        id: this.album.id,
        images: this.album.images,
        name: this.album.name,
        release_date: this.album.release_date,
        release_date_precision: this.album.release_date_precision,
        tracks: emptyTracks,
        type: this.album.type,
        uri: this.album.uri,
      };

      // Hacer copia profunda del array original
      let tracks = JSON.parse(JSON.stringify(this.album.tracks.items));

      for (const track of tracks) {
        track.album = trackAlbum;
        tracksList.push(track);
      }
    } else {
      // aqui el otro lado
      this.idArtist !== null ? this.artistInfo(this.idArtist) : console.error('No hay ID de artista almacenado en localStorage.');
      return this.topSongs
    }
    return tracksList
  }

  backToSearch(): void{
    localStorage.removeItem('idArtista');
    this.router.navigate(['/search']);

  }

  topSongInfo(id: string):void{
    this.spotifyService.topSongsInfo(id).subscribe(
      (response) => {this.topSongs = response, console.log(this.topSongs)},
      (error) => console.error(error)
    );
  }

  artistInfo(id: string):void{
    this.spotifyService.artistInfo(id).subscribe(
      (response) => {this.artist = response, console.log("artist", this.artist)},
      (error) => console.error(error)
    );
  }

  albumInfo(id: string): void {
    this.spotifyService.albumInfo(id).subscribe(
      (response) => {this.album = response},
      (error) => console.error(error)
    );
  }
}
