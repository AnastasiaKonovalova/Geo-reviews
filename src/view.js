import renderForm from './utilities/review-form.hbs';
import renderOld from './utilities/reviews-old.hbs';

export class View {
    constructor() {
        this.templates = {
            form: renderForm,
            oldReviews: renderOld
        }
        this.layouts = {
            carousel: '<a href="#" class = "baloon__address">{{properties.myAddress}}</a>' +
                        '<ul class = "baloon__reviews-list">' +
                            '{% for review in properties.myReviews %}' +
                            '<li class = "baloon__review-item">' +
                                '<h2 class = "baloon__review-place">{{review.place}}</h2>' +
                                '<div class ="baloon__review-alignment">' +
                                    '<div class = "baloon__review-text">{{review.reviewText}}</div>' +
                                    '<div class = "baloon__review-date">{{review.date}}</div>' +
                                '</div>' +
                            '</li>' +
                            '{% endfor %}' +
                        '</ul>'
        }
    }

    render(renderFnName, placemark) {
        return this.templates[renderFnName](placemark)
    }
    
    placeFormOnScreen(container, coords) {
        const containerStyle = getComputedStyle(container);
        const containerSize = {
            width: parseInt(containerStyle.width),
            height: parseInt(containerStyle.height)
        };
        const documentSize = {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        }

        if ( (containerSize.width + coords.X) > documentSize.width && 
        (containerSize.height + coords.Y) > documentSize.height ) {
            container.style.right = '0px';
            container.style.bottom = '0px';

        } else if ( (containerSize.width + coords.X) > documentSize.width ) {
            container.style.right = '0px';
            container.style.top = coords.Y + 'px'

        } else if ( (containerSize.height + coords.Y) > documentSize.height ) {
            container.style.bottom = '0px';
            container.style.left = coords.X + 'px'

        } else {
            container.style.top = coords.Y + 'px';
            container.style.left = coords.X + 'px'
        }
    }

    makeInnerLayout(type) {
        const innerLayout = ymaps.templateLayoutFactory.createClass(this.layouts[type]);

        return innerLayout;
    }

    deletePositionStyles (container) {
        container.style.top = '';
        container.style.right = '';
        container.style.bottom = '';
        container.style.left = '';
    }
}