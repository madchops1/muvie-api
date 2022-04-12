import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-musicians',
  templateUrl: './musicians.component.html',
  styleUrls: ['./musicians.component.scss']
})
export class MusiciansComponent implements OnInit {


  musicians: any = [
    // {
    //     name: 'Beat Lab',
    //     type: 'HOUSE + TECHNO DJs',
    //     location: 'Live Stream',
    //     image: '../../assets/images/beatlab1.png',
    //     link: 'https://m.twitch.tv/beatlabchicago'
    // },
    {
        name: 'Alan Ray',
        type: 'DJ',
        location: '-',
        image: '../../assets/images/musicians/alanray.png',
        link: 'https://www.instagram.com/djalanray/'
    },
    {
        name: 'Andrea Grace',
        type: 'DJ',
        location: 'USA, Buenos Aires',
        image: '../../assets/images/musicians/andreagrace.png',
        link: 'https://www.instagram.com/djandreagrace/'
    },
    {
        name: 'Avacado',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/avacado.png',
        link: 'https://www.instagram.com/eroax/'
    },
    {
        name: '_bobbymack_',
        type: 'MUSIC ARTIST',
        location: '-',
        image: '../../assets/images/musicians/bobbymack.png',
        link: 'https://www.instagram.com/_bobbymack_/'
    },
    {
        name: 'BWOK',
        type: 'DJ',
        location: 'USA',
        image: '../../assets/images/musicians/bwok.png',
        link: 'https://www.instagram.com/djalanbwok/'
    },
    {
        name: 'Danny Zeidan',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/dannyzeidan.png',
        link: 'https://www.instagram.com/dannyzeidan_music/'
    },
    {
        name: 'D3SIGNER.DR3AMS',
        type: 'HIP HOP + RAP',
        location: '-',
        image: '../../assets/images/musicians/d3signerdr3ams.png',
        link: 'https://www.instagram.com/d3signer.dr3ams/'
    },
    {
        name: 'Desadeca',
        type: 'DJ',
        location: 'USA',
        image: '../../assets/images/musicians/mckinzy.jpg',
        link: 'https://www.facebook.com/djdesadeca/'
    },
    {
        name: 'Father Bear',
        type: 'DJ/Musician',
        location: 'USA',
        image: '../../assets/images/musicians/fatherbear.png',
        link: 'www.fatherbear.club'
    },
    {
        name: 'dj_psoriasis',
        type: 'Artist',
        location: '-',
        image: '../../assets/images/musicians/psoriasis.jpg',
        link: 'https://www.instagram.com/dj_psoriasis/'
    },
    {
        name: 'friendkerrek',
        type: 'ARTIST',
        location: '-',
        image: '../../assets/images/musicians/friendkerrek.jpg',
        link: 'https://www.instagram.com/friendkerrek/'
    },
    {
        name: 'Gogg Doppia G',
        type: 'Dj/Beatmaker',
        location: 'Italy',
        image: '../../assets/images/musicians/gogg.jpg',
        link: 'https://www.instagram.com/gogg_doppia_g/'
    },
    {
        name: 'Helang',
        type: 'Dj',
        location: 'Chicago',
        image: '../../assets/images/musicians/helang.png',
        link: 'https://www.instagram.com/helangmusic/'
    },
    {
        name: 'James Chesney',
        type: 'Dj/Producer',
        location: 'Totterdown, Bristol',
        image: '../../assets/images/musicians/jameschesney.png',
        link: 'https://www.instagram.com/gogg_doppia_g/'
    },
    {
        name: 'Johnny Nonstop',
        type: 'DJ',
        location: 'Chicago',
        image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/johnnynonstop.jpg',
        link: 'https://www.facebook.com/johnnynonstop/'
    },
    {
        name: 'Mike Larry Draw',
        type: 'MUSIC ARTIST',
        location: 'New York',
        image: '../../assets/images/musicians/mikelarry.jpg',
        link: 'https://www.mikelarrydraw.me/work'
    },
    {
        name: 'Mark Wolff',
        type: 'DJ',
        location: 'Chicago',
        image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/markwolff.jpg',
        link: 'https://soundcloud.com/markwolffmusic/'
    },
    {
        name: 'Martini',
        type: 'Musician',
        location: 'USA',
        image: '../../assets/images/musicians/martini.png',
        link: 'https://www.instagram.com/martinitml/'
    },
    {
        name: 'Metic Music',
        type: 'PRODUCER',
        location: '-',
        image: '../../assets/images/musicians/metic.png',
        link: 'https://www.instagram.com/meticmusic/'
    },
    {
        name: 'Nick Quicktactstic',
        type: 'DJ',
        location: 'Chicago',
        image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/nickmccoord.jpg',
        link: 'https://www.djquicktastic.com/'
    },
    {
        name: 'Partyfingerzz',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/partyfingerzz.png',
        link: 'https://www.instagram.com/partyfingerzz/'
    },
    {
        name: 'PJHASBEATS',
        type: 'MUSIC ARTIST',
        location: 'Seattle',
        image: '../../assets/images/musicians/pjhasbeats.png',
        link: 'https://www.instagram.com/pjhasbeats/'
    },
    {
        name: 'PROV',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/prov.png',
        link: 'https://www.instagram.com/provsounds/'
    },
    {
        name: 'Sam White',
        type: 'USA',
        location: 'Chicago',
        image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/samwhite.jpg',
        link: 'https://samwhitemusic.com/'
    },
    {
        name: 'Slippin Jimmy',
        type: 'USA',
        location: 'Indiana',
        image: '../../assets/images/musicians/evan.jpg',
        link: 'https://www.facebook.com/SlippinJimmysHouse/'
    },
    {
        name: 'seanplaynice',
        type: 'ARTIST',
        location: '-',
        image: '../../assets/images/musicians/playnice.jpg',
        link: 'https://www.instagram.com/seanplaynice/'
    },
    {
        name: 'SHAM',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/sham.png',
        link: 'https://www.instagram.com/shamxmusic/'
    },
    {
        name: 'SPEIG',
        type: 'DJ',
        location: '-',
        image: '../../assets/images/musicians/speig.jpg',
        link: 'https://www.instagram.com/therealspeig/'
    },
    //,
    // {
    //     name: 'Tanza',
    //     type: 'DJ',
    //     location: 'Indiana',
    //     image: 'https://visualz-1.s3.us-east-2.amazonaws.com/default-images/tesh.jpg',
    //     link: 'https://www.facebook.com/SlippinJimmysHouse/'
    // },
    {
        name: 'Tom Sola',
        type: 'DJ/Producer',
        location: 'USA',
        image: '../../assets/images/musicians/tomsola.png',
        link: 'https://www.instagram.com/sola_tribe_music/'
    },
    {
        name: 'Warren',
        type: 'Music Artist',
        location: 'USA',
        image: '../../assets/images/musicians/warren.png',
        link: 'https://www.instagram.com/warrenplay/'
    },
    {
        name: 'Yello Jello',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/yellojello.png',
        link: 'https://www.instagram.com/yello__jello/'
    },
    {
        name: 'Zack Joseph',
        type: 'DJ',
        location: 'Chicago',
        image: '../../assets/images/musicians/zackjoseph.jpeg',
        link: 'https://www.facebook.com/zj2870'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

  

}
