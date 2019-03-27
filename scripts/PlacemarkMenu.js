/*
* Copyright 2015-2017 WorldWind Contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/

requirejs(['./WorldWindShim',
        './LayerManager',
        './OptionList',
        '../src/heatmap/GlobeInterface',
        '../src/heatmap/Globe',
        '../src/heatmap/Controls',
        '../src/heatmap/HeatmapPanel'],
    function (WorldWind,
              LayerManager,
              OptionList,
              GlobeInterface,
              Globe,
              Controls,
              HeatmapPanel) {
        "use strict";

        var globeID = "canvasOne";

        // new ESTWA({globe: globeID});

        var globe = new Globe({id: globeID});
        var controls = new Controls(globe);
        var gInterface = new GlobeInterface(globe);

        var heatmapPanel = new HeatmapPanel(globe, gInterface.globe.navigator, gInterface.globe.worldWindowController, controls);


        // var wwd = new WorldWind.WorldWindow("canvasOne");
        //
        // // Standard WorldWind layers
        // var layers = [
        //     {layer: new WorldWind.BMNGLayer(), enabled: true},
        //     {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
        //     {layer: new WorldWind.BingAerialLayer(null), enabled: false},
        //     {layer: new WorldWind.BingAerialWithLabelsLayer(null), enabled: false},
        //     {layer: new WorldWind.BingRoadsLayer(null), enabled: false},
        //     {layer: new WorldWind.CompassLayer(), enabled: true},
        //     {layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true},
        //     {layer: new WorldWind.ViewControlsLayer(wwd), enabled: true}
        // ];
        //
        // for (var l = 0; l < layers.length; l++) {
        //     layers[l].layer.enabled = layers[l].enabled;
        //     wwd.addLayer(layers[l].layer);
        // }

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(globe);

         WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);
        globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

        // Web Map Service information from NASA's Near Earth Observations WMS
        // var serviceAddress = "http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=WMS&request=GetCapabilities&version=1.1.1";
        var serviceAddress = "https://cors.aworldbridgelabs.com/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities";

        var layerName = [];
        var preloadLayer = [];

        var layers = globe.layers;
        var checked = []; //selected toogle switch value
        // var val;
        var alertVal = true;
        var LayerSelected;
        var arrMenu = [];
        var checkedCount=0;
        var j = 0;
        // var LayerPosition = [];
        var Altitude;
        var allCheckedArray=[];
        var infobox;

        var location1 = infobox[k].Latitude;

        var location2 = infobox[k].Longitude;

        // var reqData = "'Latitude_and_Longitude_Decimal = "0,0"'"
        // Latitude_Longitude_and_Decimal = "value"

        $(document).ready(function() {

            $.ajax({
                url: 'position',
                type: 'GET',
                dataType: 'json',
                data:layerRequest,
                async: false,
                success: function (results) {
                    LayerSelected = results[0]; //Longitude: " ", Latitude: "", Altitude: "", ThirdLayer: "", LayerName: ""
                    console.log(LayerSelected);
                    Altitude = LayerSelected.Altitude * 1000;
                    globe.goTo(new WorldWind.Position(LayerSelected.Latitude,LayerSelected.Longitude,Altitude));

                }
            });


            var currentSelectedLayer = document.getElementById("currentSelectedLayer");
            var previousL = document.getElementById("previousL");
            var nextL = document.getElementById("nextL");

            currentSelectedLayer.value = "No Layer Selected";
            currentSelectedLayer.disabled = true;
            previousL.disabled = true;
            nextL.disabled = true;


        $('.placemarkLayer').click(function(){

            var val1;
            if ($('.placemarkLayer').is(":checkbox:checked")) {
                // alert("hi");

                $(':checkbox:checked').each(function () {
                    val1 = $(this).val();
                    // var str = val+'';
                    // val = str.split(",");
                    // console.log(val1);
                    // console.log(layers);

                    for (var a = 0; a < layers.length; a++) {

                        if (layers[a].displayName === val1) {
                            alert(layers[a].displayName + " works now!");
                            layers[a].enabled = true;

                        }
                    }
                });
            }

            if($('.placemarkLayer').is(":not(:checked)")) {
                // console.log("enable:false");
                var val2;
                $(":checkbox:not(:checked)").each(function (i) {
                    val2 = $(this).val();

                    // console.log(str);
                    // console.log(val2[i]);

                    // alert("it doesn't works");
                    // console.log(val);
                    // console.log("s"+val2s[a].displayName);
                    for (var a = 0; a < layers.length; a++) {
                        if (layers[a].displayName === val2) {

                            layers[a].enabled = false;

                            // console.log("str: " + layers[a].displayName);
                            // console.log(layers[a]);
                        }
                    }
                });
            }
        });
            var logError = function (jqXhr, text, exception) {
                console.log("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);
            };

            $.get(serviceAddress).done(createWMSLayer).fail(logError);
        var Placemark_Creation = function (RGB, latandlong, LayerName) {

            var placemark;
            var highlightAttributes;
            var placemarkLayer = new WorldWind.RenderableLayer(LayerName);
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
// console.log(latandlong[0]);


// Create the custom image for the placemark.

            var canvas = document.createElement("canvas"),
                ctx2d = canvas.getContext("2d"),
                size = 45, c = size / 2, innerRadius = 5, outerRadius = 15;

            canvas.width = size;
            canvas.height = size;
//This is the color of the placeholder and appearance (Most likely)
//             console.log(RGB);

            var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
            gradient.addColorStop(0, RGB[0]);
            gradient.addColorStop(0.5, RGB[1]);
            gradient.addColorStop(1, RGB[2]);


            ctx2d.fillStyle = gradient;
            ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
            ctx2d.fill();

            // var ImageLibrary = WorldWind.configuration.baseUrl + "home/Pics/" ;// location of the image files
            // console.log(ImageLibrary);


            // Set up the common placemark attributes.
            placemarkAttributes.imageScale = 0.75; //placemark size!
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0.5);
            placemarkAttributes.imageColor = WorldWind.Color.WHITE;


            placemark = new WorldWind.Placemark(new WorldWind.Position(location1, location2, 1e2), true, null);
            // placemark.label = "Placemark" + "\n"
            placemark.displayName = LayerName;
            //     + "Lat " + placemark.position.latitude.toPrecision(4).toString() + "\n"
            //     + "Lon " + placemark.position.longitude.toPrecision(5).toString();
            placemark.altitudeMode = WorldWind.RELATIVE_TO_GROUND;

            // Create the placemark attributes for this placemark. Note that the attributes differ only by their
            // image URL.
            placemarkAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            placemarkAttributes.imageSource = new WorldWind.ImageSource(canvas);
            placemark.attributes = placemarkAttributes;

            // Create the highlight attributes for this placemark. Note that the normal attributes are specified as
            // the default highlight attributes so that all properties are identical except the image scale.
            highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
            highlightAttributes.imageScale = 1.2;
            placemark.highlightAttributes = highlightAttributes;

            // console.log(placemark);

            // Add the placemark to the layer.
            placemarkLayer.addRenderable(placemark);
            placemarkLayer.enabled = false;
            // console.log(placemarkLayer);
            // console.log(placemark);
            globe.addLayer(placemarkLayer);
        };

        var highlightedItems= [];

        var handlePick = function (o) {

            // alert("ttyy");
            // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
            // the mouse or tap location.
            var x = o.clientX,
                y = o.clientY;

            var redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items

            // De-highlight any previously highlighted placemarks.
            for (var h = 0; h < highlightedItems.length; h++) {
                highlightedItems[h].highlighted = false;
            }
            highlightedItems = [];

            // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
            // relative to the upper left corner of the canvas rather than the upper left corner of the page.
            var pickList = globe .pick(globe.canvasCoordinates(x, y));
            if (pickList.objects.length > 0) {
                redrawRequired = true;
            }

            // Highlight the items picked by simply setting their highlight flag to true.
            if (pickList.objects.length > 0) {
                for (var p = 0; p < pickList.objects.length; p++) {
                    pickList.objects[p].userObject.highlighted = true;

                    // Keep track of highlighted items in order to de-highlight them later.
                    highlightedItems.push(pickList.objects[p].userObject);

                    // Detect whether the placemark's label was picked. If so, the "labelPicked" property is true.
                    // If instead the user picked the placemark's image, the "labelPicked" property is false.
                    // Applications might use this information to determine whether the user wants to edit the label
                    // or is merely picking the placemark as a whole.
                    if (pickList.objects[p].labelPicked) {
                        // console.log("Label picked");
                    }
                }
            }

            // Update the window if we changed anything.
            if (redrawRequired) {
                globe.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };


        var handleMouseCLK = function (a)   {
            var x = a.clientX,
                y = a.clientY;
            var pickListCLK = globe.pick(globe.canvasCoordinates(x, y));
            // console.log(pickListCLK);
            for (var m = 0; m < pickListCLK.objects.length; m++) {
                // console.log (pickListCLK.objects[m].position.latitude);
                var pickedPM = pickListCLK.objects[m].userObject;
                if (pickedPM instanceof WorldWind.Placemark) {

                    // sitePopUp(pickedPM.label);
                    // alert(pickedPM.label);
                    sitePopUp(pickListCLK.objects[m].position.latitude, pickListCLK.objects[m].position.longitude);
                    // sitePopUp(pickListCLK.objects[m].position.longitude);
// console.log(pickedPM);

                    $(document).ready(function () {

                        var modal = document.getElementById('popupBox');
                        var span = document.getElementById('closeIt');

                        modal.style.display = "block";


                        span.onclick = function () {
                            modal.style.display = "none";

                            window.onclick = function (event) {
                                if (event.target === modal) {
                                    modal.style.display = "none";

                                }
                            }
                        }
                    });
                }
            }
        };

        var sitePopUp = function (location1, location2) {
            var popupBodyItem = $("#popupBody");
            var c = location1 + "," + location2;
            console.log(c);

            console.log(infobox);


            for (var k = 0, lengths = infobox.length; k < lengths; k++) {
                // alert("popup info");

                if (infobox[k].Longitude === c) {
                    // console.log("good-bye");
                    popupBodyItem.children().remove();
                    // alert(infobox[k].sitename);
                    //     alert("hi");

                    var popupBodyName = $('<p class="site-name"><h4>' + infobox[k].LayerName + '</h4></p>');
                    var popupBodyDesc = $('<p class="site-description">' + infobox[k].Site_Description + '</p><br>');
                    var fillerImages = $('<img style="width:100%; height:110%;" src="../images/Pics/' + infobox[k].Picture_Location + '"/>');
                    var imageLinks = $('<h6><strong><a href="' + infobox[k].Link_to_site_location + '">Website Link </a></strong></h6>');

                    popupBodyItem.append(popupBodyName);
                    popupBodyItem.append(popupBodyDesc);
                    popupBodyItem.append(fillerImages);
                    popupBodyItem.append(imageLinks);
                    break

                    // alert(popupBodyName);
                }
            }

            // alert("hello" + pmDescription[0].Layer_Name);
            // alert ("length: " + pmDescription.length);

            // for (var k = 0, lengths = pmDescription.length; k < lengths; k++) {
            //     var pmLayerName = pmDescription[k].Layer_Name;
            //     var pmSiteNam
            // e = pmDescription[k].Site_Name;
            //     var pmColor = pmDescription[k].Color;
            //     var pmPicLoc = pmDescription[k].Picture_Location;
            //
            //     // if (pmLayerName[k]) {
            //     //
            //     //     popupBodyItem.children().remove();
            //     //.
            //     // }
            // }
        };//
    });

});