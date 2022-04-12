import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-collaborators',
  templateUrl: './collaborators.component.html',
  styleUrls: ['./collaborators.component.scss']
})
export class CollaboratorsComponent implements OnInit {



  collaborators: any = [
    {
        name: 'Cheezehouse Rekords',
        image: '../../assets/images/collaborators/cheezehouserekords.png',
        link: 'http://cheezehouserekords.com/'
    },
    {
        name: 'MTM',
        image: '../../assets/images/collaborators/mtm.png',
        link: 'https://www.instagram.com/morethanmusic.chi/'
    },
    {
        name: 'Harvest Fest',
        image: '../../assets/images/collaborators/harvestfest.png',
        link: 'https://www.facebook.com/events/477580393466718'
    },
    {
        name: 'Harmonic Destinations',
        image: '../../assets/images/collaborators/harmonicdestinations.png',
        link: ''
    },
    {
        name: 'Sleds And Kegs',
        image: '../../assets/images/collaborators/sledsandkegs.png',
        link: 'https://www.sledsandkegs.com/'
    },
    {
        name: 'Estetic Productions',
        image: '../../assets/images/collaborators/esteticproductions.png',
        link: 'https://www.instagram.com/esteticproductions/'
    },
    {
        name: 'Opendoors LA',
        image: '../../assets/images/collaborators/opendoors.png',
        link: 'https://opendoors.la/'
    },
    {
        name: 'Kaizen Club',
        image: '../../assets/images/collaborators/kaizen.png',
        link: 'https://www.youtube.com/channel/UCk7yZcoQFKGUWnyvF219LLw'
    },
    {
        name: 'JNKTN.tv',
        image: '../../assets/images/collaborators/jnktntv.png',
        link: 'https://www.jnktn.tv/'
    },
    {
        name: 'Beat Lab',
        type: 'HOUSE + TECHNO DJs',
        location: 'Live Stream',
        image: '../../assets/images/collaborators/beatlab.png',
        link: 'https://m.twitch.tv/beatlabchicago'
    },
    {
        name: 'Honey Dutch',
        image: '../../assets/images/collaborators/honeydutch.png',
        link: 'https://www.instagram.com/honeydutchbrand/'
    },
    {
        name: 'Wynwood',
        image: '../../assets/images/collaborators/wynwood.png',
        link: 'https://wynwoodchicago.com/'
    },
    {
        name: 'Virgin Hotels',
        image: '../../assets/images/collaborators/virginhotels.png',
        link: 'https://virginhotels.com/'
    },
    {
        name: 'Debonair',
        image: '../../assets/images/collaborators/debonair.png',
        link: 'https://www.debonairsocialclub.com/'
    },
    {
        name: 'Ferocious Events',
        image: '../../assets/images/collaborators/ferociousevents.png',
        link: 'https://www.instagram.com/ferocious_events/'
    },
    {
        name: 'Only The Beat',
        type: 'EVENTS',
        location: 'Chicago',
        image: '../../assets/images/collaborators/onlythebeat.png',
        link: 'https://onlythebeat.com/'
    },
    {
        name: 'DarkHeavenCO',
        type: 'EVENTS',
        location: 'Chicago',
        image: '../../assets/images/collaborators/darkheavenco.png',
        link: 'https://www.instagram.com/darkheavenco/'
    },
    {
        name: 'BrickLive',
        type: 'EVENTS',
        location: 'Chicago',
        image: '../../assets/images/collaborators/bricklive.png',
        link: 'https://www.bricklivegroup.com/'
    },
    {
        name: 'Midwest Watts',
        type: 'EVENTS',
        location: 'Chicago',
        image: '../../assets/images/collaborators/midwestwatts.png',
        link: 'https://www.instagram.com/midwest_watts/'
    },
    {
        name: 'LGI Entertainment',
        type: 'EVENTS',
        location: 'Chicago',
        image: '../../assets/images/collaborators/lgi.png',
        link: 'https://www.instagram.com/lgi_entertainment710/'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
