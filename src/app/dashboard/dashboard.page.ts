import { AuthService } from './../auth/auth.service';
import { Router } from '@angular/router';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/core';
import { ActionSheetController, LoadingController, Platform } from '@ionic/angular';
import { SegmentChangeEventDetail } from '@ionic/core';
import { MedicationService } from '../home/medication.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef;
  ClickedProdImage = false;
  form: FormGroup;
  segmentValue;

  NewMedicationSeg = false;
  CurrentMedicationSeg = false;
  mostViewedSeg = false;

  selectedImage = [];
  theSelectedImage = [];
  formPhotoList = [];
  addedImage;

  loadedMedication;
  productPhotoCount;


  slideOpts = {
    slidesPerView: 3,
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    on: {
      beforeInit() {
        const swiper = this;

        swiper.classNames.push(`${swiper.params.containerModifierClass}coverflow`);
        swiper.classNames.push(`${swiper.params.containerModifierClass}3d`);

        swiper.params.watchSlidesProgress = true;
        swiper.originalParams.watchSlidesProgress = true;
      },
      setTranslate() {
        const swiper = this;
        const {
          width: swiperWidth, height: swiperHeight, slides, $wrapperEl, slidesSizesGrid, $
        } = swiper;
        const params = swiper.params.coverflowEffect;
        const isHorizontal = swiper.isHorizontal();
        const transform$$1 = swiper.translate;
        const center = isHorizontal ? -transform$$1 + (swiperWidth / 2) : -transform$$1 + (swiperHeight / 2);
        const rotate = isHorizontal ? params.rotate : -params.rotate;
        const translate = params.depth;
        // Each slide offset from center
        for (let i = 0, length = slides.length; i < length; i += 1) {
          const $slideEl = slides.eq(i);
          const slideSize = slidesSizesGrid[i];
          const slideOffset = $slideEl[0].swiperSlideOffset;
          const offsetMultiplier = ((center - slideOffset - (slideSize / 2)) / slideSize) * params.modifier;

          let rotateY = isHorizontal ? rotate * offsetMultiplier : 0;
          let rotateX = isHorizontal ? 0 : rotate * offsetMultiplier;
          // var rotateZ = 0
          let translateZ = -translate * Math.abs(offsetMultiplier);

          let translateY = isHorizontal ? 0 : params.stretch * (offsetMultiplier);
          let translateX = isHorizontal ? params.stretch * (offsetMultiplier) : 0;

           // Fix for ultra small values
          if (Math.abs(translateX) < 0.001) { translateX = 0; }
          if (Math.abs(translateY) < 0.001) { translateY = 0; }
          if (Math.abs(translateZ) < 0.001) { translateZ = 0; }
          if (Math.abs(rotateY) < 0.001) { rotateY = 0; }
          if (Math.abs(rotateX) < 0.001) { rotateX = 0; }

          // tslint:disable-next-line: max-line-length
          const slideTransform = `translate3d(${translateX}px,${translateY}px,${translateZ}px)  rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

          $slideEl.transform(slideTransform);
          $slideEl[0].style.zIndex = -Math.abs(Math.round(offsetMultiplier)) + 1;
          if (params.slideShadows) {
            // Set shadows
            // tslint:disable-next-line: max-line-length
            let $shadowBeforeEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-left') : $slideEl.find('.swiper-slide-shadow-top');
            // tslint:disable-next-line: max-line-length
            let $shadowAfterEl = isHorizontal ? $slideEl.find('.swiper-slide-shadow-right') : $slideEl.find('.swiper-slide-shadow-bottom');
            if ($shadowBeforeEl.length === 0) {
              $shadowBeforeEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'left' : 'top'}"></div>`);
              $slideEl.append($shadowBeforeEl);
            }
            if ($shadowAfterEl.length === 0) {
              $shadowAfterEl = swiper.$(`<div class="swiper-slide-shadow-${isHorizontal ? 'right' : 'bottom'}"></div>`);
              $slideEl.append($shadowAfterEl);
            }
            if ($shadowBeforeEl.length) { $shadowBeforeEl[0].style.opacity = offsetMultiplier > 0 ? offsetMultiplier : 0; }
            if ($shadowAfterEl.length) { $shadowAfterEl[0].style.opacity = (-offsetMultiplier) > 0 ? -offsetMultiplier : 0; }
          }
        }

         // Set correct perspective for IE10
        if (swiper.support.pointerEvents || swiper.support.prefixedPointerEvents) {
          const ws = $wrapperEl[0].style;
          ws.perspectiveOrigin = `${center}px 50%`;
        }
      },
      setTransition(duration) {
        const swiper = this;
        swiper.slides
          .transition(duration)
          .find('.swiper-slide-shadow-top, .swiper-slide-shadow-right, .swiper-slide-shadow-bottom, .swiper-slide-shadow-left')
          .transition(duration);
      }
    }
  };




  constructor(
    private sanitizer: DomSanitizer ,
    private plt: Platform,
    private loadingCtrl: LoadingController,
    private medicationService: MedicationService,
    private actionSheetCtrl: ActionSheetController,
    private routes: Router,
    private authservice: AuthService
              ) { 

              }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),
      dose: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(150)]
      }),
      number_of_items: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.min(1)]
      }),
      slug: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(150)]
      }),
      description: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      }),

    });
    this.loadMedication();
  }


  async loadMedication() {
    const value = await localStorage.getItem('authData') ;
    const dic = JSON.parse(value);
    const dicToken = dic.token;


    this.medicationService.getAllOwnersMedication(dicToken).subscribe(results => {
      this.loadedMedication = results;
      console.log('Recent Medication', results);
    });
  } 


  segmentChanged(event: CustomEvent<SegmentChangeEventDetail>) {
    console.log('Segment changed', event);
    if (event.detail.value === 'newMedication') {
      this.segmentValue = 'newMedication';
      this.NewMedicationSeg = true;
      this.CurrentMedicationSeg = false;
      this.mostViewedSeg = false;
    
    }  else if (event.detail.value === 'currentMedication') {
      this.segmentValue ='currentMedication';
      this.CurrentMedicationSeg = true;
      this.NewMedicationSeg = false;
      this.mostViewedSeg = false;
    } else if (event.detail.value === 'mostViewed') {
      this.segmentValue ='mostViewed';
      this.CurrentMedicationSeg = false;
      this.NewMedicationSeg  = false;
      this.mostViewedSeg = true;
    }

  }

  async SelectImageSource() {
    const buttons = [
     {
      text: 'Take Photo',
      icon: 'camera',
      handler: () => {
        this.addImage(CameraSource.Camera);
      },
    },
    {
      text: 'Choose From Photos Photo',
      icon: 'image',
      handler: () => {
        this.addImage(CameraSource.Photos);
      }
    }
    ];

    if (!this.plt.is('hybrid')) {
      buttons.push({
        text: 'Choose a File',
        icon: 'attach',
        handler: () => {
          this.fileInput.nativeElement.click();

        }
      });
    }

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons
    });
    await actionSheet.present();

  }


  async addImage(source: CameraSource) {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Prompt,
    }).then(image => {

      let imageData;
      let imageFormat;
      const blobData = this.getBlob(image.base64String);
      const blobDatas = this.b64toBlob(image.base64String, `image/${image.format}`);
      console.log('this is your image', blobData);
      const imageName = 'Give me a name';
      imageData = blobDatas;
      imageFormat = image.format;
      const urlCreator = window.URL || window.webkitURL;
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urlCreator.createObjectURL(blobDatas));
      

      function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
      }
      console.log('my id', getRandomArbitrary(1,20));
      
      const ranId = getRandomArbitrary(1,20);
      const prevImage = {};
      const uploadImage = {};
      prevImage['id'] = ranId;
      prevImage['image'] = safeUrl;
      prevImage['format'] = imageFormat;

      // prevImagex['image'] = urlCreator.createObjectURL(blobData);
     
      uploadImage['image'] = blobDatas;
      uploadImage['format'] = imageFormat;
      uploadImage['id'] = ranId;

      this.selectedImage.push(prevImage);
      this.theSelectedImage.push(uploadImage);
      this.formPhotoList.push(prevImage);
      console.log('this is formlist', this.selectedImage);

      if (this.selectedImage) {
        const count = Object.keys(this.selectedImage).length;
        this.productPhotoCount = count;
      }

      this.addedImage = true;

    });
  }


  getBlob(b64Data) {
    const contentType = '';
    const  sliceSize = 512;

    b64Data = b64Data.replace(/data\:image\/(jpeg|jpg|png)\;base64\,/gi, '');

    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  b64toBlob(b64Data, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }


  openHome() {
    this.routes.navigateByUrl(`/home`);
  }



  onClickProdImage() {
    if (this.ClickedProdImage) {
      this.ClickedProdImage = false;
    } else {
      this.ClickedProdImage = true;
    }
  }

  onDelete(id) {

    let b = this.theSelectedImage.filter(b => b.id !== id);

    this.theSelectedImage = b;

    let c = this.selectedImage.filter(b => b.id !== id);

    this.selectedImage = c;

    if (this.selectedImage) {
      const count = Object.keys(this.selectedImage).length;
      this.productPhotoCount = count;

    } else {
      this.addedImage = false;
      const count = Object.keys(this.selectedImage).length;
      this.productPhotoCount = count;
    }

    return console.log('this axax', this.selectedImage);

  }


  createProduct() {
    this.loadingCtrl.create({keyboardClose:true, message: 'Uploading Medication'})
    .then(loadingEl => {
      loadingEl.present();
      const data = new FormData();
      for (const key in this.theSelectedImage) {
        if (this.theSelectedImage.hasOwnProperty(key)) {
         console.log('this is ur images',  this.theSelectedImage[key].image);
         data.append('image', this.theSelectedImage[key].image, `product.${this.theSelectedImage[key].format}` );
        }
      }

      data.append('name', this.form.value.name);
      data.append('dose', this.form.value.dose);
      data.append('number_of_items', this.form.value.number_of_items);
      data.append('description', this.form.value.description);


      this.medicationService.createProductUpload(data); 
      setTimeout(() => {
        this.loadMedication();
        this.NewMedicationSeg = false;
        this.segmentValue = undefined;
      }, 2000); 

      setTimeout(() => {
        loadingEl.dismiss();
        this.CurrentMedicationSeg = true;
        this.segmentValue = 'currentMedication';
      }, 4000); 

    });

  }



  onLogout() {
    this.authservice.logout();
    this.routes.navigateByUrl(`/home`);
  }




}
