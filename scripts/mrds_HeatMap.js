requirejs(['./worldwind.min',
        './LayerManager',
        './RadiantCircleTile',
        '../config/mainconf'],
    function (WorldWind,
              LayerManager,
              RadiantCircleTile) {
        "use strict";
var HeatMapLayer = new WorldWind.HeatMapLayer("Heatmap", data, {
    tile: RadiantCircleTile,
    incrementPerIntensity: 0.05,
    blur: 10,
    // scale: ['rgba(255, 255, 255, 0)', 'rgba(172, 211, 236, 0.25)', 'rgba(204, 255, 255, 0.5)', 'rgba(0, 191, 0, 0.5)']
    scale: ['#000000', '#ffffff', '#00ff00', '#ffff00', '#ff0000']
});

// HeatMapLayer.enabled = false;
wwd.addLayer(HeatMapLayer);

wwd.goTo(new WorldWind.Position(64.2008, -149.4937, mainconfig.eyeDistance_initial));
    });