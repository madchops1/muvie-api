import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Seriously from '../../assets/Seriously.js-master/seriously.js';
import Vingette from '../../assets/Seriously.js-master/effects/seriously.vignette.js';
import Blend from '../../assets/Seriously.js-master/effects/seriously.blend.js';
import DirectionBlur from '../../assets/Seriously.js-master/effects/seriously.directionblur.js';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  @ViewChild('vid1') vid1e: ElementRef;
  @ViewChild('vid2') vid2e: ElementRef;

  constructor(
   
  ) { }

  seriously: any;
  //colorbars: any;
  target: any;
  //vignette: any;
  blend: any;
  moblur: any;
  vid1: any;
  vid2: any;
  reformatVid1: any;
  reformatVid2: any;
  transformVid1: any;
  transformVid2: any;
  progress: any = 0;
  i: any = 0;
  j: any = 1;
  sources: any;
  lastDraw: any;
  maxSize: any = 0;
  videoSeconds: any = 1;

  ngOnInit() {
    
    
    console.log('vid1', this.vid1e.nativeElement.readyState);
    console.log('vid2', this.vid2e.nativeElement.readyState);

    this.initSeriously();
    /*this.vid1 = this.seriously.source('#testvid');
    this.vignette = this.seriously.effect('vignette');
    
    this.vignette.amount = 10;
    this.vignette.source = this.colorbars;
    this.target.source = this.vignette;
    this.seriously.go();*/
  }

  initSeriously(): any {
    this.seriously = new Seriously({plugins: [Vingette, Blend, DirectionBlur]});
    this.blend = this.seriously.effect('blend');
    this.moblur = this.seriously.effect('directionblur');
    this.vid1 = this.seriously.source('#testvid');
    this.vid2 = this.seriously.source('#testvid2');
    
    this.target = this.seriously.target('#canvas');

    this.reformatVid1 = this.seriously.transform('reformat');
    this.reformatVid2 = this.seriously.transform('reformat');

    this.transformVid1 = this.seriously.transform();
    this.transformVid2 = this.seriously.transform();

    this.sources = [
      this.transformVid1,
      this.transformVid2
    ];

    this.reformatVid1.source = this.vid1;
    this.reformatVid2.source = this.vid2;

    this.transformVid1.source = this.reformatVid1;
    this.transformVid2.source = this.reformatVid2;

    this.reformatVid1.width = 960;
    this.reformatVid1.height = 540;
    this.reformatVid1.mode = 'cover';

    this.reformatVid2.width = 960;
    this.reformatVid2.height = 540;
    this.reformatVid2.mode = 'cover';

    this.blend.top = this.transformVid1;
    this.blend.bottom = this.transformVid2;
    this.moblur.source = this.blend;
    this.target.source = this.reformatVid1;
    this.target.render();
    this.seriously.go(function(now) {
      
      //let minutes;
      //minutes = now/60000;
      //console.log('now', now, minutes);
    });
  }

  easeInOut(t): any {
    if (t < 0.5) {
      return 0.5 * Math.pow(t * 2, 2);
    }
    return -0.5 * (Math.pow(Math.abs(t * 2 - 2), 2) - 2);
  }

  draw(): any {
    console.log('draw', this);
    let a = this.sources[this.i],
        b = this.sources[this.j],
        amount;

    this.progress -= (Date.now() - this.lastDraw) / 2000;
    this.progress = Math.max(0, this.progress);

    if (this.progress) {
      amount = this.easeInOut(this.progress);
      a.translateX = 960 * amount;
      b.translateX = -960 * (1 - amount);
      this.moblur.amount = 4 - Math.abs(amount - 0.5) * 8;
      this.target.source = this.moblur;
      requestAnimationFrame(this.draw);
    } else {
      a.reset();
      b.reset();
      this.target.source = a;
    }
    this.target.render();
  }

  public whipit(): any {
    console.log('whipit()');
    this.i = (this.i + 1) % 2;
    this.j = (this.i + 1) % 2;
    this.progress = 1;
    this.lastDraw = Date.now();
    this.draw();
  }

}
