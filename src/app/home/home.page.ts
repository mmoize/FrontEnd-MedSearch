import { MedicationService } from './medication.service';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  onEmptyResults = false;

  private medicationSub: Subscription;

  minDose = 'None';
  maxDose = 'None';


  maxNumberOfItems = 'None';
  minNumberOfItems = 'None';

  searchText = '';
  searching: any = false;
  searchControl: FormControl;
  loadedMedication;

  onfilter = false;
  selectedDose;
  form;

  LoadedRecentMedication;
  aboutToSearch = false;


  searchTerm: string = '';
  number_of_items__lt = 'None';
  number_of_items__gt = 'None';
  dose__lt = 'None';
  dose__gt = 'None';



  constructor(
              private medicationService: MedicationService,
              private routes: Router,
              ) {
                this.searchControl = new FormControl();
                this.onSearch();
                this.loadRecentMedication();
                this.loadedMedication = [];
                
              }
  ngOnInit(){

    
  }




   loadRecentMedication() {
     this.medicationService.getRecentMedication().subscribe(results => {
       this.LoadedRecentMedication = results;
       console.log('Recent Medication', results);
     });
   }           

  onSearchInput(ev) {

    if (ev.target.value.length <= 1) {
      this.aboutToSearch = false;
      this.searching = false;
    } else if (ev.target.value.length > 0) {
      console.log( 'event detail', ev.detail);
      this.aboutToSearch = true;
      this.searching = true;
    }
  }

  async onSearch() {
    

    this.searchControl.valueChanges.pipe(filter(res => res.length > 2),
    debounceTime(700)
    ).subscribe(searchTerm => {
      const dicParam = {};

      dicParam['searchTerm'] = searchTerm;
      dicParam['number_of_items__gt'] = this.maxNumberOfItems;
      dicParam['number_of_items__lt'] = this.minNumberOfItems;
      dicParam['dose__lt'] = this.minDose;
      dicParam['dose__gt'] = this.maxDose;

      this.searchTerm = searchTerm;
      
      this.medicationService.fetchMedication(dicParam).subscribe(resData => {

        if (resData.length >= 0) {
          this.medicationSub = this.medicationService.medicationResults.subscribe(resultsData => {

            if (resultsData.length <=0) {

              this.onEmptyResults = true;

              setTimeout(() => {
                this.onEmptyResults = false;
              }, 5000);

              this.loadedMedication = [];
              console.log('this emp', resultsData);
            }
            this.loadedMedication = resultsData;
            console.log('First Results', resultsData);
            this.searching = false;
           
            setTimeout(() => {
              this.searchText = ''; 
            }, 5000);
          });
        } else {
          this.searching = false;
        }

      });

    });
       

  }

  onDetail(id) {
    this.routes.navigateByUrl(`/home/medication-detail/${id}`);

  }

  openDashBoard() {
    this.routes.navigateByUrl('/dashboard');
  }


  aboutTosearch() {

    if (this.aboutToSearch === true) {
      this.aboutToSearch = false;
      console.log('about to search', this.aboutToSearch);
    } else if (this.aboutToSearch === false) {
      this.aboutToSearch = true;
      console.log('about to search', this.aboutToSearch);
    }

  }


  onDisplayFilters() {
    if (this.onfilter === false) {
      this.onfilter = true;
    } else if (this.onfilter === true){
      this.onfilter = false;
      this.minDose = 'None';
      this.maxDose = 'None';
    
      this.maxNumberOfItems = 'None';
      this.minNumberOfItems = 'None';
    }



  }




}
