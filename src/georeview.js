import './style.scss';

import { Model } from './model';
import { View } from './view';

const ymaps = window.ymaps;
const model = new Model();
const view = new View();

class Controller {
    constructor (container) {
        this.container = container;
    }

    async initialize() {
        await ymaps.ready();
        model.initMap();
    
        model.createClusterer(view.makeInnerLayout('carousel'));
        model.map.geoObjects.add(model.cluster);
        if (localStorage.placemarks) {
            model.storage = JSON.parse(localStorage.placemarks);
            this.parsePlacemarks()
        }
    }

    addListenerToMap() {
        model.map.events.add('click', async function (e) {
            if (!this.container.innerHTML) {
                const clickCoords = {
                    X: e.get('domEvent').get('clientX'),
                    Y: e.get('domEvent').get('clientY')
                }
                const coordsOnMap = e.get('coords');
                const myPlacemark = await model.createPlacemarkByCoordinates(coordsOnMap);
        
                this.container.innerHTML = view.render('form', this.formObjectForRender(myPlacemark));
                view.placeFormOnScreen(this.container, clickCoords);

                this.addListenerToPlacemark(myPlacemark);
            }
        }, this);
    }

    addListenerToPlacemark(placemark) {
        placemark.events.add('click', (e) =>{
            view.deletePositionStyles(this.container);

            const clickCoords = {
                X: e.get('domEvent').get('clientX'),
                Y: e.get('domEvent').get('clientY')
            }
             
            model.marker = placemark;
            this.container.innerHTML = view.render('form', this.formObjectForRender(placemark));
            view.placeFormOnScreen(this.container, clickCoords);
        }, this)
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
        
                        model.pushReviewToPlacemark(formCheck);
                        reviewsContent.innerHTML = view.render('oldReviews', this.formObjectForRender(model.marker));
                        this.manageLocalStorage(model.marker);

                    } else {
                        alert('Нужно заполнить все поля');
                    }
                }
                if (actionBtn.id === 'clearLocalStorage') {
                    localStorage.clear();
                    model.clearInfo();
                }
            }
        
            if (target.tagName === 'A') {
                const placemark = model.findPlacemark(item =>
                    item.properties.get('myAddress') === target.textContent);
        
                this.container.innerHTML = view.render('form', this.formObjectForRender(placemark)); 
                model.map.balloon.close();
            }
        })
        
    }

    makeDnD(container) {
        let moveAt;

        container.addEventListener('mousedown', e => {
            const elementBox = container.getBoundingClientRect();
            const shift = {
                X: e.clientX - elementBox.left,
                Y: e.clientY - elementBox.top
            };

            moveAt = e => {
                container.style.left = e.clientX - shift.X + 'px';
                container.style.top = e.clientY - shift.Y + 'px'
            }
            moveAt(e)

            document.addEventListener('mousemove', moveAt);

            container.addEventListener('mouseup', function stopDnD() {
                document.removeEventListener('mousemove', moveAt);
                container.removeEventListener('mouseup', stopDnD)
            });    
        });

        container.addEventListener('dragstart', function() {
            return false;
        });
    }

    manageLocalStorage(placemark) {
        const placemarkObj = this.formObjectForRender(placemark);
        const placemarkIndex = model.storage.findIndex( item =>
            item.coords === placemark.properties.get('myCoords') )

        if (placemarkIndex >= 0) {
            model.storage[placemarkIndex] = placemarkObj
        } else {
            model.storage.push(placemarkObj);
        }
        localStorage.placemarks = JSON.stringify(model.storage);
    }

    parsePlacemarks() {
        model.storage.forEach(item => {
            const placemark = model.createPlacemarkFromLocalStorage(item.coords, item);

            this.addListenerToPlacemark(placemark)
        })
    }

    checkInputs() {
        const inputs = [...this.container.querySelectorAll('input, textarea')];
    
        if ( inputs.every(item => item.value.trim()) ) {
            return inputs
        }
    
        return false
    }

    formObjectForRender(placemark) {
        const obj = {
            coords: placemark.properties.get('myCoords'),
            id: placemark.properties.get('myId'),
            address: placemark.properties.get('myAddress'),
            reviewsList: placemark.properties.get('myReviews'),
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
    controller.makeDnD(controller.container)
}

init();
