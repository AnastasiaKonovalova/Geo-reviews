import './style.scss';

import { Model } from './model';
import { View } from './view';

const model = new Model();
const view = new View();

class Controller {
    constructor (container) {
        this.container = container
    }

    async initialize() {
        await ymaps.ready();
        model.initMap();
    
        model.createClusterer(view.makeInnerLayout('carousel'));
        model.map.geoObjects.add(model.cluster);
    }

    addListenerToMap() {
        model.map.events.add('click', async function (e) {
            if (!this.container.innerHTML) {
                const clickCoords = {
                    X: e.get('domEvent').get('clientX'),
                    Y: e.get('domEvent').get('clientY')
                }
                const coordsOnMap = e.get('coords');
                const myPlacemark = await model.createPlacemark(coordsOnMap);
        
                this.container.innerHTML = view.render('form', this.formObjectForRender(myPlacemark));
                view.placeFormOnScreen(this.container, clickCoords);
    
                myPlacemark.events.add('click', (e) =>{
                    view.deletePositionStyles(this.container);
        
                    const clickCoords = {
                        X: e.get('domEvent').get('pageX'),
                        Y: e.get('domEvent').get('pageY')
                    }
                     
                    model.marker = myPlacemark;
                    this.container.innerHTML = view.render('form', this.formObjectForRender(myPlacemark));
                    view.placeFormOnScreen(this.container, clickCoords);
                })
            }
        }, this);
    }

    addListenerToDocument() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            e.preventDefault();
        
            if ( target.tagName !== 'YMAPS' && target.closest('button') ) {
                const actionBtn = target.closest('button');
        
                if (actionBtn.id === 'closeReview') {
                    this.container.innerHTML = null;
                    view.deletePositionStyles(this.container);
                }
                if (actionBtn.id === 'addReview') {
                    const formCheck = this.checkInputs();
        
                    if (formCheck) {
                        const reviewsContent = document.querySelector('.review__content');
        
                        model.pushReviewToPlacemark(formCheck)
                        reviewsContent.innerHTML = view.render('oldReviews', this.formObjectForRender(model.marker));
                    } else {
                        alert('Нужно заполнить все поля')
                    }
                }
            }
        
            if (target.tagName === 'A') {
                const placemark = model.findPlacemark(item => item.properties.get('myAddress') === target.textContent);
        
                this.container.innerHTML = view.render('form', this.formObjectForRender(placemark)); 
                model.map.balloon.close();
            }
        })
        
    }

    checkInputs() {
        const inputs = [...document.querySelectorAll('input, textarea')];
    
        if ( inputs.every(item => item.value.trim()) ) {
            return inputs
        }
    
        return false
    }
    
    formObjectForRender(placemark) {
        const obj = {
            id: placemark.properties.get('myId'),
            reviewsList: placemark.properties.get('myReviews'),
            address: placemark.properties.get('myAddress'),
            get oldReviews() {
                return this.reviewsList.length > 0
            }
        };
    
        return obj
    }
}

const reviewContainer = document.querySelector('#review-container');
const controller = new Controller(reviewContainer);

async function init() {
    await controller.initialize();
    controller.addListenerToMap();
    controller.addListenerToDocument()
}

init();
