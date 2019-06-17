import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Seriously from '../../assets/Seriously.js-master/seriously.js';
import Vingette from '../../assets/Seriously.js-master/effects/seriously.vignette.js';
import Blend from '../../assets/Seriously.js-master/effects/seriously.blend.js';
import DirectionBlur from '../../assets/Seriously.js-master/effects/seriously.directionblur.js';
import CameraShake from '../../assets/Seriously.js-master/transforms/seriously.camerashake.js';
import TvGlitch from '../../assets/Seriously.js-master/effects/seriously.tvglitch.js';
import { ProjectService } from '../project.service';

@Component({
    selector: 'app-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
    @ViewChild('vid') vide: ElementRef;

    constructor(private projectService: ProjectService) { }

    opened: boolean;
    seriously: any;
    target: any;
    vid: any;
    video: any;

    shake: any;
    reformat: any;
    recenter: any;
    vignette: any;
    blend: any;
    moblur: any;
    glitch: any;

    ngOnInit() {
        console.log('vid', this.projectService.video);
        //this.video = this.projectService.video;
        //if (!this.projectService.video) {
        //    this.video = "/assets/watermark_audio_final_merged_SampleVideo_1280x720_5mb.mp4_1.mp4";
        //} else {
        //this.video = this.projectService.video;
        this.video = "/watermark_audio_final_merged_SampleVideo_1280x720_5mb.mp4_1.mp4";

        //}
        setTimeout(() => {
            this.initSeriously();
        }, 2000);
    }


    initSeriously(): any {
        this.seriously = new Seriously({ plugins: [Vingette, Blend, DirectionBlur, CameraShake, TvGlitch] });
        //this.blend = this.seriously.effect('blend');
        //this.moblur = this.seriously.effect('directionblur');
        //this.shake = this.seriously.transform('camerashake');

        //this.vid = this.seriously.source('#vid');

        //this.target = this.seriously.target('#canvas');


        //this.target.source = this.vid;
        //this.target.render();
        //this.seriously.go(function (now) {

        //let minutes;
        //minutes = now/60000;
        //console.log('now', now, minutes);
        //});

        this.target = this.seriously.target('#canvas');
        this.reformat = this.seriously.transform('reformat');
        this.recenter = this.seriously.transform('2d');

        // connect all our nodes in the right order
        this.reformat.source = '#vid';
        this.reformat.width = 640;
        this.reformat.height = 360;
        this.reformat.mode = 'cover';

        this.recenter.source = this.reformat;
        this.recenter.translateY = 0;



        this.glitch = this.seriously.effect('tvglitch');
        this.glitch.verticalSync = '#verticalSync';
        this.glitch.distortion = '#distortion';
        this.glitch.source = this.recenter;
        //timedEffects.push(glitch);

        /*
        this.shake = this.seriously.transform('camerashake');
        this.shake.source = this.glitch;
        this.shake.amplitudeX = '#amplitudeX';
        this.shake.amplitudeY = '#amplitudeY';
        this.shake.frequency = '#frequency';
        this.shake.rotation = '#rotation';
        this.shake.autoScale = '#autoScale';
        this.shake.preScale = '#preScale';
        */

        this.target.source = this.glitch;

        //render
        this.target.render();
        this.seriously.go((now) => {
            this.glitch.time = now / 1000;

        });
    }

}
