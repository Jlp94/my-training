import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {

  private readonly http = inject(HttpClient);
  private readonly cloudName = 'dhffyyexv';
  private readonly uploadPreset = 'nki2zn6k';
  private readonly uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

  uploadAvatar(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', 'avatars');

    return this.http.post<any>(this.uploadUrl, formData).pipe(
      map(res => res.secure_url)
    );
  }
}
