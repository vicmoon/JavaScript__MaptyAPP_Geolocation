'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout{
   date = new Date(); 
   id = (Date.now() + ' ').slice(-10); 

   constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance= distance;
    this.duration= duration; 
   }
}

class Running extends  Workout{
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence; 
        this.calcPace();
    }

    calcPace(){
        //min/km
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}
class Walking extends  Workout{
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation; 
    }

    calcSpeed(){
        this.speed = this.distance* (this.duration / 60);
        return this.speed
    }
}


// const run1 = new Running([39, -12],5.2, 25, 178 ); 
// const walking1 = new Walking ([39, -13],4, 20, 234); 
// console.log(run1, walking1);


////////////////////////////////

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');



class App{
    #map;
    #mapEvent;

    constructor(){
        this._getPositions();

        form.addEventListener('submit',this._newWorkout.bind(this)); //without bind this is pointing to the form
        
        inputType.addEventListener('change',  this._toggleElevationField); 
    }

    _getPositions() {
        if(navigator.geolocation)
        navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){  // regular function call without bind
            alert('Could not get your location');
        }); 
    }

    _loadMap(position) {
            console.log(position);
            const {latitude} = position.coords;
            const {longitude} = position.coords; 
            console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
            const coords = [latitude, longitude]; 
             
             this.#map = L.map('map').setView(coords, 13);
             console.log(this);
         
             L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
             }).addTo(this.#map);
         
         
             //Handle clicks on the map
         
             this.#map.on('click', this._showForm.bind(this));
          
    }

    _showForm(mapE) {
        this.#mapEvent = mapE; 
        form.classList.remove('hidden')
        inputDistance.focus(); 
    }

    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e){

        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));  // every will return true if all are true
        const allPositive = (...inputs) => inputs.every(inp => inp > 0 ); 

        e.preventDefault(e);

            //Get data from the form

            const type = inputType.value;
            const distance = +inputDistance.value;
            const duration = +inputDuration.value;  
            console.log();

            //Check if valid  (using a guard clause)
          

            //If Running, create Running object 

            if(type ==='running'){
                const cadence = +inputCadence.value; 

                if(
                    !validInputs(distance, duration, cadence) || 
                    !allPositive(distance, duration, cadence));
                    return alert('Inputs have to be positive numbers');
            };

        

            //If Walking, create Walkinng object 

            if(type === 'walking'){
                const elevation = +inputElevation.value; 
               
                if(
                !validInputs(distance, duration, elevation) || 
                !allPositive(distance, duration))
                    return alert('Inputs have to be positive numbers');
                
            };

            //Add workout to Workout array 

            //Render workout on map as a marker 

           const {lat,lng} = this.#mapEvent.latlng; 
            
                    L.marker([lat, lng]).addTo(this.#map)
                    .bindPopup(
                        L.popup({
                        maxWidth: 250,
                        minWidth: 100,
                        autoClose: false,
                        closeOnClick: false,
                        className: 'running-popup'
                    })
                    )
                    .setPopupContent('Workout')
                    .openPopup()
                    .openPopup();        
         

            //Render workout in list 

           //Hide form  and Clear input fields 
         inputDistance.value= inputDuration.value = inputCadence.value = inputElevation.value = 
         ' '; 
        
            //Display Marker 
        }
    };


const app = new App(); 
 