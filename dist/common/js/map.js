/*! service-centers - v1.0.2 */
export default class Map{constructor({$element:e,baseSite:t}){this.$element=document.querySelector(e),this.baseSite=t,this.bounds,this.geocoder=new google.maps.Geocoder,this.infoWindow=new google.maps.InfoWindow,this.markers={},this.map,this.init()}bounceMarker(e,t){void 0!==this.markers[e]&&("start"===t?this.markers[e].setAnimation(google.maps.Animation.BOUNCE):this.markers[e].setAnimation(null))}async getGeo(){try{return await getCoordinates().then(e=>e)}catch(e){return e}}async init(){return this.map=await new google.maps.Map(this.$element,{center:new google.maps.LatLng(4.6482837,-74.2478938),disableDefaultUI:!0,draggable:!0,zoom:10,zoomControl:!0}),this.map}setInfoWindow(e){return`<div class="service-centers__map__info-window">\n            <button class="service-centers__map__info-window__close"><span class="alk-icon-close"></span></button>\n            <h4>${e.name}</h4>\n            <p><strong>Dirección:</strong><br />\n            ${e.address}\n            </p>\n            <p>\n            <i class="alk-icon-exportar"></i><a rel="noopener" href="${e.map}" title="Indicaciones para llegar a ${e.name}" target="_blank">¿Cómo llegar?</a>\n            </p>\n        </div>`}async setMarkers(e){return this.bounds=new google.maps.LatLngBounds,Object.values(this.markers).map(e=>e.setMap(null)),this.markers={},e.map(e=>{const t=new google.maps.Marker({position:new google.maps.LatLng(e.coordinates.lat,e.coordinates.lng),map:this.map,icon:`https://cdn.jsdelivr.net/gh/ux-alkosto/service-centers@latest/dist/${this.baseSite}/img/pin.svg`,title:e.name});t.addListener("click",()=>{this.infoWindow.setContent(this.setInfoWindow(e)),this.infoWindow.open(this.map,t),this.map.panTo(t.getPosition()),document.dispatchEvent(new CustomEvent("updateCenter",{detail:{center:e.id}}))}),this.bounds.extend(t.getPosition()),this.markers[e.id]=t}),this.map.setCenter(this.bounds.getCenter()),this.map.fitBounds(this.bounds),this.map.getZoom()>18&&this.map.setZoom(18),this.markers}};async function getCoordinates(){return new Promise((e,t)=>{navigator.geolocation.getCurrentPosition(t=>{e({lat:t.coords.latitude,lng:t.coords.longitude})},e=>{t(e)})})}