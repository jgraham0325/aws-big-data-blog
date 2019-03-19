function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}


var map = L.map('map').setView([52.777814, -3.430458], 5);

var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

    //markers in a cluster
    var markerLayer = L.markerClusterGroup();

    var socket = io();



    var markers = [];
	var heatLayer = L.heatLayer([], {
		maxZoom: 10
	})
	.addTo(map);

	var maxNumPoints = 1000;

	heatLayer._latlngs.push = function (){
    if (this.length >= maxNumPoints) {
        this.shift();}
        return Array.prototype.push.apply(this,arguments);
    }

	socket.on('message', function(coord) {
	    var latlng = new L.latLng(coord.lat, coord.lng)
	    if (heatLayer._map != null) heatLayer.addLatLng(latlng);
		var title = "<b>Transaction ID:<br/></b><a href='#'>" + create_UUID() + "</a><br/><b>Position: </b><br/>" + coord.lat + " , "+coord.lng;
		var marker = L.marker(latlng, { title: title });
		marker.bindPopup(title);
		if (markers.length >= maxNumPoints) {
		    var markerToRemove = markers.shift();
		    markerLayer.removeLayer(markerToRemove);
		}
		markers.push(markers)
		markerLayer.addLayer(marker);
	});

var overlayMaps = {
    "Heat": heatLayer,
    "Points": markerLayer
};

L.control.layers(null, overlayMaps, {collapsed:false}).addTo(map);