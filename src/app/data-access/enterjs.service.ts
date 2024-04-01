import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnterjsService {
  public loading: boolean = true;

  constructor(
    private http: HttpClient
  ) {}

  load() {
    this.http.get('https://matthias-glatthorn.de/api/enterjs')
      .subscribe(data => {
        console.log(data);
      });
  }
}
