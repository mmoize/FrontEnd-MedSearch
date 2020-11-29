import { Medication } from './../models/medication';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap, timeout } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

export interface MedicationData{
  id: string;
  user: [];
  name: string;
  description: string;
  dose: string;
  number_of_items: string;
  medicationimage_set: [];
}

@Injectable({
  providedIn: 'root'
})
export class MedicationService {

  public items: any = [];

  private _medication = new BehaviorSubject<Medication[]>([]);
  
  baseUrl = 'https://medsearch.herokuapp.com/';
  searchMedicationUrl = `${this.baseUrl}medication/searchmed/`;
  createMedicationUrl =  `${this.baseUrl}medication/create_medication/`;
  getMedicationDetailUrl =  `${this.baseUrl}medication/medidetail/`;
  getRecentMedicationsUrl = `${this.baseUrl}medication/recentmedication/`;
  getAllOwnersMedicationUrl = `${this.baseUrl}medication/ownersmedication/`;


  headers;
  token;

  constructor(
    private httpClient: HttpClient,
  ) {


  }
  //  async returnUserToken() {
  //   const value = await localStorage.getItem('authData') ;
  //   const dic = JSON.parse(value);
  //   const dicToken = dic.token;
  //   this.token = dicToken;
  //   console.log('for auth token', dicToken);

  //   return dicToken;
  // }

  // async createPostListing(data) {
  //   const value = await localStorage.getItem('authData') ;
  //   const dic = JSON.parse(value);
  //   const dicToken = dic.token;
  //   this.token = dicToken;
  //   console.log('for auth token', dicToken);


  //   const xhr = new XMLHttpRequest();
  //   const url = this.baseMovieCreateUrl;
  //   xhr.open('POST', url, true);
  //   xhr.setRequestHeader( 'Authorization', 'Token ' + dicToken );
  //   xhr.withCredentials = true;
  //   return xhr.send(data);
  // }

  // async rateMovie(rate: number, movieId: number) {
  //   const value = await localStorage.getItem('authData') ;
  //   const dic = JSON.parse(value);
  //   const dicToken = dic.token;
  //   this.token = dicToken;
  //   const body = JSON.stringify({stars: rate});


  //   const xhr = new XMLHttpRequest();
  //   const url = `${this.baseMovieUrl}${movieId}/rate_movie/`
  //   xhr.open('POST', url, true);
  //   xhr.setRequestHeader( 'Authorization', 'Token ' + dicToken );
  //   xhr.setRequestHeader( 'Content-Type', 'application/json');
  //   xhr.withCredentials = true;
  //   return xhr.send(body);
  // }


  // getMovies() {
  //   this. headers= new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Token ${this.token}`
  //   });
  //   console.log('this is ', this.headers);
  //   return this.httpClient.get<Medication>(this.baseMovieUrl, {headers: this.headers});
  // }

  // raeMovie(rate: number, movieId: number) {
  //   const body = JSON.stringify({stars: rate});
  //   return this.httpClient.post(`${this.baseMovieUrl}${movieId}/rate_movie/`, body, {headers: this.headers});
  // }

  // getMovie(id: number) {
  //   return this.httpClient.get(`${this.baseMovieUrl}${id}/`, {headers: this.headers});
  // }

  // createMovie(title: string, description: string) {
  //   const body = JSON.stringify({title, description});
  //   return this.httpClient.post(`${this.baseMovieUrl}`, body, {headers: this.headers});
  // }

  // updateMovie(id: number, title: string, description: string) {
  //   const body = JSON.stringify({title, description});
  //   return this.httpClient.put(`${this.baseMovieUrl}${id}/`, body, {headers: this.headers});
  // }

  // deleteMovie(id: number) {
  //   return this.httpClient.delete(`${this.baseMovieUrl}${id}/`,  {headers: this.headers});
  // }




  // getAuthHeaders() {
  //   const token = this.cookieService.get('mr-token');
  //   return new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     Authorization: `Token ${token}`
  //   });
  // }

  get medicationResults() {
    return this._medication.asObservable().pipe(tap(resData => {
      console.log('medicationResults', resData);
    }));
  }




  fetchMedication(dicParam) {
    
   return  this.httpClient.get<{[Key: string]: MedicationData}>(
      // tslint:disable-next-line: max-line-length
      `${this.searchMedicationUrl}?name__startswith=${dicParam.searchTerm}&number_of_items__lt=${dicParam.number_of_items__lt}
      &number_of_items__gt=${dicParam.number_of_items__gt}&dose__gt=${dicParam.dose__gt}&dose__lt=${dicParam.dose__lt}`
      , {
     headers: {
       'Content-Type': 'application/json',
     }
   }).pipe(map(resultData => {


    const medication = [];
    // tslint:disable-next-line: forin
    for (const key in resultData) {
      if (resultData.hasOwnProperty(key)) {
        this.items.unshift(resultData[key]);
        medication.push(new Medication (
            resultData[key].id,
            resultData[key].user,
            resultData[key].name,
            resultData[key].description,
            resultData[key].dose,
            resultData[key].number_of_items,
            resultData[key].medicationimage_set,
          )
        );
      }
    }
    return medication;
  }),
  tap(resData => {
    
    this._medication.next(resData);

    console.log('_medication', this._medication);
  })
  );

  }



  getMedicationDetail(id) {
    this. headers= new HttpHeaders({
      'Content-Type': 'application/json',
    });
    console.log('this is ', this.headers);
    return this.httpClient.get<MedicationData[]>(`${this.getMedicationDetailUrl}${id}`, {headers: this.headers});
  }

  getRecentMedication() {
    this. headers= new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.httpClient.get<MedicationData[]>(`${this.getRecentMedicationsUrl}`, {headers: this.headers});
  }


  async createProductUpload(data) {
    const value = await localStorage.getItem('authData') ;
    const dic = JSON.parse(value);
    const dicToken = dic.token;
    this.token = dicToken;


    const xhr = new XMLHttpRequest();
    const url = this.createMedicationUrl;
    xhr.open('POST', url, true);
    xhr.setRequestHeader( 'Authorization', 'Token ' + dicToken );
    xhr.withCredentials = true;
    return xhr.send(data);
  }

  getAllOwnersMedication(token) {
    this.headers= new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Token ' + token 
    });
    return this.httpClient.get<MedicationData[]>(`${this.getAllOwnersMedicationUrl}`, {headers: this.headers});
  }

  
  // getAllOwnersMedication(id) {
    
  //   return  this.httpClient.get<{[Key: string]: MedicationData}>(
  //      // tslint:disable-next-line: max-line-length
  //      `${this.this.getAll}`
  //      , {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     }
  //   }).pipe(map(resultData => {
 
 
  //    const medication = [];
  //    // tslint:disable-next-line: forin
  //    for (const key in resultData) {
  //      if (resultData.hasOwnProperty(key)) {
  //        this.items.unshift(resultData[key]);
  //        medication.push(new Medication (
  //            resultData[key].id,
  //            resultData[key].user,
  //            resultData[key].name,
  //            resultData[key].description,
  //            resultData[key].dose,
  //            resultData[key].number_of_items,
  //            resultData[key].medicationimage_set,
  //          )
  //        );
  //      }
  //    }
  //    return medication;
  //  }),
  //  tap(resData => {
     
  //    this._medication.next(resData);
 
  //    console.log('_medication', this._medication);
  //  })
  //  );
 
  //  }


  






}

