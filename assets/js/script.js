import carsData from "../data/cars.json" with { type: "json" };
// let carTable = document.querySelector("tbody");
// let carRows = carTable.querySelectorAll("tr");
// let cars = []
// carRows.forEach(carRow =>{
// let carYear = carRow.children[1].textContent.substring(0,4);
// let car = {
//   brand: carRow.children[0].textContent,
// 	name: carRow.children[1].textContent.substring(5),
// 	year: carYear,
// 	carType: carRow.children[2].textContent,
// 	class: carRow.children[3].textContent,
// 	county: carRow.children[4].textContent,
// 	collection: carRow.children[5].textContent,
// 	pack: carRow.children[6].textContent,
// 	photograped: false,
// 	owned: false,
// };
// cars.push(car)
// });
// console.log(cars)

// (function () {
//     let images = document.querySelectorAll(".modal-content img.progressive-image");
//     let urls = [];
//     images.forEach((image, index) => {
//         let url = image.src.split(".png")
//         url = url[0] + ".png"
//         urls.push(url);
//     });
//     console.log(urls)
// })();
let cars;
let carTable = document.querySelector("tbody");
let totalCars = document.getElementById("totalCars");
let tableHeader = document.querySelector(".tableHeader");
let brandFilter = document.getElementById("carBrandFilter");
let collectionStatusFilter = document.getElementById("collectionStatusFilter");
let carCountryFilter = document.getElementById("carCountryFilter");
let carTypeFilter = document.getElementById("carTypeFilter");
let carYearFilter = document.getElementById("carYearFilter");
let carPackFilter = document.getElementById("hidePacksCheckbox");
let carsShownElement = document.getElementById("carsShown");
let searchInput = document.getElementById("searchInput");
let versionElement = document.querySelector("#version");

function updateData(carsData, updatedCars) {
    console.log("updating cars")
    // Build lookup map from stored data
    const storedMap = Object.fromEntries(
        carsData.map(car => [car.id ?? car.name, car])
    );

    // Merge master data with stored user fields
    return updatedCars.map(masterCar => {
        const storedCar = storedMap[masterCar.id ?? masterCar.name];

        return {
            ...masterCar, // new master data (img, id, etc.)
            owned: storedCar?.owned ?? false,
            photographed: storedCar?.photographed ?? false
        };
    });
}

function initializeCars() {
    let localVersion = Number(localStorage.getItem("version"));
    let dataVersion = carsData.version;
    let localCars = localStorage.getItem("cars");
    let userVersion = localVersion < dataVersion ? dataVersion : localVersion;

    if (localCars !== null && localCars !== undefined) {
        cars = JSON.parse(localStorage.getItem("cars"));
        if (localVersion == null || localVersion < dataVersion) {
            userVersion = dataVersion
            cars = updateData(cars, carsData.cars)
            versionElement.textContent = dataVersion;
            localStorage.setItem("version", dataVersion);
            localStorage.setItem("cars", JSON.stringify(cars));
        }
        cars = JSON.parse(localCars);
        versionElement.textContent = userVersion;
    } else {
        versionElement.textContent = userVersion;
        cars = carsData.cars;
        localStorage.setItem("cars", JSON.stringify(cars));
        localStorage.setItem("version", dataVersion);
    }
}
initializeCars();

let sorting = {
    index: undefined,
    direction: "asc"
}

let brands = [...new Set(cars.map(car => car.brand))].sort();
brands.forEach(brand => {
    let option = document.createElement("option");
    option.value = brand;
    option.textContent = brand;
    brandFilter.appendChild(option);
});

let countries = [...new Set(cars.map(car => car.county))].sort();
countries.forEach(country => {
    let option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    carCountryFilter.appendChild(option);
});

let types = [...new Set(cars.map(car => car.carType))].sort();
types.forEach(type => {
    let option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    carTypeFilter.appendChild(option);
});
let years = [...new Set(cars.map(car => car.year))].sort((a, b) => b - a);
years.forEach(year => {
    let option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    carYearFilter.appendChild(option);
});


// sort alphabetically by column
function sortAlphabetically(index) {
    let rows = Array.from(carTable.querySelectorAll("tr"));
    if (sorting.index !== index) {
        sorting.direction = "asc";
    }
    if (index === 1 || index === 2) {
        // sort checkboxes
        if (sorting.direction === "asc") {
            rows.sort((a, b) => {
                let checkboxA = a.children[index].querySelector("input[type='checkbox']").checked;
                let checkboxB = b.children[index].querySelector("input[type='checkbox']").checked;
                return checkboxB - checkboxA;
            });
            rows.forEach(row => carTable.appendChild(row));
        } else {
            rows.sort((a, b) => {
                let checkboxA = a.children[index].querySelector("input[type='checkbox']").checked;
                let checkboxB = b.children[index].querySelector("input[type='checkbox']").checked;
                return checkboxA - checkboxB;
            });
            rows.forEach(row => carTable.appendChild(row));
        }
    }

    if (sorting.direction === "asc" && index !== 0 && index !== 1) {
        rows.sort((a, b) => {
            let nameA = a.children[index].textContent.toUpperCase();
            let nameB = b.children[index].textContent.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        rows.forEach(row => carTable.appendChild(row));
    } else {
        rows.sort((a, b) => {
            let nameA = a.children[index].textContent.toUpperCase();
            let nameB = b.children[index].textContent.toUpperCase();
            if (nameA > nameB) {
                return -1;
            }
            if (nameA < nameB) {
                return 1;
            }
            return 0;
        });
        rows.forEach(row => carTable.appendChild(row));
    }
    sorting.index = index;
}

// set total cars header & create table rows
totalCars.textContent = cars.length;
cars.forEach(car => {
    let carRowTemplate = document.getElementById("carRowTemplate");
    let carRow = carRowTemplate.cloneNode(true);
    // let carRow = document.createElement("tr");

    carRow.children[0].querySelector("img").src = "./assets/img/cars/" + car.img;
    carRow.querySelector(".ownedCheckboxInput").checked = car.owned;
    carRow.querySelector(".picturedCheckboxInput").checked = car.photographed;
    carRow.children[3].textContent = car.brand;
    carRow.children[4].textContent = car.name;
    carRow.children[5].textContent = car.year;
    carRow.children[6].textContent = car.carType;
    carRow.children[7].textContent = car.class;
    carRow.children[8].textContent = car.county;
    carRow.children[9].textContent = car.collection;
    carRow.children[10].textContent = car.pack;
    carRow.classList.remove("hidden");


    carRow.querySelector(".ownedCheckboxInput").addEventListener("change", () => {
        car.owned = carRow.querySelector(".ownedCheckboxInput").checked;
        localStorage.setItem("cars", JSON.stringify(cars));
    });
    carRow.querySelector(".picturedCheckboxInput").addEventListener("change", () => {
        car.photographed = carRow.querySelector(".picturedCheckboxInput").checked;
        localStorage.setItem("cars", JSON.stringify(cars));
    });

    carTable.appendChild(carRow);
});


// --------------- FILTERS ---------------- 
// filter by brand
brandFilter.addEventListener("change", () => {
    let selectedBrand = brandFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let brand = row.querySelector(".carBrand").textContent;
        if (selectedBrand === "All" || brand === selectedBrand) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});

collectionStatusFilter.addEventListener("change", () => {
    let selectedStatus = collectionStatusFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let pictureCheckbox = row.querySelector(".picturedCheckboxInput").checked;
        let ownedCheckbox = row.querySelector(".ownedCheckboxInput").checked;
        let showCar = false;
        if (selectedStatus === "All") {
            row.classList.remove("hidden");
        } else if ((selectedStatus === "Not Owned" && !ownedCheckbox) || (selectedStatus === "Not Pictured" && !pictureCheckbox)) {
            row.classList.remove("hidden");
            carsShown++;
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});
carCountryFilter.addEventListener("change", () => {
    let selectedCountry = carCountryFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let country = row.querySelector(".carCountry").textContent;
        if (selectedCountry === "All" || country === selectedCountry) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});

carTypeFilter.addEventListener("change", () => {
    let selectedType = carTypeFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let type = row.querySelector(".carType").textContent;
        if (selectedType === "All" || type === selectedType) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })

    carsShownElement.textContent = `${carsShown}/`;
});

carYearFilter.addEventListener("change", () => {
    let selectedYear = carYearFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let year = row.querySelector(".carYear").textContent;
        if (selectedYear === "All" || year === selectedYear) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});

carPackFilter.addEventListener("change", () => {
    let hidePacks = carPackFilter.checked;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let pack = row.querySelector(".carPackNeeded").textContent;
        if (!hidePacks || pack === "") {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});

carClassFilter.addEventListener("change", () => {
    let selectedClass = carClassFilter.value;
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let carClass = row.querySelector(".carClass").textContent.substring(4);
        if (selectedClass === "All" || carClass === selectedClass) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
});

searchInput.addEventListener("input", () => {
    let searchTerm = searchInput.value.toLowerCase();
    let rows = carTable.querySelectorAll("tr");
    let carsShown = 0;
    rows.forEach(row => {
        let name = row.querySelector(".carName").textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            carsShown++;
            row.classList.remove("hidden");
        } else {
            row.classList.add("hidden");
        }
    })
    carsShownElement.textContent = `${carsShown}/`;
});



// add click event listeners to table headers for sorting
let tableHeaders = document.querySelectorAll(".tableHeader th");
tableHeaders.forEach((header, index) => {
    header.addEventListener("click", () => {
        sorting.direction = sorting.direction === "asc" ? "desc" : "asc";
        sortAlphabetically(index);
        let sortIndicators = header.querySelector(".sort-indicator");
        tableHeaders.forEach(h => {
            let indicator = h.querySelector(".sort-indicator");
            if (indicator) {
                indicator.textContent = "";
            }
        });
        if (sorting.direction === "asc") {
            sortIndicators.textContent = "▼";
        } else {
            sortIndicators.textContent = "▲";
        }
    })
});