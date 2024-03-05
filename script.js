'use strict';

// prettier-ignore



class Workout{
   date = new Date(); 
   id = (Date.now() + ' ').slice(-10); 

   constructor(coords, distance, duration) {
    this.coords = coords; // [lat, lng]
    this.distance= distance;
    this.duration= duration; 
   
   }

   _setDiscription(){
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
     
   this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} 
   on ${months[this.date.getMonth()]} ${this.date.getDate()}`


}


}

class Running extends  Workout{
    type = 'running'; 
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence; 
        this.calcPace();
        this._setDiscription();
    }

    calcPace(){
        //min/km
        this.pace = this.duration/this.distance;
        return this.pace;
    }
}
class Walking extends  Workout{
    type = 'walking'; 
    constructor(coords, distance, duration, elevation) {
        super(coords, distance, duration);
        this.elevation = elevation; 
        this.calcSpeed(); 
        this._setDiscription();
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
    #mapZoom = 15; 
    #mapEvent;
    #workouts = []; 

    constructor(){
        
        this._getPositions();

        form.addEventListener('submit',this._newWorkout.bind(this)); //without bind this is pointing to the form
        
        inputType.addEventListener('change',  this._toggleElevationField); 

        containerWorkouts.addEventListener('click', this._moveToPopUp.bind(this));
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
             
             this.#map = L.map('map').setView(coords, this.#mapZoom);
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

    _hideForm(){
        inputDistance.value= inputDuration.value = inputCadence.value = inputElevation.value = 
         ' ';

         form.style.display = 'none';
         form.classList.add('hidden'); 
         setTimeout(() => form.style.display = 'grid', 1000); 
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
            const {lat,lng} = this.#mapEvent.latlng;
            let workout; 
        

            //Check if valid  (using a guard clause)
          

            //If Running, create Running object 

            if(type ==='running'){
                const cadence = +inputCadence.value; 

                if(
                    !validInputs(distance, duration, cadence) || 
                    !allPositive(distance, duration, cadence))
                    return alert('Inputs have to be positive numbers');


               workout = new Running([lat, lng], distance, duration, cadence);
            
            };

        

            //If Walking, create Walkinng object 

            if(type === 'walking'){
                const elevation = +inputElevation.value; 
               
                if(
                !validInputs(distance, duration, elevation) || 
                !allPositive(distance, duration))
                    return alert('Inputs have to be positive numbers');
                    
                    workout = new Walking([lat, lng], distance, duration, elevation);
                
            };

            //Add workout to Workout array 

            this.#workouts.push(workout); 
            console.log(workout);

            //Render workout on map as a marker  
            this._renderWorkoutMarker(workout);

            //Render workout in list 

            this._renderWorkout(workout);

           //Hide form  and Clear input fields 
          
           this._hideForm();
        
            //Display Marker 
        }


        _renderWorkoutMarker(workout){
          
            L.marker(workout.coords).addTo(this.#map)
            .bindPopup(
                L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`,
               
            })
        
            )
            .setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : '🚶🏻‍♀️'} ${workout.description}`)
            .openPopup()
            .openPopup();        
 
        }
    

        _renderWorkout(workout) {
            let html = `
              <li class="workout workout--${workout.type}" data-id="${workout.id}">
                <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                  <span class="workout__icon">${
                    workout.type === 'running' ? '🏃‍♂️' : '🚶🏻‍♀️'
                  }</span>
                  <span class="workout__value">${workout.distance}</span>
                  <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⏱</span>
                  <span class="workout__value">${workout.duration}</span>
                  <span class="workout__unit">min</span>
                </div>
            `;
        
            if (workout.type === 'running')
              html += `
                <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.pace.toFixed(1)}</span>
                  <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workout.cadence}</span>
                  <span class="workout__unit">spm</span>
                </div>
              </li>
              `;
        
            if (workout.type === 'walking')
              html += `
                <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workout.speed.toFixed(1)}</span>
                  <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⛰</span>
                  <span class="workout__value">${workout.elevationGain}</span>
                  <span class="workout__unit">m</span>
                </div>
              </li>
              `;
        
            form.insertAdjacentHTML('afterend', html);
          }; 

      
        _moveToPopUp(e){
        
            const workoutEl = e.target.closest('.workout'); 
            console.log(workoutEl);

            if(!workoutEl) return ;

            const workout = this.#workouts.find(work => work.id === workoutEl.dataset.id); 
            console.log(workout);

            this.#map.setView(workout.coords,this.#mapZoom, {
                animate: true,
                pan: {
                    duration: 1,
                }
            } )

        }; 
    };        


const app = new App(); 
 