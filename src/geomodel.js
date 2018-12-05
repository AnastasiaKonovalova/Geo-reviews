export class Model {    
    constructor() {
        this.map = null;
        this.cluster = null;
        this.marker = null
    }
    
    initMap() {
        const myMap = new ymaps.Map('map', {
            center: [55.76, 37.64],
            zoom: 15,
            controls: []
        });

        this.map = myMap;
    }

    createClusterer(innerlayout) {
        const clusterer = new ymaps.Clusterer({
            preset: 'islands#invertedVioletClusterIcons',
            clusterDisableClickZoom: true,
            clusterBalloonContentLayout: 'cluster#balloonCarousel',
            clusterBalloonItemContentLayout: innerlayout,
            openBalloonOnClick: true
        });

        this.cluster = clusterer;
    }

    async createPlacemark(coords) {
        try {
            const response = await ymaps.geocode(coords);
            const address = response.geoObjects.get(0).properties
                .get('metaDataProperty').GeocoderMetaData.Address.formatted;
            const placemark = new ymaps.Placemark(coords, {
                myId: Date.now(),
                myAddress: address,
                myReviews: []
            }, {
                preset: 'islands#violetDotIcon'
            }
            );

            this.marker = placemark;

            return placemark;
        } catch (reject) {
            console.error(reject.message);
        }
    }
    
    pushReviewToPlacemark(inputs) {
        const reviewObj = {
            date: new Date().toLocaleString('ru', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            })
        };
        const placemarkReviews = this.marker.properties.get('myReviews');

        inputs.forEach(item => {
            reviewObj[item.name] = item.value;
            item.value = null;
        });
        placemarkReviews.push(reviewObj);
        if (!this.findPlacemark(item => item === this.marker) ) {
            this.cluster.add(this.marker);
        }
    }

    findPlacemark(func) {
        const placemarks = this.cluster.getGeoObjects();
        const placemark = placemarks.find(func);

        return placemark;
    }
}