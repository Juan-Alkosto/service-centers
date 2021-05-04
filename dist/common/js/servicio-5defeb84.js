/*! service-centers - release: 1.0.9 */
import{getFormatedPhone as t}from"./servicio-2932a724.js";import"./servicio.js";const e=window.google;class n{constructor({$element:t,baseSite:n,center:s}){this.$element=document.querySelector(t),this.baseSite=n,this.bounds,this.center=s,this.geocoder=new e.maps.Geocoder,this.infoWindow=new e.maps.InfoWindow,this.markers={},this.map,this.init()}bounceMarker(t,n){void 0!==this.markers[t]&&("start"===n?this.markers[t].setAnimation(e.maps.Animation.BOUNCE):this.markers[t].setAnimation(null))}async getGeo(){try{return await async function(){return new Promise(((t,e)=>{navigator.geolocation.getCurrentPosition((e=>{t({lat:e.coords.latitude,lng:e.coords.longitude})}),(t=>{e(t)}))}))}().then((t=>t))}catch(t){return t}}async init(){return this.map=await new e.maps.Map(this.$element,{center:new e.maps.LatLng(this.center),disableDefaultUI:!0,draggable:!0,zoom:10,zoomControl:!0}),this.map}setInfoWindow(e){const n=t(e,!1);return`<div class="service-centers__map__info-window">\n            <button class="service-centers__map__info-window__close"><span class="alk-icon-close"></span></button>\n            <h4>${e.name}</h4>\n            ${e.address.length?`<p><strong>Dirección:</strong><br />\n                ${e.address}\n            </p>`:""}\n            ${e.phone.length?`<p><strong>Contacto telefónico:</strong><br />\n                ${n.join(" ")}\n            </p>`:""}\n            ${e.map.length?` <p><i class="alk-icon-exportar"></i>\n                <a rel="noopener" href="${e.map}" title="Indicaciones para llegar a ${e.name}" target="_blank">¿Cómo llegar?</a>\n            </p>`:""}\n        </div>`}async setMarkers(t){return this.bounds=new e.maps.LatLngBounds,this.clearMarkers(),this.markers={},t.map((t=>{const n=new e.maps.Marker({position:new e.maps.LatLng(t.coordinates.lat,t.coordinates.lng),map:this.map,icon:`../dist/${this.baseSite}/img/pin.svg`,title:t.name});n.addListener("click",(()=>{this.infoWindow.setContent(this.setInfoWindow(t)),this.infoWindow.open(this.map,n),this.map.panTo(n.getPosition()),document.dispatchEvent(new CustomEvent("updateCenter",{detail:{center:t.id}}))})),this.bounds.extend(n.getPosition()),this.markers[t.id]=n})),this.map.setCenter(this.bounds.getCenter()),this.map.fitBounds(this.bounds),this.map.getZoom()>18&&this.map.setZoom(18),this.markers}clearMarkers(){return Object.values(this.markers).map((t=>t.setMap(null)))}}export{n as Map};
