requirejs([
    // '../node_modules/worldwindjs/build/dist/worldwind.min.js',
    //     '../src/util/WWMath',
    //     '../src/geom/Angle',
    //     '../src/geom/Location',
    '../config/mainconf'],
    function (
        // WorldWind,
        //       WWMath,
        //       Angle,
        //       Location
    ) {
        "use strict";
        $(document).ready(function () {

            var placemark = [];
            var autoSuggestion = [];
            var suggestedLayer;
            var clickedLayer;
            var valueColor;

            $(function () {


                // reading configGlobal from mainconf.js
                var mainconfig = config;
                console.log(mainconfig);

                class Globe {
                    constructor(canvasId) {
                        // Create a WorldWindow globe on the specified HTML5 canvas
                        this.wwd = new WorldWind.WorldWindow(canvasId);

                        // Holds the next unique id to be assigned to a layer
                        this.nextLayerId = 1;

                        this.categoryTimestamps = new Map();

                        // Add a BMNGOneImageLayer background layer. We're overriding the default
                        // minimum altitude of the BMNGOneImageLayer so this layer always available.
                        this.addLayer(new WorldWind.BMNGOneImageLayer(), {
                            category: "background",
                            minActiveAltitude: 0
                        });
                    }

                    getCategoryTimestamp(category) {
                        if (!this.categoryTimestamps.has(category)) {
                            this.categoryTimestamps.set(category, ko.observable());
                        }
                        return this.categoryTimestamps.get(category);
                    }

                    /**
                     * Updates the timestamp for the given category.
                     * @param {String} category
                     */
                    updateCategoryTimestamp(category) {
                        let timestamp = this.getCategoryTimestamp(category);
                        timestamp(new Date());
                    }

                    /**
                     * Toggles the enabled state of the given layer and updates the layer
                     * catetory timestamp. Applies a rule to the 'base' layers the ensures
                     * only one base layer is enabled.
                     * @param {WorldWind.Layer} layer
                     */
                    toggleLayer(layer) {

                        // Multiplicity Rule: only [0..1] "base" layers can be enabled at a time
                        if (layer.category === 'base') {
                            this.wwd.layers.forEach(function(item) {
                                if (item.category === 'base' && item !== layer) {
                                    item.enabled = false;
                                }
                            });
                        }
                        // Toggle the selected layer's visibility
                        layer.enabled = !layer.enabled;
                        // Trigger a redraw so the globe shows the new layer state ASAP
                        this.wwd.redraw();

                        // Signal a change in the category
                        this.updateCategoryTimestamp(layer.category);
                    }


                    /**
                     * Returns a new array of layers in the given category.
                     * @param {String} category E.g., "base", "overlay" or "setting".
                     * @returns {Array}
                     */
                    getLayers(category) {
                        return this.wwd.layers.filter(layer => layer.category === category);
                    }

                    /**
                     * Adds a layer to the globe. Applies the optional options' properties to the
                     * layer, and assigns the layer a unique ID and category.
                     * @param {WorldWind.Layer} layer
                     * @param {Object|null} options E.g., {category: "base", enabled: true}
                     */

                    addLayer(layer, options) {
                        // Copy all properties defined on the options object to the layer
                        if (options) {
                            for (let prop in options) {
                                if (!options.hasOwnProperty(prop)) {
                                    continue; // skip inherited props
                                }
                                layer[prop] = options[prop];
                            }
                        }
                        // Assign a default category property if not already assigned
                        if (typeof layer.category === 'undefined') {
                            layer.category = 'overlay'; // the default category
                        }

                        // Assign a unique layer ID to ease layer management
                        layer.uniqueId = this.nextLayerId++;

                        let index = this.wwd.layers.findIndex(function(element){return element.category === layer.category;});
                        if (index < 0) {
                            // Add to the end of the overall layer list
                            this.wwd.addLayer(layer);
                        } else {
                            // Add the layer to the end the category
                            let numLayers = this.getLayers(layer.category).length;
                            this.wwd.insertLayer(index + numLayers, layer);
                        }

                        // Add the layer to the globe
                        this.wwd.redraw();

                        this.getCategoryTimestamp(layer.category);
                    }

                }

                function LayersViewModel(globe) {
                    var self = this;
                    self.baseLayers = ko.observableArray(globe.getLayers('base').reverse());
                    self.overlayLayers = ko.observableArray(globe.getLayers('overlay').reverse());
                    // Update the view model whenever the model changes
                    globe.getCategoryTimestamp('base').subscribe(newValue =>
                        loadLayers(globe.getLayers('base'), self.baseLayers));
                    globe.getCategoryTimestamp('overlay').subscribe(newValue =>
                        loadLayers(globe.getLayers('overlay'), self.overlayLayers));
                    // Button click event handler
                    self.toggleLayer = function (layer) {
                        globe.toggleLayer(layer);
                        // Zoom to the layer if it has a bbox assigned to it
                        if (layer.enabled && layer.bbox) {
                            globe.zoomToLayer(layer);
                        }
                    };
                }

                /**
                 * Settings view model.
                 * @param {Globe} globe
                 */
                function SettingsViewModel(globe) {
                    var self = this;
                    self.settingLayers = ko.observableArray(globe.getLayers('setting').reverse());
                    self.debugLayers = ko.observableArray(globe.getLayers('debug').reverse());
                    // Update this view model whenever one of the layer categories change
                    globe.getCategoryTimestamp('setting').subscribe(newValue =>
                        loadLayers(globe.getLayers('setting'), self.settingLayers));
                    globe.getCategoryTimestamp('debug').subscribe(newValue =>
                        loadLayers(globe.getLayers('debug'), self.debugLayers));
                    // Button click event handler
                    self.toggleLayer = function (layer) {
                        globe.toggleLayer(layer);
                    };
                }

                // Create a globe
                var newGlobe = new Globe("canvasOne");
                console.log(newGlobe.wwd);

                // for (var l = 0; l < layers.length; l++) {
                //                 layers[l].layer.enabled = layers[l].enabled;
                // newGlobe.wwd.addLayer(layers[l].layer);
                // }

                // Add layers to the globe
                newGlobe.addLayer(new WorldWind.BMNGLayer(), {
                    category: "base"
                });
                newGlobe.addLayer(new WorldWind.BMNGLandsatLayer(), {
                    category: "base",
                    enabled: false
                });
                newGlobe.addLayer(new WorldWind.BingAerialLayer(), {
                    category: "base",
                    enabled: false
                });
                newGlobe.addLayer(new WorldWind.BingAerialWithLabelsLayer(), {
                    category: "base",
                    enabled: false,
                    detailControl: 1.5
                });
                newGlobe.addLayer(new WorldWind.BingRoadsLayer(), {
                    category: "overlay",
                    enabled: false,
                    detailControl: 1.5,
                    opacity: 0.75
                });
                newGlobe.addLayer(new WorldWind.CoordinatesDisplayLayer(newGlobe.wwd), {
                    category: "setting"
                });
                newGlobe.addLayer(new WorldWind.ViewControlsLayer(newGlobe.wwd), {
                    category: "setting"
                });
                newGlobe.addLayer(new WorldWind.CompassLayer(), {
                    category: "setting",
                    enabled: false
                });
                newGlobe.addLayer(new WorldWind.StarFieldLayer(), {
                    category: "setting",
                    enabled: false,
                    displayName: "Stars"
                });
                newGlobe.addLayer(new WorldWind.AtmosphereLayer(), {
                    category: "setting",
                    enabled: false,
                    time: null // or new Date()
                });


                let layers = new LayersViewModel(newGlobe);
                let settings = new SettingsViewModel(newGlobe);

                ko.applyBindings(layers, document.getElementById('layers'));
                ko.applyBindings(settings, document.getElementById('settings'));


                // Auto-collapse the main menu when its button items are clicked
                $('.navbar-collapse a[role="button"]').click(function () {
                    $('.navbar-collapse').collapse('hide');
                });

                // Collapse card ancestors when the close icon is clicked
                $('.collapse .close').on('click', function () {
                    $(this).closest('.collapse').collapse('hide');
                });

                // Tell WorldWind to log only warnings and errors.
                WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

                function getRandomInRange(from, to, fixed) {
                    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
                    // .toFixed() returns string, so ' * 1' is a trick to convert to number
                }

                function getRndInteger(min, max) {
                    return Math.floor(Math.random() * (max - min + 1)) + min;
                }

                function getColorY(year) {
                    return year >= mainconfig.Color_Year.red ? 'red' :
                        year >= mainconfig.Color_Year.orange ? 'orange' : // Means: if (d >= 1966) return 'green' else…
                            year >= mainconfig.Color_Year.yellow ? 'yellow' : // if (d >= 1960) return 'black' else etc…
                                year >= mainconfig.Color_Year.green ? 'green' :
                                    year >= mainconfig.Color_Year.blue ? 'blue' : // Note that numbers must be in descending order
                                        'grey';
                }

                function getColorC(megawatts) {
                    return megawatts >= mainconfig.Color_Capacity.red ? 'red' :
                        megawatts >= mainconfig.Color_Capacity.orange ? 'orange' : // Means: if (d >= 1966) return 'green' else…
                            megawatts >= mainconfig.Color_Capacity.yellow ? 'yellow' : // if (d >= 1960) return 'black' else etc…
                                megawatts >= mainconfig.Color_Capacity.green ? 'green' :
                                    megawatts >= mainconfig.Color_Capacity.blue ? 'blue' : // Note that numbers must be in descending order
                                        'grey';
                }

                function getColorH(length) {
                    return length >= mainconfig.Color_Height.red ? 'red' :
                        length >= mainconfig.Color_Height.orange ? 'orange' : // Means: if (d >= 1966) return 'green' else…
                            length >= mainconfig.Color_Height.yellow ? 'yellow' : // if (d >= 1960) return 'black' else etc…
                                length >= mainconfig.Color_Height.green ? 'green' :
                                    length >= mainconfig.Color_Height.blue ? 'blue' : // Note that numbers must be in descending order
                                        'grey';
                }

                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                function hslToRgb(h, s, l) {
                    var r, g, b;

                    if (s === 0) {
                        r = g = b = l; // achromatic
                    } else {

                        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                        var p = 2 * l - q;
                        r = hue2rgb(p, q, h + 1 / 3);
                        g = hue2rgb(p, q, h);
                        b = hue2rgb(p, q, h - 1 / 3);
                    }

                    return 'rgb(' + [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), 0.8] + ')';
                }

                function percentageToHsl(value) {
                    var hue = (value * (5 - 215)) + 215;
                    var hueF = hue / 360;
                    return hslToRgb(hueF, 0.8, 0.5);
                }

                // $("#test").on('click', function () {
                //     // // wwd.layers[5].renderables[0].enableLeaderLinePicking = true;
                //     //
                //     // // console.log(wwd.layers[0].eyeText.text);
                //     // wwd.drawContext.orderedRenderingMode = true;
                //     // wwd.drawContext.pickingMode = true;
                //     // // wwd.drawContext.orderedRenderables = placemark;
                //     //
                //     wwd.deepPicking = true;
                //     console.log(wwd);
                //     // console.log(wwd.drawContext.orderedRenderablesCounter);
                //     // // console.log(wwd.drawContext.orderedRenderingMode);
                //     // console.log(wwd.drawContext.orderedRenderables);
                //
                //     var clientRect = wwd.canvas.getBoundingClientRect();
                //     console.log(clientRect);
                //     var region = new WorldWind.Rectangle(
                //         0,
                //         clientRect.height,
                //         clientRect.width,
                //         clientRect.height);
                //     console.log(region);
                //
                //     var pickList = wwd.pickShapesInRegion(region);
                //     console.log(pickList.objects);
                //
                //     var totalWT = 0;
                //     var totalCap = 0;
                //
                //     for (var q = 0; q < pickList.objects.length; q++) {
                //         var pickedPL = pickList.objects[q].userObject;
                //         // console.log(pickedPL);
                //         if (pickedPL instanceof WorldWind.Placemark) {
                //             totalWT++;
                //             if (pickedPL.userProperties.p_avgcap !== "N/A") {
                //                 totalCap += pickedPL.userProperties.p_avgcap;
                //             }
                //         }
                //
                //         if (q === pickList.objects.length - 1) {
                //             console.log(totalWT);
                //             console.log(totalCap);
                //         }
                //     }
                //
                //     pickList = [];
                // });

                $("#none, #p_year_color, #p_avgcap_color, #t_ttlh_color").on("click", function () {
                    var category = this.id;
                    var minColor;
                    var maxColor;

                    // console.log(category);
                    var color = {
                        "grey": "rgba(192, 192, 192, 0.5)",
                        "blue": "rgba(0, 0, 255, 0.5)",
                        "green": "rgba(0, 255, 0, 0.5)",
                        "yellow": "rgba(255, 255, 0, 0.5)",
                        "orange": "rgba(255, 127.5, 0, 0.5)",
                        "red": "rgba(255, 0, 0, 0.5)",
                        'undefined': "rgba(255, 255, 255, 1)"
                    };

                    var scale = {
                        "none": ["", ""],
                        "p_year_color": ["1980", "2017"],
                        "p_avgcap_color": ["<1MW", ">3 MW"],
                        "t_ttlh_color": ["5m", "185m"],
                    };

                    var ymi, yma, cmi, cma, hmi, hma;

                    $.ajax({
                        url: '/gradientValue',
                        type: 'GET',
                        dataType: 'json',
                        async: false,
                        success: function (resp) {
                            console.log(resp.data[0].yearMin);
                            var left = $("#leftScale");
                            var right = $("#rightScale");
                            ymi = resp.data[0].yearMin;
                            yma = resp.data[0].yearMax;
                            cmi = resp.data[0].capMin;
                            cma = resp.data[0].capMax;
                            hmi = resp.data[0].heightMin;
                            hma = resp.data[0].heightMax;
                            if (category === "p_year_color") {
                                left.html(resp.data[0].yearMin);
                                right.html(resp.data[0].yearMax);

                            } else if (category === "p_avgcap_color") {
                                left.html("<" + resp.data[0].capMin + "MW");
                                right.html(">" + resp.data[0].capMax + "MW");
                            } else if (category === "t_ttlh_color") {
                                left.html(resp.data[0].heightMin + "m");
                                right.html(resp.data[0].heightMax + "m");
                            } else {
                                left.html(scale[category][0]);
                                right.html(scale[category][1]);
                            }

                        }
                    });

                    $("#edit").on("click", function () {
                        var cancel = $("#cancel");

                        $("#editContainer").css("display", "block");
                        $("#edit").css("display", "none");

                        $("#valSubmit").css("display", "block");
                        cancel.css("display", "inline-block");

                        cancel.on("click", function () {
                            $("#edit").css("display", "block");
                            $("#editContainer").css("display", "none");
                        });

                        $("#p_avgcap_color").click();
                        var sliderY = $("#sliderYear");
                        sliderY.slider({
                            range: true,
                            step: 1,
                            min: 1980,
                            max: 2017,
                            values: [ymi, yma],
                            slide: function (event, ui) {
                                yearMin = ui.values[0];
                                yearMax = ui.values[1];
                                $("#amountY").val(yearMin + " - " + yearMax);
                            }
                        });
                        var yearMin = sliderY.slider('values', 0);
                        var yearMax = sliderY.slider('values', 1);
                        minColor = sliderY.slider('values', 0);
                        maxColor = sliderY.slider('values', 1);
                        $("#amountY").val(sliderY.slider("values", 0) +
                            " - " + sliderY.slider("values", 1));

                        var sliderC = $("#sliderCap");
                        sliderC.slider({
                            range: true,
                            step: 0.01,
                            min: 0,
                            max: 4,
                            values: [cmi, cma],
                            slide: function (event, ui) {
                                capMin = ui.values[0];
                                capMax = ui.values[1];
                                $("#amountC").val("<" + capMin + "MW - >" + capMax + "MW");

                            }
                        });
                        var capMin = sliderC.slider('values', 0);
                        var capMax = sliderC.slider('values', 1);
                        $("#amountC").val("<" + sliderC.slider("values", 0) +
                            "MW - >" + sliderC.slider("values", 1) + "MW");

                        var sliderH = $("#sliderHeight");
                        sliderH.slider({
                            range: true,
                            step: 1,
                            min: 5,
                            max: 185,
                            values: [hmi, hma],
                            slide: function (event, ui) {
                                heightMin = ui.values[0];
                                heightMax = ui.values[1];
                                $("#amountH").val(heightMin + "m - " + heightMax + "m");

                            }
                        });
                        var heightMin = sliderH.slider('values', 0);
                        var heightMax = sliderH.slider('values', 1);
                        $("#amountH").val(sliderH.slider("values", 0) +
                            "m - " + sliderH.slider("values", 1) + "m");

                        $("#p1").css("display", "none");
                        $("#p2").css("display", "block");
                        $("#p3").css("display", "none");
                        sliderC.css("display", "block");
                        $("#amountC").css("display", "inline-block");
                        sliderY.css("display", "none");
                        $("#amountY").css("display", "none");
                        sliderH.css("display", "none");
                        $("#amountH").css("display", "none");
                        $("#none, #p_year_color, #p_avgcap_color, #t_ttlh_color").change(function () {
                            var category = this.id;
                            if (category === "p_year_color") {
                                minColor = yearMin;
                                maxColor = yearMax;
                                $("#p1").css("display", "block");
                                $("#p2").css("display", "none");
                                $("#p3").css("display", "none");
                                sliderY.css("display", "block");
                                $("#amountY").css("display", "inline-block");
                                sliderC.css("display", "none");
                                $("#amountC").css("display", "none");
                                sliderH.css("display", "none");
                                $("#amountH").css("display", "none");
                            } else if (category === "p_avgcap_color") {
                                minColor = capMin;
                                maxColor = capMax;
                                $("#p1").css("display", "none");
                                $("#p2").css("display", "block");
                                $("#p3").css("display", "none");
                                sliderC.css("display", "block");
                                $("#amountC").css("display", "inline-block");
                                sliderY.css("display", "none");
                                $("#amountY").css("display", "none");
                                sliderH.css("display", "none");
                                $("#amountH").css("display", "none");
                            } else if (category === "t_ttlh_color") {
                                minColor = heightMin;
                                maxColor = heightMax;
                                $("#p1").css("display", "none");
                                $("#p2").css("display", "none");
                                $("#p3").css("display", "block");
                                sliderH.css("display", "block");
                                $("#amountH").css("display", "inline-block");
                                sliderC.css("display", "none");
                                $("#amountC").css("display", "none");
                                sliderY.css("display", "none");
                                $("#amountY").css("display", "none");
                            } else {
                                minColor = 0;
                                maxColor = 0;
                                $("#p1").css("display", "none");
                                $("#p2").css("display", "none");
                                $("#p3").css("display", "none");
                                sliderH.css("display", "none");
                                $("#amountH").css("display", "none");
                                sliderC.css("display", "none");
                                $("#amountC").css("display", "none");
                                sliderY.css("display", "none");
                                $("#amountY").css("display", "none");
                            }

                            var colorData = "yearMin=" + yearMin + "&" + "yearMax=" + yearMax + "&" + "capMin=" + capMin + "&" + "capMax=" + capMax + "&" + "heightMin=" + heightMin + "&" + "heightMax=" + heightMax;

                            $("#valSubmit").on("click", function () {
                                $.ajax({
                                    url: '/gradientValue',
                                    method: "POST",
                                    data: colorData,
                                    dataType: 'json',
                                    success: function (resp) {
                                        $.ajax({
                                            url: '/gradientValue',
                                            type: 'GET',
                                            dataType: 'json',
                                            async: false,
                                            success: function (resp) {
                                                ymi = resp.data[0].yearMin;
                                                yma = resp.data[0].yearMax;
                                                cmi = resp.data[0].capMin;
                                                cma = resp.data[0].capMax;
                                                hmi = resp.data[0].heightMin;
                                                hma = resp.data[0].heightMax;
                                                var left = $("#leftScale");
                                                var right = $("#rightScale");
                                                if (category === "p_year_color") {
                                                    left.html(resp.data[0].yearMin);
                                                    right.html(resp.data[0].yearMax);

                                                } else if (category === "p_avgcap_color") {
                                                    left.html("<" + resp.data[0].capMin + "MW");
                                                    right.html(">" + resp.data[0].capMax + "MW");
                                                } else if (category === "t_ttlh_color") {
                                                    left.html(resp.data[0].heightMin + "m");
                                                    right.html(resp.data[0].heightMax + "m");
                                                } else {
                                                    left.html(scale[category][0]);
                                                    right.html(scale[category][1]);
                                                }

                                            }
                                        });
                                    }
                                });
                            });

                            for (var i = 0; i < placemark.length; i++) {
                                var circle = document.createElement("canvas"),
                                    ctx = circle.getContext('2d'),
                                    radius = 10,
                                    r2 = radius + radius;

                                circle.width = circle.height = r2;

                                valueColor = placemark[i].userProperties[category];

                                console.log(valueColor);

                                var result = (valueColor - minColor) / (maxColor - minColor) * (255 - 5) + 5;

                                var resultF = result / 255;

                                var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);

                                if (valueColor < minColor || valueColor > maxColor || (minColor === 0 && maxColor === 0)) {
                                    gradient.addColorStop(0, 'rgb(255, 255, 255)');
                                } else {
                                    gradient.addColorStop(0, percentageToHsl(resultF));
                                }


                                ctx.beginPath();
                                ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

                                ctx.fillStyle = gradient;
                                ctx.fill();
                                // ctx.strokeStyle = "rgb(255, 255, 255)";
                                // ctx.stroke();

                                ctx.closePath();

                                placemark[i].attributes.imageSource.image = circle;
                                placemark[i].updateImage = true;

                                if (i === placemark.length - 1) {
                                    // console.log("B");
                                    // console.log(placemark);
                                }
                            }
                        });


                    });


                    // console.log(color['undefined']);
                    // console.log(color[undefined]);
                    // console.log(color[placemark[0].userProperties["none"]]);


                });

                $("#switchMethod").on('click', function () {
                    // $("#switchLayer").css('pointer-events', (this.checked === true) ? 'auto' : 'none');
                    // console.log($($("#switchLayer")[0].parentElement));
                    var switchLayer = $($("#switchLayer")[0].parentElement);
                    switchLayer.css('pointer-events', (this.checked === true) ? 'none' : 'auto');
                    $("#manualSwitch").css('display', (this.checked === true) ? 'none' : 'block');
                });

                $("#switchLayer").on("click", function () {
                    // this.checked, true: placemark, false: heatmap
                    // console.log(this.checked + "   " + !this.checked);

                    document.getElementById("placemarkButton").style.pointerEvents = (this.checked === true) ? "auto" : "none";

                    newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].enabled = !this.checked;

                    if (this.checked) {
                        $("#placemarkButton").find("input").each(function () {
                            if ($(this).is(':checked')) {
                                var id = "#" + $(this)[0].id;

                                $(id).click();
                            }
                        })
                    } else {
                        for (var i = 0; i < placemark.length; i++) {
                            var circle = document.createElement("canvas"),
                                ctx = circle.getContext('2d'),
                                radius = 15,
                                r2 = radius + radius;

                            circle.width = circle.height = r2;

                            var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);

                            gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');

                            ctx.beginPath();
                            ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

                            ctx.fillStyle = gradient;
                            ctx.fill();

                            ctx.closePath();

                            placemark[i].updateImage = true;
                            placemark[i].attributes.imageSource.image = circle;
                        }
                    }

                    // for (var i = layers.length; i < newGlobe.wwd.layers.length; i++) {
                    //     if (i === newGlobe.wwd.layers.length - 1) {
                    //         newGlobe.wwd.layers[i].enabled = !this.checked;
                    //         // console.log(newGlobe.wwd.layers);
                    //     } else {
                    //         newGlobe.wwd.layers[i].enabled = this.checked;
                    //     }
                    // }
                });

                $(".sortButton").on("click", function () {
                    var category = this.id;
                    // console.log(category);

                    // this.setAttribute('data-status', (this.getAttribute("data-status") === 'true') ? 'false' : 'true');
                    var status = this.getAttribute("data-status");
                    $(".sortButton").attr('data-status', 'false');
                    this.setAttribute('data-status', (status === 'true') ? 'false' : 'true');
                    status = !(status === 'true');

                    $(".sortButton").find("span").html("");
                    $(this).find("span").html(status ? " &#9650;" : " &#9660;");

                    $(".sortButton").css("background-color", "rgb(128, 128, 128)");
                    $(this).css("background-color", "rgb(0, 128, 255)");

                    function sort(arr, isNotReverse) {
                        arr.sort(function (a, b) {
                            // console.log($(a).attr("data-" + category), $(b).attr("data-" + category));
                            // if(a.id > b.id) return  isReverse ? -1 : 1;
                            // if(a.id < b.id) return isReverse ? 1 : -1;
                            if ($(a).attr("data-" + category) > $(b).attr("data-" + category)) return isNotReverse ? 1 : -1;
                            if ($(a).attr("data-" + category) < $(b).attr("data-" + category)) return isNotReverse ? -1 : 1;
                            return 0;
                        });
                        return arr;
                    }

                    var parent = $("#layerMenu");
                    // console.log(status);
                    var arr = sort(parent.children(), status);
                    // console.log(arr);
                    arr.detach().appendTo(parent);

                    if (clickedLayer) {
                        $("#" + clickedLayer).detach().prependTo(parent);
                    }
                });

                function moveList(id) {
                    // if (clickedLayer) {
                    //     $("#" + clickedLayer).remove();
                    //     var hiddenElement = $("#" + clickedLayer + "_hidden");
                    //     hiddenElement.show();
                    //     hiddenElement.attr('id', clickedLayer);
                    //     clickedLayer = "";
                    // } else {
                    //
                    // }

                    // if (!clickedLayer) {
                    //     clickedLayer = id;
                    //
                    //     var item = $("#" + clickedLayer);
                    //     var clone = $("#" + clickedLayer).clone();
                    //     item.attr('id', clickedLayer + "_hidden");
                    //     item.hide();
                    //     clone.css('background-color', 'rgb(191, 191, 191)');
                    //     clone.prependTo($("#layerMenu"));
                    //     refreshEvent();
                    // } else if (clickedLayer === id) {
                    //     $("#" + clickedLayer).remove();
                    //     var hiddenElement = $("#" + clickedLayer + "_hidden");
                    //     hiddenElement.show();
                    //     hiddenElement.attr('id', clickedLayer);
                    //     clickedLayer = "";
                    //     refreshEvent();
                    // } else if (clickedLayer !== id) {
                    //     // console.log(clickedLayer + "!==" + id);
                    //     console.log($(".layers"));
                    //     $("#" + clickedLayer).remove();
                    //     console.log($(".layers"));
                    //     // var hiddenElement = $("#" + clickedLayer + "_hidden");
                    //     // console.log(hiddenElement);
                    //     // hiddenElement.show();
                    //     // hiddenElement.attr('id', clickedLayer);
                    //     // console.log(clickedLayer);
                    //
                    //     clickedLayer = id;
                    //     // console.log(clickedLayer);
                    //
                    //     // var item = $("#" + clickedLayer);
                    //     // var clone = $("#" + clickedLayer).clone();
                    //     // item.attr('id', clickedLayer + "_hidden");
                    //     // item.hide();
                    //     // clone.css('background-color', 'rgb(191, 191, 191)');
                    //     // clone.prependTo($("#layerMenu"));
                    //     // refreshEvent();
                    // }

                    if (!clickedLayer) {
                        clickedLayer = id;

                        var item = $("#" + clickedLayer);
                        item.css('background-color', 'rgb(191, 191, 191)');
                        item.prependTo($("#layerMenu"));
                        refreshEvent();
                    } else if (clickedLayer === id) {
                        clickedLayer = "";
                        $(".sortButton").find("span").each(function () {
                            if ($(this).html()) {
                                var id = "#" + $(this)[0].parentElement.id;

                                $(id).click();
                                $(id).click();
                            }
                        })

                    } else if (clickedLayer !== id) {
                        clickedLayer = id;

                        var item = $("#" + clickedLayer);
                        item.css('background-color', 'rgb(191, 191, 191)');
                        item.prependTo($("#layerMenu"));
                        refreshEvent();
                    }

                    function refreshEvent() {
                        $(".layer").off('click', highlightLayer);
                        $(".layer").on('click', highlightLayer);
                    }
                }

                function highlightLayer(e) {
                    // console.log("Z");

                    var id = this.id;

                    // if (id === suggestedLayer) {
                    //     clearHighlight(true, false);
                    // }

                    clearHighlight(true, false);

                    if (!$("#switchLayer").is(':checked')) {
                        $("#switchLayer").click();
                    }

                    // console.log(clickedLayer);
                    // console.log(newGlobe.wwd.layers[clickedLayer]);
                    // console.log(newGlobe.wwd.layers[clickedLayer].renderables);

                    // if (e.handleObj.type === "click") {
                    //
                    // } else if (e.handleObj.type === "") {
                    //
                    // }

                    // var renderables = newGlobe.wwd.layers[this.id].renderables;
                    //
                    // for (var i = 0; i < renderables.length; i++) {
                    //
                    //     renderables[i].highlighted = (e.handleObj.type === "mouseover") ? true : false;
                    //
                    //     // if (i === renderables.length - 1) {
                    //     //     newGlobe.wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function() {
                    //     //         layerMenu();
                    //     //     });
                    //     // }
                    // }

                    // console.log(clickedLayer + "   " + id);
                    if (clickedLayer && clickedLayer !== id) {
                        // var oldRenderables = newGlobe.wwd.layers[clickedLayer].renderables;
                        // var status = (clickedLayer === id);
                        // for (var z = 0; z < oldRenderables.length; z++) {
                        //     // oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                        //     oldRenderables[z].highlighted = status;
                        //
                        //     if (z === oldRenderables.length - 1) {
                        //         highlight();
                        //     }
                        // }

                        var oldLayerIndex = clickedLayer.toString().split('-');
                        var status = (clickedLayer === id);
                        for (var z = 0; z < oldLayerIndex.length; z++) {
                            // oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                            newGlobe.wwd.layers[oldLayerIndex[z]].renderables[0].highlighted = status;

                            if (z === oldLayerIndex.length - 1) {
                                highlight();
                            }
                        }
                    } else {
                        highlight();
                    }


                    function highlight() {

                        // var renderables = newGlobe.wwd.layers[id].renderables;
                        // // console.log("C");
                        // for (var i = 0; i < renderables.length; i++) {
                        //
                        //     renderables[i].highlighted = !renderables[i].highlighted;
                        //
                        //     if (i === renderables.length - 1) {
                        //         // console.log(renderables[0].position.latitude, renderables[0].position.longitude);
                        //         // console.log(newGlobe.wwd.goToAnimator);
                        //
                        //         if (newGlobe.wwd.goToAnimator.targetPosition.latitude === renderables[0].position.latitude && newGlobe.wwd.goToAnimator.targetPosition.longitude === renderables[0].position.longitude) {
                        //             layerMenu();
                        //             // console.log("B");
                        //             moveList(id);
                        //         } else {
                        //             newGlobe.wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function () {
                        //                 layerMenu();
                        //                 // console.log("A");
                        //                 moveList(id);
                        //             });
                        //         }
                        //     }
                        // }

                        var layerIndex = id.toString().split('-');
                        // console.log("C");
                        for (var i = 0; i < layerIndex.length; i++) {

                            newGlobe.wwd.layers[layerIndex[i]].renderables[0].highlighted = !newGlobe.wwd.layers[layerIndex[i]].renderables[0].highlighted;

                            if (i === layerIndex.length - 1) {
                                // console.log(renderables[0].position.latitude, renderables[0].position.longitude);
                                // console.log(newGlobe.wwd.goToAnimator);

                                if (newGlobe.wwd.goToAnimator.targetPosition.latitude === newGlobe.wwd.layers[layerIndex[0]].renderables[0].position.latitude && newGlobe.wwd.goToAnimator.targetPosition.longitude === newGlobe.wwd.layers[layerIndex[0]].renderables[0].position.longitude) {
                                    totalWTCap();
                                    layerMenu();
                                    // console.log("B");
                                    moveList(id);
                                } else {
                                    newGlobe.wwd.goTo(new WorldWind.Position(newGlobe.wwd.layers[layerIndex[0]].renderables[0].position.latitude, newGlobe.wwd.layers[layerIndex[0]].renderables[0].position.longitude), function () {
                                        totalWTCap();
                                        layerMenu();
                                        // console.log("A");
                                        moveList(id);
                                    });
                                }
                            }
                        }
                    }

                    // var id = this.id;
                    //
                    // if (id !== clickedLayer && clickedLayer) {
                    //     var oldRenderables = newGlobe.wwd.layers[clickedLayer].renderables;
                    //     for (var z = 0; z < oldRenderables.length; z++) {
                    //         oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                    //     }
                    // }
                    //
                    //
                    // var renderables = newGlobe.wwd.layers[this.id].renderables;
                    // for (var i = 0; i < renderables.length; i++) {
                    //
                    //     renderables[i].highlighted = !renderables[i].highlighted;
                    //
                    //     if (i === renderables.length - 1) {
                    //         newGlobe.wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function () {
                    //             layerMenu();
                    //             console.log("A");
                    //             moveList(id);
                    //         });
                    //     }
                    // }
                }

                newGlobe.wwd.worldWindowController.__proto__.handleWheelEvent = function (event) {
                    var navigator = this.wwd.navigator;
                    // Normalize the wheel delta based on the wheel delta mode. This produces a roughly consistent delta across
                    // browsers and input devices.
                    var normalizedDelta;
                    if (event.deltaMode === WheelEvent.DOM_DELTA_PIXEL) {
                        normalizedDelta = event.deltaY;
                    } else if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
                        normalizedDelta = event.deltaY * 40;
                    } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
                        normalizedDelta = event.deltaY * 400;
                    }

                    // Compute a zoom scale factor by adding a fraction of the normalized delta to 1. When multiplied by the
                    // navigator's range, this has the effect of zooming out or zooming in depending on whether the delta is
                    // positive or negative, respectfully.
                    var scale = 1 + (normalizedDelta / 1000);

                    // Apply the scale to this navigator's properties.
                    navigator.range *= scale;
                    this.applyLimits();
                    this.wwd.redraw();

                    autoSwitch();
                    totalWTCap();
                    layerMenu();
                    clearHighlight(true, true);
                };

                newGlobe.wwd.worldWindowController.__proto__.handlePanOrDrag3D = function (recognizer) {
                    // var state = recognizer.state,
                    //     tx = recognizer.translationX,
                    //     ty = recognizer.translationY;
                    //
                    // var navigator = this.wwd.navigator;
                    //
                    // // this.lastPoint or navigator.lastPoint
                    // // console.log(this.lastPoint);
                    // // console.log(navigator.lastPoint);
                    //
                    // if (state === WorldWind.BEGAN) {
                    //     this.lastPoint.set(0, 0);
                    //     // navigator.lastPoint.set(0, 0);
                    // } else if (state === WorldWind.CHANGED) {
                    //     // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
                    //     // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
                    //     // to arc degrees.
                    //     var canvas = this.wwd.canvas,
                    //         globe = this.wwd.globe,
                    //         globeRadius = WWMath.max(globe.equatorialRadius, globe.polarRadius),
                    //         distance = WWMath.max(1, navigator.range),
                    //         metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                    //         forwardMeters = (ty - navigator.lastPoint[1]) * metersPerPixel,
                    //         sideMeters = -(tx - navigator.lastPoint[0]) * metersPerPixel,
                    //         forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                    //         sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;
                    //
                    //     // Apply the change in latitude and longitude to this navigator, relative to the current heading.
                    //     var sinHeading = Math.sin(navigator.heading * Angle.DEGREES_TO_RADIANS),
                    //         cosHeading = Math.cos(navigator.heading * Angle.DEGREES_TO_RADIANS);
                    //
                    //     navigator.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
                    //     navigator.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;
                    //     this.lastPoint.set(tx, ty);
                    //     // navigator.lastPoint.set(tx, ty);
                    //     this.applyLimits();
                    //     this.wwd.redraw();
                    //
                    //     totalWTCap();
                    //     layerMenu();
                    //     clearHighlight(true, true);
                    // }

                    var state = recognizer.state,
                        tx = recognizer.translationX,
                        ty = recognizer.translationY;

                    var navigator = this.wwd.navigator;
                    if (state === WorldWind.BEGAN) {
                        this.lastPoint.set(0, 0);
                    } else if (state === WorldWind.CHANGED) {
                        // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
                        // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
                        // to arc degrees.
                        var canvas = this.wwd.canvas,
                            globe = this.wwd.globe,
                            globeRadius = WWMath.max(globe.equatorialRadius, globe.polarRadius),
                            distance = WWMath.max(1, navigator.range),
                            metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                            forwardMeters = (ty - this.lastPoint[1]) * metersPerPixel,
                            sideMeters = -(tx - this.lastPoint[0]) * metersPerPixel,
                            forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                            sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;

                        // Apply the change in latitude and longitude to this navigator, relative to the current heading.
                        var sinHeading = Math.sin(navigator.heading * Angle.DEGREES_TO_RADIANS),
                            cosHeading = Math.cos(navigator.heading * Angle.DEGREES_TO_RADIANS);

                        navigator.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
                        navigator.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;
                        this.lastPoint.set(tx, ty);
                        this.applyLimits();
                        this.wwd.redraw();

                        totalWTCap();
                        layerMenu();
                        clearHighlight(true, true);
                    }
                };

                newGlobe.wwd.worldWindowController.allGestureListeners[0].__proto__.handleZoom = function (e, control) {
                    var handled = false;
                    // Start an operation on left button down or touch start.
                    if (this.isPointerDown(e) || this.isTouchStart(e)) {
                        this.activeControl = control;
                        this.activeOperation = this.handleZoom;
                        e.preventDefault();
                        if (this.isTouchStart(e)) {
                            this.currentTouchId = e.changedTouches.item(0).identifier; // capture the touch identifier
                        }
                        // This function is called by the timer to perform the operation.
                        var thisLayer = this; // capture 'this' for use in the function
                        var setRange = function () {
                            if (thisLayer.activeControl) {
                                if (thisLayer.activeControl === thisLayer.zoomInControl) {
                                    thisLayer.newGlobe.wwd.navigator.range *= (1 - thisLayer.zoomIncrement);
                                } else if (thisLayer.activeControl === thisLayer.zoomOutControl) {
                                    thisLayer.newGlobe.wwd.navigator.range *= (1 + thisLayer.zoomIncrement);
                                }
                                thisLayer.newGlobe.wwd.redraw();

                                // autoSwitch();
                                // console.log(newGlobe.wwd.layers[0].eyeText.text);
                                setTimeout(function () {
                                    autoSwitch();
                                    totalWTCap();
                                    layerMenu();
                                    clearHighlight(true, true);
                                }, 25);

                                setTimeout(setRange, 50);
                            }
                        };

                        setTimeout(setRange, 50);
                        handled = true;
                    }
                    return handled;
                };

                newGlobe.wwd.worldWindowController.allGestureListeners[0].__proto__.handlePan = function (e, control) {
                    var handled = false;
                    // Capture the current position.
                    if (this.isPointerDown(e) || this.isPointerMove(e)) {
                        this.currentEventPoint = this.wwd.canvasCoordinates(e.clientX, e.clientY);
                    } else if (this.isTouchStart(e) || this.isTouchMove(e)) {
                        var touch = e.changedTouches.item(0);
                        this.currentEventPoint = this.wwd.canvasCoordinates(touch.clientX, touch.clientY);
                    }
                    // Start an operation on left button down or touch start.
                    if (this.isPointerDown(e) || this.isTouchStart(e)) {
                        this.activeControl = control;
                        this.activeOperation = this.handlePan;
                        e.preventDefault();
                        if (this.isTouchStart(e)) {
                            this.currentTouchId = e.changedTouches.item(0).identifier; // capture the touch identifier
                        }
                        // This function is called by the timer to perform the operation.
                        var thisLayer = this; // capture 'this' for use in the function
                        var setLookAtLocation = function () {
                            if (thisLayer.activeControl) {
                                var dx = thisLayer.panControlCenter[0] - thisLayer.currentEventPoint[0],
                                    dy = thisLayer.panControlCenter[1]
                                        - (thisLayer.newGlobe.wwd.viewport.height - thisLayer.currentEventPoint[1]),
                                    oldLat = thisLayer.newGlobe.wwd.navigator.lookAtLocation.latitude,
                                    oldLon = thisLayer.newGlobe.wwd.navigator.lookAtLocation.longitude,
                                    // Scale the increment by a constant and the relative distance of the eye to the surface.
                                    scale = thisLayer.panIncrement
                                        * (thisLayer.newGlobe.wwd.navigator.range / thisLayer.newGlobe.wwd.globe.radiusAt(oldLat, oldLon)),
                                    heading = thisLayer.newGlobe.wwd.navigator.heading + (Math.atan2(dx, dy) * Angle.RADIANS_TO_DEGREES),
                                    distance = scale * Math.sqrt(dx * dx + dy * dy);
                                Location.greatCircleLocation(thisLayer.newGlobe.wwd.navigator.lookAtLocation, heading, -distance,
                                    thisLayer.newGlobe.wwd.navigator.lookAtLocation);
                                thisLayer.newGlobe.wwd.redraw();

                                // console.log(newGlobe.wwd.navigator.lookAtLocation);
                                // layerMenu();
                                // clearHighlight(true, true);
                                setTimeout(function () {
                                    totalWTCap();
                                    layerMenu();
                                    clearHighlight(true, true);
                                }, 25);

                                setTimeout(setLookAtLocation, 50);
                            }
                        };
                        setTimeout(setLookAtLocation, 50);
                        handled = true;
                    }
                    return handled;

                };

                function autoSwitch() {
                    if ($("#switchMethod").is(':checked')) {
                        var altitude = newGlobe.wwd.layers[0].eyeText.text;

                        if (altitude.substring(altitude.length - 2, altitude.length) === "km") {
                            altitude = altitude.replace(/Eye  |,| km/g, '');
                        } else {
                            altitude = (altitude.replace(/Eye  |,| m/g, '')) / 1000;
                        }

                        if (altitude <= mainconfig.eyeDistance_Heatmap && !$("#switchLayer").is(':checked')) {
                            $("#switchLayer").click();
                            $("#switchNote").html("");
                            $("#switchNote").append("NOTE: Toggle switch to temporarily view density heatmap.");
                            $("#globeNote").html("");
                            $("#globeNote").append("NOTE: Zoom in to an eye distance of more than 4,500 km to view the density heatmap.");

                        } else if (altitude > mainconfig.eyeDistance_Heatmap && $("#switchLayer").is(':checked')) {
                            $("#switchNote").html("");
                            $("#switchNote").append("NOTE: Toggle switch to temporarily view point locations.");
                            $("#globeNote").html("");
                            $("#globeNote").append("NOTE: Zoom in to an eye distance of less than 4,500 km to view the point locations.");

                            $("#switchLayer").click();
                        }

                        if (altitude <= mainconfig.eyeDistance_PL && $("#switchLayer").is(':checked')) {
                            $("#menuNote").html("");
                            $("#menuNote").append("NOTE: Click the items listed below in the menu to fly to and highlight point location(s).");
                        } else if (altitude > mainconfig.eyeDistance_PL && $("#switchLayer").is(':checked')) {
                            $("#menuNote").html("");
                            $("#menuNote").append("NOTE: Zoom in to an eye distance of less than 1,500 km to display a menu for wind turbines.");
                        }
                    }
                }

                function totalWTCap() {
                    // if ($("#switchLayer").is(':checked')) {
                    //     var clientRect = newGlobe.wwd.canvas.getBoundingClientRect();
                    //     var region = new WorldWind.Rectangle(
                    //         0,
                    //         clientRect.height,
                    //         clientRect.width,
                    //         clientRect.height);
                    //
                    //     var pickList = newGlobe.wwd.pickShapesInRegion(region);
                    //
                    //     var totalWT = 0;
                    //     var totalCap = 0;
                    //
                    //     for (var q = 0; q < pickList.objects.length; q++) {
                    //         var pickedPL = pickList.objects[q].userObject;
                    //         if (pickedPL instanceof WorldWind.Placemark) {
                    //             totalWT++;
                    //             if (pickedPL.userProperties.p_avgcap !== "N/A") {
                    //                 totalCap += pickedPL.userProperties.p_avgcap;
                    //             }
                    //         }
                    //
                    //         if (q === pickList.objects.length - 1) {
                    //             // console.log(totalWT);
                    //             // console.log(totalCap);
                    //             $("#totalWTCap").html("Showing <strong>" + totalWT + "</strong> turbines on screen with a total rated capacity of <strong>" + Math.round(totalCap) + "</strong> MW");
                    //         }
                    //     }
                    //
                    //     pickList = [];
                    // }

                    var totalWT = 0;
                    var totalCap = 0;

                    for (var i = layers.length; i < newGlobe.wwd.layers.length - 1; i++) {

                        if (newGlobe.wwd.layers[i].inCurrentFrame) {
                            totalWT++;
                            if (newGlobe.wwd.layers[i].renderables[0].userProperties.p_avgcap !== "N/A") {
                                totalCap += newGlobe.wwd.layers[i].renderables[0].userProperties.p_avgcap;
                            }
                        }

                        if (i === newGlobe.wwd.layers.length - 2) {
                            // console.log(totalWT);
                            // console.log(totalCap);
                            $("#totalWTCap").html("Showing <strong>" + totalWT + "</strong> turbines on screen with a total rated capacity of <strong>" + Math.round(totalCap) + "</strong> MW");
                        }
                    }
                }

                function layerMenu() {
                    var altitude = newGlobe.wwd.layers[0].eyeText.text;

                    if (altitude.substring(altitude.length - 2, altitude.length) === "km") {
                        altitude = altitude.replace(/Eye  |,| km/g, '');
                    } else {
                        altitude = (altitude.replace(/Eye  |,| m/g, '')) / 1000;
                    }

                    $("#layerMenu").empty();
                    $("#layerMenuButton").hide();

                    if (altitude <= mainconfig.eyeDistance_PL) {
                        // console.log(newGlobe.wwd.layers);
                        var projectNumber = 0;
                        var id;
                        var previousProject;

                        for (var i = layers.length; i < newGlobe.wwd.layers.length - 1; i++) {

                            if (newGlobe.wwd.layers[i].inCurrentFrame) {
                                var projectName = newGlobe.wwd.layers[i].renderables[0].userProperties.p_name,
                                    state = newGlobe.wwd.layers[i].renderables[0].userProperties.t_state,
                                    year = newGlobe.wwd.layers[i].renderables[0].userProperties.p_year,
                                    number = newGlobe.wwd.layers[i].renderables[0].userProperties.p_tnum,
                                    cap = newGlobe.wwd.layers[i].renderables[0].userProperties.p_cap,
                                    avgcap = newGlobe.wwd.layers[i].renderables[0].userProperties.p_avgcap;

                                if (i === layers.length || projectName !== previousProject) {
                                    id = i;
                                    $("#layerMenu").append($("<div id='" + i + "' data-name='" + projectName + "' data-year='" + year + "' data-capacity='" + avgcap + "' class='layers'>" +
                                        "<p><strong>" + projectName + ", " + state + "</strong></p>" +
                                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Year Online: " + year + "</p>" +
                                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;" + number + " Turbines</p>" +
                                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Total Capacity: " + cap + ((cap === "N/A") ? "" : " MW") + "</p>" +
                                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Rated Capacity: " + avgcap + ((avgcap === "N/A") ? "" : " MW") + "</p>" +
                                        "</div>"));
                                    projectNumber++;
                                } else {
                                    $("#" + id).attr('id', id + "-" + i);
                                    id += ('-' + i);
                                }

                                previousProject = projectName;
                            }

                            if (i === newGlobe.wwd.layers.length - 2) {
                                $("#projectNumber").html(projectNumber);
                                $("#layerMenuButton").show();
                                // $(".layers").on('mouseenter', highlightLayer);
                                // $(".layers").on('mouseleave', highlightLayer);
                                $(".layers").on('click', highlightLayer);
                            }
                        }
                    }
                }

                function clearHighlight(suggested, clicked) {
                    if (suggestedLayer && suggested) {
                        // var layer = newGlobe.wwd.layers[suggestedLayer];
                        // for (var i = 0; i < layer.renderables.length; i++) {
                        //     layer.renderables[i].highlighted = false;
                        //
                        //     if (i === layer.renderables.length - 1) {
                        //         suggestedLayer = "";
                        //     }
                        // }

                        var layerIndex = suggestedLayer.toString().split('-');
                        for (var i = 0; i < layerIndex.length; i++) {
                            newGlobe.wwd.layers[layerIndex[i]].renderables[0].highlighted = false;

                            if (i === layerIndex.length - 1) {
                                suggestedLayer = "";
                            }
                        }
                    }

                    if (clickedLayer && clicked) {
                        // var layer = newGlobe.wwd.layers[clickedLayer];
                        // for (var i = 0; i < layer.renderables.length; i++) {
                        //     layer.renderables[i].highlighted = false;
                        //
                        //     if (i === layer.renderables.length - 1) {
                        //         moveList(clickedLayer);
                        //     }
                        // }

                        var layerIndex = clickedLayer.toString().split('-');
                        for (var i = 0; i < layerIndex.length; i++) {
                            newGlobe.wwd.layers[layerIndex[i]].renderables[0].highlighted = false;

                            if (i === layerIndex.length - 1) {
                                clickedLayer = "";
                            }
                        }
                    }
                }

                function handleMouseMove(o) {

                    if ($("#popover").is(":visible")) {
                        $("#popover").hide();
                    }

                    // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
                    // the mouse or tap location.
                    var x = o.clientX,
                        y = o.clientY;

                    // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
                    // relative to the upper left corner of the canvas rather than the upper left corner of the page.

                    var pickList = newGlobe.wwd.pick(newGlobe.wwd.canvasCoordinates(x, y));
                    // console.log(pickList.objects);
                    for (var q = 0; q < pickList.objects.length; q++) {
                        var pickedPL = pickList.objects[q].userObject;
                        // console.log(pickedPL);
                        if (pickedPL instanceof WorldWind.Placemark) {
                            // console.log("A");

                            var xOffset = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
                            var yOffset = Math.max(document.documentElement.scrollTop, document.body.scrollTop);

                            var popover = document.getElementById('popover');
                            popover.style.position = "absolute";
                            popover.style.left = (x + xOffset - 3) + 'px';
                            popover.style.top = (y + yOffset - 3) + 'px';

                            var content = "<p><strong>Project Name:</strong> " + pickedPL.userProperties.p_name +
                                "<br>" + "<strong>Year Online:</strong> " + pickedPL.userProperties.p_year +
                                "<br>" + "<strong>Rated Capacity:</strong> " + pickedPL.userProperties.p_avgcap +
                                "<br>" + "<strong>Total Height:</strong> " + pickedPL.userProperties.t_ttlh + "</p>";

                            $("#popover").attr('data-content', content);
                            $("#popover").show();
                        }
                    }

                    pickList = [];
                }

                $.ajax({
                    url: '/uswtdb',
                    type: 'GET',
                    dataType: 'json',
                    // data: data,
                    async: false,
                    success: function (resp) {
                        if (!resp.error) {
                            var data = [];
                            // var layerNames = [];
                            // var placemarkLayers = [];

                            var circle = document.createElement("canvas"),
                                ctx = circle.getContext('2d'),
                                radius = 10,
                                r2 = radius + radius;

                            circle.width = circle.height = r2;

                            var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
                            // gradient.addColorStop(0, "rgba(192, 192, 192, 0.25)");
                            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                            ctx.beginPath();
                            ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

                            ctx.fillStyle = gradient;
                            ctx.fill();
                            // ctx.strokeStyle = "rgb(255, 255, 255)";
                            // ctx.stroke();

                            ctx.closePath();
                            // console.log(new Date());

                            // var placemarkLayer = new WorldWind.RenderableLayer("USWTDB");

                            // console.log(newGlobe.wwd.goToAnimator);

                            for (var i = 0; i < resp.data.length; i++) {
                                // data[i] = new WorldWind.IntensityLocation(resp.data[i].ylat, resp.data[i].xlong, 1);
                                data[i] = new WorldWind.MeasuredLocation(resp.data[i].ylat, resp.data[i].xlong, 0.8);

                                var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
                                placemarkAttributes.imageSource = new WorldWind.ImageSource(circle);
                                placemarkAttributes.imageScale = 0.5;

                                var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                                highlightAttributes.imageScale = 2.0;

                                var placemarkPosition = new WorldWind.Position(resp.data[i].ylat, resp.data[i].xlong, 0);
                                placemark[i] = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                                placemark[i].altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                                placemark[i].highlightAttributes = highlightAttributes;
                                placemark[i].userProperties.p_name = resp.data[i].p_name;
                                placemark[i].userProperties.t_state = resp.data[i].t_state;
                                placemark[i].userProperties.p_year = (resp.data[i].p_year === -9999) ? 'N/A' : resp.data[i].p_year;
                                placemark[i].userProperties.p_tnum = resp.data[i].p_tnum;
                                placemark[i].userProperties.p_cap = (resp.data[i].p_cap === -9999) ? 'N/A' : resp.data[i].p_cap;
                                placemark[i].userProperties.p_avgcap = (resp.data[i].p_avgcap === -9999) ? 'N/A' : resp.data[i].p_avgcap;
                                placemark[i].userProperties.t_ttlh = (resp.data[i].t_ttlh === -9999) ? 'N/A' : resp.data[i].t_ttlh;
                                placemark[i].userProperties.p_year_color = resp.data[i].p_year_color;
                                placemark[i].userProperties.p_avgcap_color = resp.data[i].p_avgcap_color;
                                placemark[i].userProperties.t_ttlh_color = resp.data[i].t_ttlh_color;

                                // if ($.inArray(resp.data[i].p_name, layerNames) === -1) {
                                //     layerNames.push(resp.data[i].p_name);
                                //     placemarkLayers.push(new WorldWind.RenderableLayer(resp.data[i].p_name));
                                //     placemarkLayers[placemarkLayers.length - 1].enabled = false;
                                //     newGlobe.wwd.addLayer(placemarkLayers[placemarkLayers.length - 1]);
                                //     placemarkLayers[placemarkLayers.length - 1].addRenderable(placemark[i]);
                                // } else {
                                //     var index = $.inArray(resp.data[i].p_name, layerNames);
                                //     placemarkLayers[index].addRenderable(placemark[i]);
                                // }

                                // if (i === 0 || resp.data[i].p_name !== resp.data[i - 1].p_name) {
                                //     var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].p_name);
                                //     // placemarkLayer.enabled = false;
                                //     newGlobe.wwd.addLayer(placemarkLayer);
                                //     newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].addRenderable(placemark[i]);
                                //     autoSuggestion.push({"value": resp.data[i].p_name, "lati": resp.data[i].ylat, "long": resp.data[i].xlong, "i": newGlobe.wwd.layers.length - 1});
                                // } else {
                                //     newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].addRenderable(placemark[i]);
                                // }

                                var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].case_id);
                                newGlobe.wwd.addLayer(placemarkLayer);
                                newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].addRenderable(placemark[i]);

                                if (i === 0 || resp.data[i].p_name !== resp.data[i - 1].p_name) {
                                    autoSuggestion.push({
                                        "value": resp.data[i].p_name,
                                        "lati": resp.data[i].ylat,
                                        "long": resp.data[i].xlong,
                                        "i": newGlobe.wwd.layers.length - 1
                                    });
                                    // autoSuggestion.push({"value": resp.data[i].p_name, "lati": resp.data[i].ylat, "long": resp.data[i].xlong, "i": [newGlobe.wwd.layers.length - 1]});
                                } else {
                                    autoSuggestion[autoSuggestion.length - 1].i += ('-' + (newGlobe.wwd.layers.length - 1));
                                    // autoSuggestion[autoSuggestion.length - 1].i.push(newGlobe.wwd.layers.length - 1);
                                }

                                if (i === resp.data.length - 1) {
                                    // newGlobe.wwd.addLayer(placemarkLayer);
                                    // console.log("A");
                                    // console.log(new Date());
                                    // console.log(layerNames);
                                    // console.log(newGlobe.wwd.layers.length);
                                    // console.log(newGlobe.wwd.layers);

                                    // var z = 10;
                                    // var x = z;
                                    // setTimeout(function() {
                                    //     var showLayers = setInterval(function() {
                                    //         console.log(new Date());
                                    //         x += 100;
                                    //         for (; z < x; z++) {
                                    //             newGlobe.wwd.layers[z].enabled = true;
                                    //
                                    //             if (z === newGlobe.wwd.layers.length - 1) {
                                    //                 console.log(new Date());
                                    //                 clearInterval(showLayers);
                                    //                 break;
                                    //             }
                                    //         }
                                    //         // newGlobe.wwd.redraw();
                                    //     }, 500);
                                    // }, 10000);

                                    // console.log(data);
                                    var HeatMapLayer = new WorldWind.HeatMapLayer("Heatmap", data);

                                    HeatMapLayer.scale = ['#000000', '#ffffff', '#0ffff0', '#00ff00', '#ffff00', '#ff0000'];
                                    HeatMapLayer._gradient = {
                                        0: "#000000",
                                        0.4: "#ffffff",
                                        0.5: "#0ffff0",
                                        0.7: "#00ff00",
                                        0.9: "#ffff00",
                                        1: "#ff0000"
                                    };
                                    HeatMapLayer._radius = 8;
                                    HeatMapLayer._incrementPerIntensity = 1;
                                    //console.log(HeatMapLayer);

                                    //HeatMapLayer.enabled = false;
                                    //newGlobe.wwd.addLayer(HeatMapLayer);

                                    //newGlobe.wwd.goTo(new WorldWind.Position(37.0902, -95.7129, mainconfig.eyeDistance_initial));
                                    //console.log(newGlobe.wwd.layers);


                                }
                            }
                        }
                    }
                });

                // var locations = [];
                //
                // var latitude = [];
                // var longitude = [];
                // var measure = [];
                //
                // var randomYear = [];
                // var randomCap = [];
                // var randomHeight = [];
                //
                // for (var i = 0; i < 100; i++) {
                //     latitude = getRandomInRange(30, 40, 3);
                //     longitude = getRandomInRange(10, 30, 3);
                //     measure = getRandomInRange(1, 100, 3);
                //     locations.push(
                //         new WorldWind.MeasuredLocation(
                //             latitude,
                //             longitude,
                //             measure
                //         )
                //     );
                //
                //     randomYear = getRndInteger(1986, 2018);
                //     randomCap = (Math.random() * (4 - 0.01) + 0.01).toFixed(2);
                //     randomHeight = getRndInteger(5, 185);
                //     console.log(randomCap);
                //
                //     var p_year = "p_year=" + randomYear;
                //     var p_avgcap = "p_avgcap=" + randomCap;
                //     var t_ttlh = "t_ttlh=" + randomHeight;
                //
                //     var newLat = "latitude=" + latitude;
                //     var newLon = "longitude=" + longitude;
                //     var newMeasure = "measure=" + measure;
                //
                //     $.ajax({
                //         url: '/testLocations',
                //         method: "POST",
                //         data: newLat + "&" + newLon + "&" + newMeasure + "&" + p_year + "&" + p_avgcap + "&" + t_ttlh,
                //         dataType: 'json',
                //         success: function (result) {
                //             console.log(result);
                //         }
                //     });
                // }


                $.ajax({
                    url: '/testLocations',
                    type: 'GET',
                    dataType: 'json',
                    async: false,
                    success: function (resp) {
                        if (!resp.error) {
                            console.log(resp.data);
                            var data = [];
                            var circle = document.createElement("canvas"),
                                ctx = circle.getContext('2d'),
                                radius = 10,
                                r2 = radius + radius;

                            circle.width = circle.height = r2;

                            var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
                            gradient.addColorStop(0, "rgba(255, 255, 255, 0)");

                            ctx.beginPath();
                            ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);

                            ctx.fillStyle = gradient;
                            ctx.fill();

                            ctx.closePath();
                            for (var i = 0; i < resp.data.length; i++) {
                                data[i] = new WorldWind.MeasuredLocation(resp.data[i].latitude, resp.data[i].longitude, resp.data[i].measure);

                                var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
                                placemarkAttributes.imageSource = new WorldWind.ImageSource(circle);
                                placemarkAttributes.imageScale = 0.5;

                                var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                                highlightAttributes.imageScale = 2.0;

                                var placemarkPosition = new WorldWind.Position(resp.data[i].latitude, resp.data[i].longitude, resp.data[i].measure);
                                placemark[i] = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                                placemark[i].altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                                placemark[i].highlightAttributes = highlightAttributes;
                                placemark[i].userProperties.p_name = resp.data[i].p_name;
                                placemark[i].userProperties.t_state = resp.data[i].t_state;
                                placemark[i].userProperties.p_year = (resp.data[i].p_year === -9999) ? 'N/A' : resp.data[i].p_year;
                                placemark[i].userProperties.p_tnum = resp.data[i].p_tnum;
                                placemark[i].userProperties.p_cap = (resp.data[i].p_cap === -9999) ? 'N/A' : resp.data[i].p_cap;
                                placemark[i].userProperties.p_avgcap = (resp.data[i].p_avgcap === -9999) ? 'N/A' : resp.data[i].p_avgcap;
                                placemark[i].userProperties.t_ttlh = (resp.data[i].t_ttlh === -9999) ? 'N/A' : resp.data[i].t_ttlh;
                                placemark[i].userProperties.p_year_color = resp.data[i].p_year;
                                placemark[i].userProperties.p_avgcap_color = resp.data[i].p_avgcap;
                                placemark[i].userProperties.t_ttlh_color = resp.data[i].t_ttlh;


                                var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].case_id);
                                newGlobe.wwd.addLayer(placemarkLayer);
                                newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].addRenderable(placemark[i]);

                                if (i === 0 || resp.data[i].p_name !== resp.data[i - 1].p_name) {
                                    autoSuggestion.push({
                                        "value": resp.data[i].p_name,
                                        "lati": resp.data[i].latitude,
                                        "long": resp.data[i].longitude,
                                        "i": newGlobe.wwd.layers.length - 1
                                    });
                                } else {
                                    autoSuggestion[autoSuggestion.length - 1].i += ('-' + (newGlobe.wwd.layers.length - 1));
                                }

                                if (i === resp.data.length - 1) {
                                    // Add new HeatMap Layer with the points as the data source.
                                    var HeatMapLayer2 = new WorldWind.HeatMapLayer("Heatmap", data);
                                    HeatMapLayer2.scale = ['#000000', '#ffffff', '#0ffff0', '#00ff00', '#ffff00', '#ff0000'];
                                    HeatMapLayer2._gradient = {
                                        0: "#000000",
                                        0.4: "#ffffff",
                                        0.5: "#0ffff0",
                                        0.7: "#00ff00",
                                        0.9: "#ffff00",
                                        1: "#ff0000"
                                    };
                                    HeatMapLayer2._radius = 8;
                                    HeatMapLayer2._incrementPerIntensity = 1; //The value here should be between 0 and 1 to determine the maximum count
                                    // console.log(HeatMapLayer2);

                                    newGlobe.wwd.addLayer(HeatMapLayer2);
                                }
                            }
                        }
                    }
                });


                $("#autoSuggestion").autocomplete({
                    lookup: autoSuggestion,
                    lookupLimit: 5,
                    onSelect: function (suggestion) {
                        console.log(suggestion);
                        $("#autoSuggestion").val("");
                        clearHighlight(true, true);

                        newGlobe.wwd.goTo(new WorldWind.Position(suggestion.lati, suggestion.long, 50000), function () {
                            // console.log(newGlobe.wwd.layers[0].eyeText.text.substring(5, newGlobe.wwd.layers[0].eyeText.text.length - 3));
                            suggestedLayer = suggestion.i;
                            autoSwitch();
                            // console.log(newGlobe.wwd.layers[suggestion.i].inCurrentFrame);
                            // console.log(newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].inCurrentFrame);

                            setTimeout(function () {
                                // console.log(newGlobe.wwd.layers[suggestion.i].inCurrentFrame);
                                // console.log(newGlobe.wwd.layers[newGlobe.wwd.layers.length - 1].inCurrentFrame);
                                totalWTCap();
                                layerMenu();

                                console.log(suggestedLayer);
                                var layerIndex = suggestedLayer.toString().split('-');
                                console.log(layerIndex);
                                for (var i = 0; i < layerIndex.length; i++) {
                                    newGlobe.wwd.layers[layerIndex[i]].renderables[0].highlighted = true;
                                }
                            }, 1)
                        });
                    }
                });

                // $("#p_avgcap_color").click();

                // Listen for mouse moves and highlight the placemarks that the cursor rolls over.
                newGlobe.wwd.addEventListener("mousemove", handleMouseMove);
                $("#popover").popover({html: true, placement: "top", trigger: "hover"});
            })
        });
    });
