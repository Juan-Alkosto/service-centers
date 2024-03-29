import { render } from "lit/html.js";
import Select from "./select";

const brandSelect = document.getElementById("marca"),
	departmentSelect = document.getElementById("departamento"),
	citySelect = document.getElementById("ciudad"),
	categorySelect = document.getElementById("categoria"),
	defaultOption = new Option("Selecciona una opción", 0, true, true),
	google = window.google,
	menuContainer = document.querySelector(".service-centers__menu"),
	mobileBreakpoint = Number(getComputedStyle(document.documentElement).getPropertyValue("--service-centers-breakpoint").replace("px", ""));

let brandDefaultOption = defaultOption,
	departmentDefaultOption = defaultOption,
	cityDefaultOption = defaultOption,
	categoryDefaultOption = defaultOption,
	enableFirst = true,
	mapElement = null,
	mapLoaded = false,
	validCities = [],
	validCategories = [],
	servicePointsCodes = [];

// Attach events
document.addEventListener("updateCenter", e => {
	const center = e.detail.center;
	if (center !== null) {
		const item = document.getElementById(center);
		item.click();
		setTimeout(() => menuContainer.scrollTop = item.offsetTop, 250);
	}
});

document.addEventListener("click", e => {
	if (e.target.classList
		.contains("service-centers__map__info-window__close")) {
		mapElement.infoWindow.close();
	}
});

window.addEventListener("resize", () => {
	document.querySelector(".service-centers__map").style.display = "none";
	if (window.innerWidth > mobileBreakpoint &&
		document.getElementById("departamento").value != "0") {
		document.querySelector(".service-centers__map").style.display = "block";
	}
});

if (brandSelect !== null) {
	brandDefaultOption = new Option(`Selecciona una ${brandSelect.labels[0].textContent.toLowerCase()}`, 0, true, true);
	brandSelect.append(brandDefaultOption);
}

if (departmentSelect !== null) {
	departmentDefaultOption = new Option(`Selecciona un ${departmentSelect.labels[0].textContent.toLowerCase()}`, 0, true, true);
	departmentSelect.append(departmentDefaultOption);
	if (brandSelect !== null) {
		departmentSelect.disabled = true;
	}
}

if (citySelect !== null) {
	cityDefaultOption = new Option(`Selecciona una ${citySelect.labels[0].textContent.toLowerCase()}`, 0, true, true);
	citySelect.append(cityDefaultOption);
	citySelect.disabled = true;
}

if (categorySelect !== null) {
	categoryDefaultOption = new Option(`Selecciona una ${categorySelect.labels[0].textContent.toLowerCase()}`, 0, true, true);
	categorySelect.append(categoryDefaultOption);
	categorySelect.disabled = true;
}

document.querySelectorAll("[data-custom-select]").forEach(selectElement => new Select(selectElement)); // init custom dropdowns

// eslint-disable-next-line no-undef
if (appConfig.jsonFile !== undefined) {
	// eslint-disable-next-line no-undef
	loadJson(appConfig.jsonFile)
		.then(async ({ brands, categories, departments, serviceCenters }) => {
			if (brands !== undefined && brandSelect !== null) {
				Object.entries(brands).map(async brandData => {
					const brand = brandData[1];
					const value = brandData[0];
					const option = new Option(brand.name, value);
					return brandSelect.append(option);
				});
				brandSelect.refresh();

				brandSelect.addEventListener("change", async () => {
					enableFirst = true;
					departmentSelect.innerHTML = ""; // reset cities select element
					departmentSelect.append(departmentDefaultOption);
					if (mapLoaded) resetMap(mapElement);

					brands[brandSelect.value].departments.map(departmentValue => {
						const option = new Option(departments[departmentValue].name, departmentValue);
						return departmentSelect.append(option);
					});
					departmentSelect.disabled = false;
					departmentSelect.refresh();

					await getServicePoints({
						servicePointsCodes: servicePointsCodes,
						serviceCenters: serviceCenters,
					}).then(servicePoints => setServiceCenters(servicePoints));

					// Reset Cities dropdown
					citySelect.innerHTML = "";
					citySelect.disabled = true;
					citySelect.append(cityDefaultOption);
					citySelect.refresh();
					// Reset Categories dropdown
					categorySelect.innerHTML = "";
					categorySelect.disabled = true;
					categorySelect.append(categoryDefaultOption);
					categorySelect.refresh();
					servicePointsCodes = []; // Reset service array
				});
			}

			if (departments !== undefined && departmentSelect !== null) {
				// get departments and render options in dropdown
				Object.entries(departments).map(departmentData => {
					const department = departmentData[1];
					const value = departmentData[0];
					const option = new Option(department.name, value);
					return departmentSelect.append(option);
				});
				departmentSelect.refresh();

				departmentSelect.addEventListener("change", async () => {
					if(!mapLoaded)
						await initMap();
					mapLoaded = true;
					validCities = [];
					validCategories = [];
					enableFirst = true;
					citySelect.innerHTML = ""; // reset cities select element
					citySelect.append(cityDefaultOption);
					mapElement.infoWindow.close();
					if (window.innerWidth > mobileBreakpoint) {
						// Show map on desktop devices
						document.querySelector(".service-centers__map")
							.style.display = "block";
					}
					document.querySelector(".msje-localiza")
						.innerText = "Localiza los centros de servicio técnico:";
					Object.entries(departments[departmentSelect.value].cities)
						.map(cityData => {
							const city = cityData[0];
							return Object.entries(cityData[1].categories).map(categoriesData => {
								return categoriesData[1].stores.map(code => {
									const serviceCenter = {
										city: city,
										code: code,
										areaCode: cityData[1].areaCode,
									};
									if (brandSelect !== null) {
										if (code.match(brandSelect.value)) {
											validCities.push(city);
											validCategories.push(categoriesData[0]);
											return servicePointsCodes.push(serviceCenter);
										}
									} else {
										return servicePointsCodes.push(serviceCenter);
									}
								});
							});
						});
					await getServicePoints({
						servicePointsCodes: servicePointsCodes,
						serviceCenters: serviceCenters,
					}).then(servicePoints => setServiceCenters(servicePoints));

					validCities = [...new Set(validCities)]; //Remove duplicated cities
					validCategories = [...new Set(validCategories)]; //Remove duplicated cities

					// Get Cities and render options in dropdown
					Object.entries(departments[departmentSelect.value].cities)
						.map(cityData => {
							if (validCities.length) {
								validCities.map(validCity => {
									if (cityData[0] === validCity) {
										const city = cityData[1];
										const option = new Option(city.name, validCity);
										return citySelect.append(option);
									}
								});
							} else {
								const city = cityData[1];
								const value = cityData[0];
								const option = new Option(city.name, value);
								return citySelect.append(option);
							}
						});
					citySelect.disabled = false;
					citySelect.refresh();

					// Reset Categories dropdown
					categorySelect.innerHTML = "";
					categorySelect.disabled = true;
					categorySelect.append(categoryDefaultOption);
					categorySelect.refresh();
					servicePointsCodes = []; // Reset service array
				});
			}

			if (citySelect !== null) {
				citySelect.addEventListener("change", async () => {
					enableFirst = true;
					// Reset Categories dropdown
					categorySelect.innerHTML = "";
					categorySelect.append(categoryDefaultOption);

					Object.values(departments[departmentSelect.value].cities[citySelect.value].categories).map(({ stores }) => {
						return stores.map(code => {
							const serviceCenter = {
								city: citySelect.value,
								code: code,
								areaCode: departments[departmentSelect.value].cities[citySelect.value].areaCode,
							};

							if (brandSelect !== null) {
								if (code.match(brandSelect.value)) {
									return servicePointsCodes.push(serviceCenter);
								}
							} else {
								return servicePointsCodes.push(serviceCenter);
							}
						});
					});
					await getServicePoints({
						servicePointsCodes: servicePointsCodes,
						serviceCenters: serviceCenters,
					}).then(servicePoints => setServiceCenters(servicePoints));

					Object.entries(departments[departmentSelect.value].cities[citySelect.value].categories).map(categoryData => {
						if (validCategories.length) {
							validCategories.map(validCategory => {
								if (categoryData[0] === validCategory) {
									const category = categories[validCategory].name;
									const option = new Option(category, validCategory);
									return categorySelect.append(option);
								}
							});
						} else {
							const category = categories[categoryData[0]].name;
							const label = categoryData[0];
							const option = new Option(category, label);
							return categorySelect.append(option);
						}
					});
					categorySelect.disabled = false;
					categorySelect.refresh();
					servicePointsCodes = []; // Reset service array
				});
			}

			if (categories !== undefined && categorySelect !== null) {
				categorySelect.addEventListener("change", async () => {
					enableFirst = true;
					Object.values(departments[departmentSelect.value].cities[citySelect.value].categories[categorySelect.value].stores).map(code => {
						const serviceCenter = {
							city: citySelect.value,
							code: code,
							areaCode: departments[departmentSelect.value].cities[citySelect.value].areaCode,
						};
						if (brandSelect !== null) {
							if (code.match(brandSelect.value)) {
								return servicePointsCodes.push(serviceCenter);
							}
						} else {
							return servicePointsCodes.push(serviceCenter);
						}
					});
					await getServicePoints({
						servicePointsCodes: servicePointsCodes,
						serviceCenters: serviceCenters,
					}).then((servicePoints) => setServiceCenters(servicePoints));
					servicePointsCodes = []; // Reset service array
				});
			}
		});
}

async function getServicePoints({ servicePointsCodes, serviceCenters }) {
	if (!servicePointsCodes.length) return [];
	const ServiceCenter = await import("./service-center.js").then(Module => Module.ServiceCenter),
	_servicePointsCodes = {};

	servicePointsCodes.map(({ areaCode, city, code }) => _servicePointsCodes[code] = { "areaCode": areaCode, "code": code, "city": city});

	return Object.values(_servicePointsCodes).map(({ areaCode, city, code }) => {
		let servicePoint = {
			areaCode: areaCode,
			city: city,
			coordinates: {
				lat: serviceCenters[code].lat,
				lng: serviceCenters[code].lng,
			},
			id: code
		};
		servicePoint = { ...servicePoint, ...serviceCenters[code] };
		return new ServiceCenter(servicePoint);
	});
}

async function initMap(coordinates = {
	lat : 4.67998417919688,
	lng : -74.08550441957686
}) {
	const Map = await import("./map.js").then(Module => Module.Map);
	return mapElement = new Map({
		$element: "#service-centers-map",
		// eslint-disable-next-line no-undef
		baseSite: appConfig.site,
		center: coordinates
	});
}

async function loadJson(jsonUrl = "") {
	if (jsonUrl.length) {
		return await fetch(jsonUrl, {
			cache: "force-cache",
			mode: "cors",
		}).then(response => {
			if (response.ok) return response.json();
		}).then(data => data);
	}
}

async function setServiceCenters(serviceCenterPoints) {
	if (!serviceCenterPoints.length) return render([], menuContainer);
	const Menu = await import("./menu.js").then(Module => Module.Menu);
	const menuItems = [];

	// render service points menu items
	serviceCenterPoints.map(serviceCenterPoint => {
		serviceCenterPoint.active = enableFirst;
		enableFirst = false;
		if(serviceCenterPoint.isCallCenter) {
			serviceCenterPoint.coordinates = {
				lat: 4.67998417919688,
				lng: -74.08550441957686
			};
		}
		menuItems.push(new Menu(serviceCenterPoint, mapElement).render());
	});
	if (mapLoaded) mapElement.setMarkers(serviceCenterPoints); // render map markers
	render(menuItems, menuContainer);
	document.querySelector("input[name=centro-servicio]").click(); //force checked state on first menu item
}

function resetMap(mapElement) {
	mapElement.infoWindow.close();
	mapElement.clearMarkers();
	mapElement.map.setCenter(new google.maps.LatLng(mapElement.center));
	mapElement.map.setZoom(5);
}