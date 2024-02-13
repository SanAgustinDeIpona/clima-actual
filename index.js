const apiKey = '2be94971d21c1f9b0b92e9426fc06c39';
let latitude = 13.0878; // Latitud de Estelí, Nicaragua
let longitude = -86.3556; // Longitud de Estelí, Nicaragua
let apyUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=Mexico&lang=es&units=imperial,uk&APPID=${apiKey}`,
    apyUrlTomorrow = `https://api.openweathermap.org/data/2.5/forecast?q=Mexico&lang=es&units=imperial,uk&APPID=${apiKey}`;

const $headerStado = document.querySelector(".header-estado"),
$containerGrados = document.querySelector(".container-grados"),
$statusCurrent = document.querySelector("#estado-current"),
$dataCars1 = document.querySelector(".data-cars1"),
$dataCars2 = document.querySelector(".data-cars2"),
$statusCurrentIcon = document.querySelector("#estado-icon"),
$weatherFuture = document.querySelector(".container-weather_future");

/*variables para visualizar el buscador de city*/
const $search = document.querySelector(".search"),
    $searchContainer = document.querySelector(".search-container"),
    $searchCity = document.querySelector(".search-city");

    //seleccion de una region nueva para la temperatura en la area de busqueda
    let _carsTempCurrent, _carsTempTomorrow;

//me formatea a temperatura a celsius
const getTempFormater = (temp)=>{
    return Math.round(temp - 273.15);
}

//selecciona un icono para la temperatura
const SetIcon = (icon, element)=>{
    switch (icon) {
        case 'Thunderstorm':
            element.src='./assets/thunder.svg'
        break;
        case 'Drizzle':
            element.src='./assets/rainy-2.svg'
        break;
        case 'Rain':
            element.src='./assets/rainy-7.svg'
        break;
        case 'Snow':
            element.src='./assets/snowy-6.svg'
        break;                        
        case 'Clear':
            element.src='./assets/day.svg'
        break;
        case 'Atmosphere':
            element.src='./assets/weather.svg'
            break;  
        case 'Clouds':
            element.src='./assets/cloudy-day-1.svg'
            break;  
        default:
            element.src='./assets/cloudy-day-1.svg'
        console.log('por defecto');
    }
}

//renderiza el contenido que se mostrara en el body
const renderetTempMajor = async (current, tomorrow) => {
    try {
        let currentDate = new Date();
        let tempTomorrow = "";

        // Obtener la temperatura para el próximo día
        for (let index = 0; index < tomorrow.list.length; index++) {
            const forecastDate = new Date(tomorrow.list[index].dt_txt);
                
            if (forecastDate.getDate() === currentDate.getDate() + 1 && forecastDate.getHours() === 6) {
                tempTomorrow = tomorrow.list[index];
                $dataCars1.querySelector(".cars_grados").innerText = getTempFormater(tempTomorrow.main.temp);
                $dataCars2.querySelector(".cars_grados").innerText = tempTomorrow.main.humidity + "%";
                SetIcon(tempTomorrow.weather[0].main, $dataCars1.querySelector(".cars_icon"));
                break;
            }
        }

        // Renderizar datos para la temperatura actual
        SetIcon(current.weather[0].main, $statusCurrentIcon);
        $weatherFuture.querySelector("#temperature_min").innerText = getTempFormater(current.main.temp_min);
        $weatherFuture.querySelector("#temperature_max").innerText = getTempFormater(current.main.temp_max);
        $weatherFuture.querySelector("#humedity").innerText = current.main.humidity + "%";
        $headerStado.innerHTML = current.name;
        $containerGrados.innerText = getTempFormater(current.main.temp);
        $statusCurrent.innerText = current.weather[0].description;

        //renderizar las targentas de busqueda
        renderetCarsTemp(current, tomorrow);
    } catch (error) {
        console.error('Hubo un problema al renderizar los datos meteorológicos:', error);
    }
}

//obtiene los datos de la api de la temperatura actual y al futura
const getUrl = async(urlTemCurrent, urlPemTomorrow)=>{

    try {
        let tempCurrent = fetch(urlTemCurrent).then(response => response.json());
        let tempTomorrow = fetch(urlPemTomorrow).then(response => response.json());

        // Esperar a que se completen ambas promesas
        let [current, tomorrow] = await Promise.all([tempCurrent, tempTomorrow]);

        // Devolver los datos obtenidos
        return { current, tomorrow };
    } catch (error) {
        console.error('Tenemos problemas con la respuesta de la api:', error);
        throw error; // Rechazar la promesa en caso de error
    }
};

//validacion para establecer comunicacion a la apy con la geolocalización
const validationGeolocation = ()=>{

    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async function (position) {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                apyUrlCurrent = `https://api.openweathermap.org/data/2.5/weather?${localStorage.getItem("city") !== null ?"q="+localStorage.getItem("city"):`lat=${latitude}&lon=${longitude}`}&lang=es&units=imperial,uk&APPID=${apiKey}`;
                apyUrlTomorrow = `https://api.openweathermap.org/data/2.5/forecast?${localStorage.getItem("city") !== null ?"q="+localStorage.getItem("city"):`lat=${latitude}&lon=${longitude}`}&lang=es&units=imperial,uk&APPID=${apiKey}`;
                
                try {
                    const {current, tomorrow} = await getUrl(apyUrlCurrent, apyUrlTomorrow);
                    renderetTempMajor(current, tomorrow);
                    resolve(true);
                } catch (error) {
                    console.error('Hubo un problema al obtener los datos meteorológicos:', error);
                    resolve(false);
                }
            });
        } else {
            console.log("Geolocalizacion no disponible");
            resolve(false);
        }
    });
}

//renderiza las targetas de los resultados de busqueda
const renderetCarsTemp = (current, tomorrow)=>{
    let currentDate = new Date();
    let tempTomorrow = "";


    for (let index = 0; index < tomorrow.list.length; index++) {
        const forecastDate = new Date(tomorrow.list[index].dt_txt);
            
        if (forecastDate.getDate() === currentDate.getDate() + 1 && forecastDate.getHours() === 6) {
            tempTomorrow = tomorrow.list[index];
            $searchCity.querySelector(".search-city-temp_tomorrow #temp").innerText = getTempFormater(tempTomorrow.main.temp);
            SetIcon(tempTomorrow.weather[0].main, $searchCity.querySelector(".search-city-temp_tomorrow img"));
            break;
        }
    }

    SetIcon(current.weather[0].main,  $searchCity.querySelector(".search-city-temp_current img"));
    $searchCity.querySelector(".search-city-temp_current #temp").innerText = getTempFormater(current.main.temp_min);

}


//valida el lugar de seleccion para la temperatura
document.addEventListener("DOMContentLoaded", ()=>{
    validationGeolocation().then((success) => {
        // Validación para saber si se ha establecido comunicación con la geolocalización
        if (!success) {
            getUrl(apyUrlCurrent, apyUrlTomorrow);
        }
    });
});

//despliega el contenedor de busqueda
document.addEventListener("click", (e)=>{
    if(e.target.classList[0] === "header-search"){
        $search.classList.add("search-active");
        $searchContainer.classList.add("search-container-active");
    }

    if(e.target.classList[0] === "minimize"){
        $search.classList.remove("search-active");
        $searchContainer.classList.remove("search-container-active");
    }

    if (e.target.closest('.search-city')) {
        renderetTempMajor(_carsTempCurrent, _carsTempTomorrow);
        $search.classList.remove("search-active");
        $searchContainer.classList.remove("search-container-active");
    }
    
});

document.addEventListener("submit",(e)=>{
    if(e.target.classList[0] === "search-form"){
        e.preventDefault();
        
        (async()=>{
            const $searchError = document.querySelector(".search_error");

            try {
                let dataCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${e.target.city.value}&lang=es&units=imperial,uk&APPID=${apiKey}`,
                dataTomorrow = `https://api.openweathermap.org/data/2.5/forecast?q=${e.target.city.value}&lang=es&units=imperial,uk&APPID=${apiKey}`;

                localStorage.setItem("city", e.target.city.value);

                let {current, tomorrow} = await getUrl(dataCurrent, dataTomorrow);

                //almacena la nueva temp de la nueva region
                _carsTempCurrent = current;
                _carsTempTomorrow = tomorrow;

                renderetCarsTemp(current, tomorrow);
                $searchError.innerText = "Pais encontrado";
                $searchError.classList.add("search_success_active");
                setTimeout(()=>$searchError.classList.remove("search_success_active"), 
                2000);
            } catch (error) {
                $searchError.innerText = "Pais no encontrado";
                $searchError.classList.add("search_error_active");
                setTimeout(()=>$searchError.classList.remove("search_error_active"), 
                2000);

                console.log("Hubo un problema al obtener los datos meteorológicos: " + error);
            }
        })();
    }
});