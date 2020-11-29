import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { MedicationService } from '../medication.service';


@Component({
  selector: 'app-medication-detail',
  templateUrl: './medication-detail.page.html',
  styleUrls: ['./medication-detail.page.scss'],
})
export class MedicationDetailPage implements OnInit {

  loadedMedication;
  loadMedicationSub;

  slideOpts = {
    on: {
      beforeInit() {
        const swiper = this;
        swiper.classNames.push(`${swiper.params.containerModifierClass}fade`);
        const overwriteParams = {
          slidesPerView: 1,
          slidesPerColumn: 1,
          slidesPerGroup: 1,
          watchSlidesProgress: true,
          spaceBetween: 0,
          virtualTranslate: true,
        };
        swiper.params = Object.assign(swiper.params, overwriteParams);
        swiper.params = Object.assign(swiper.originalParams, overwriteParams);
      },
      setTranslate() {
        const swiper = this;
        const { slides } = swiper;
        for (let i = 0; i < slides.length; i += 1) {
          const $slideEl = swiper.slides.eq(i);
          const offset$$1 = $slideEl[0].swiperSlideOffset;
          let tx = -offset$$1;
          if (!swiper.params.virtualTranslate) { tx -= swiper.translate; }
          let ty = 0;
          if (!swiper.isHorizontal()) {
            ty = tx;
            tx = 0;
          }
          const slideOpacity = swiper.params.fadeEffect.crossFade
            ? Math.max(1 - Math.abs($slideEl[0].progress), 0)
            : 1 + Math.min(Math.max($slideEl[0].progress, -1), 0);
          $slideEl
            .css({
              opacity: slideOpacity,
            })
            .transform(`translate3d(${tx}px, ${ty}px, 0px)`);
        }
      },
      setTransition(duration) {
        const swiper = this;
        const { slides, $wrapperEl } = swiper;
        slides.transition(duration);
        if (swiper.params.virtualTranslate && duration !== 0) {
          let eventTriggered = false;
          slides.transitionEnd(() => {
            if (eventTriggered) { return; }
            if (!swiper || swiper.destroyed) { return; }
            eventTriggered = true;
            swiper.animating = false;
            const triggerEvents = ['webkitTransitionEnd', 'transitionend'];
            // tslint:disable-next-line: prefer-for-of
            for (let i = 0; i < triggerEvents.length; i += 1) {
              $wrapperEl.trigger(triggerEvents[i]);
            }
          });
        }
      },
    }
  };


  constructor(
        private medicationService: MedicationService,
        private routes: Router,
        private route: ActivatedRoute,
        private navCtrl: NavController,
        private alertCtrl: AlertController
      ) {
      
      }

  ngOnInit() {
    let medication_id;
    this.route.paramMap.subscribe(async paramMap => {
      medication_id = paramMap.get('medicationid');

      if (!paramMap.has('medicationid')) {
        this.navCtrl.navigateBack('/home');
        return;
      }

      this.loadMedicationSub = ( this.medicationService.getMedicationDetail(paramMap.get('medicationid'))).subscribe(medicationDetail => {
        this.loadedMedication = medicationDetail;
        
        console.log('this is postDetail', medicationDetail);
        
      }

      
      , error => {
        this.alertCtrl.create({
              header: 'An error occurred '  ,
              message: 'Could not load post',
              buttons: [{text: 'Okay', handler: () => {
                this.navCtrl.navigateBack('/home');
              }
            }]
          }).then(alertEl => alertEl.present());
      }
      );
    });
  }

  ionViewWillEnter(){
   
  }

}
