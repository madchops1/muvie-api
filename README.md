# Muvie / Visualz Website

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.6.

## Note
This is a Heroku project

## Angular Site Development server

Run `ng serve -o` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.



## Node API

Run `node server.js` on port 8080.

This will also run the angular app on 8080 from the dist dir.

### Twilio 

Twilio requires that the localhost port be exposed in order to send messages locally. For that we use ngrok.

Run `ngrok http 8080` and use the url in the webhook for the number in the twilio console.

# Angular Cli Stuff...

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
