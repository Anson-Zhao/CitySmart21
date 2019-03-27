define(['../../../src/WorldWind'], function (WorldWind) {
    "use strict";
    var wwd = window.WorldWind;

    /**
     * Extends a Web WorldWind globe, with some predefined layers
     * @param options, set the name of the globe through the id
     * @constructor
     */

    var Globe = function (options) {
        wwd.WorldWindow.call(this, options.id);
        // var wwd = new WorldWind.WorldWindow(options.id);

        // Standard WorldWind layers
        var layers = [
            // {layer: new WorldWind.BMNGLayer(), enabled: true},
            // {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(), enabled: true},
            {layer: new WorldWind.BingRoadsLayer(), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(this), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(this), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            this.addLayer(layers[l].layer);
        }
        this.layers[3].detailControl = 1;

        // console.log(this.controller);

    };

    /**
     * Create the globe
     * @type {WorldWind.WorldWindow}
     */
    Globe.prototype = Object.create(WorldWind.WorldWindow.prototype);

    return Globe;

});