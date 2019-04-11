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
*/

requirejs([
        './WorldWindShim',
        './LayerManager',
        './OptionList',
        './AutoMenu',
        '../src/ogc/wms/WmsLayerCapabilities'
        ],
    function (
        WorldWind,
        LayerManager
    ) {
        "use strict";
        // Load Globe
        var globe = new WorldWind.WorldWindow("canvasOne");

        var layers = [
            // {layer: new WorldWind.BMNGLayer(), enabled: true},
            // {layer: new WorldWind.BMNGLandsatLayer(), enabled: false},
            {layer: new WorldWind.BingAerialLayer(), enabled: false},
            {layer: new WorldWind.BingAerialWithLabelsLayer(), enabled: true},
            {layer: new WorldWind.BingRoadsLayer(), enabled: false},
            {layer: new WorldWind.CompassLayer(), enabled: true},
            {layer: new WorldWind.CoordinatesDisplayLayer(globe), enabled: true},
            {layer: new WorldWind.ViewControlsLayer(globe), enabled: true}
        ];

        for (var l = 0; l < layers.length; l++) {
            layers[l].layer.enabled = layers[l].enabled;
            globe.addLayer(layers[l].layer);
        }

        // Create a layer manager for controlling layer visibility.
        var layerManager = new LayerManager(globe);

        //Tell wouldwind to log only warnings and errors.
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_WARNING);

        globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));

        // Web Map Service information from NASA's Near Earth Observations WMS
        // var serviceAddress = "https://cors.aworldbridgelabs.com:9084/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities";
        var serviceAddress = "../config/ows.xml";

        var preloadWMSLayerName = [];
        // var highlightedItems= [];
        var preloadLayer = []; //preload entire layer name
        var layers = globe.layers;
        var bob=[];
        var checked = []; //selected toggle switch value
        var alertVal = true;
        var LayerSelected;
        var arrMenu = [];
        var checkedCount=0;
        var j = 0;
        var Altitude;
        var allCheckedArray=[];
        var nextL = $(".next");
        var previousL = $("#previousL");
        var currentSelectedLayer = $("#currentSelectedLayer");
        var infobox;

        function createWMSLayer (xmlDom) {

            // Create a WmsCapabilities object from the XML DOM
            var wms = new WorldWind.WmsCapabilities(xmlDom);

            // Retrieve a WmsLayerCapabilities object by the desired layer name
            for (var n = 0; n < preloadWMSLayerName.length; n++) {

                var wmsLayerCapability = wms.getNamedLayer(preloadWMSLayerName[n]);

                if (!wmsLayerCapability) continue;

                // Form a configuration object from the wmsLayerCapability object
                var wmsConfig = WorldWind.WmsLayer.formLayerConfiguration(wmsLayerCapability);

                // Modify the configuration objects title property to a more user friendly title
                wmsConfig.title = preloadWMSLayerName[n];

                // Create the WMS Layer from the configuration object
                var wmsLayer = new WorldWind.WmsLayer(wmsConfig);

                wmsLayer.enabled = false;

                // Add the layers to WorldWind and update the layer manager
                globe.addLayer(wmsLayer);
                // console.log(globe.layers);
                layerManager.synchronizeLayerList();
            }

        }

        // Called if an error occurs during WMS Capabilities document retrieval
        function logError (jqXhr, text, exception) {
            console.log("There was a failure retrieving the capabilities document: " + text + " exception: " + exception);
        }

        function Placemark_Creation (RGB,PKValue, coLat, coLong, LayerName) {
            var placemark;
            var highlightAttributes;
            var placemarkLayer = new WorldWind.RenderableLayer(LayerName);
            var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);

            // Create the custom image for the placemark.
            var canvas = document.createElement("canvas"),
                ctx2d = canvas.getContext("2d"),
                size = 60, c = size / 2, innerRadius = 12, outerRadius = 20;

            canvas.width = size;
            canvas.height = size;
            //This is the color of the placeholder and appearance (Most likely)

            var gradient = ctx2d.createRadialGradient(c, c, innerRadius, c, c, outerRadius);
            gradient.addColorStop(0, RGB[0]);
            gradient.addColorStop(0.5, RGB[1]);
            gradient.addColorStop(1, RGB[2]);


            ctx2d.fillStyle = gradient;
            ctx2d.arc(c, c, outerRadius, 0, 2 * Math.PI, false);
            ctx2d.fill();

            // Set up the common placemark attributes.
            placemarkAttributes.imageScale = 0.75; //placemark size!
            placemarkAttributes.imageOffset = new WorldWind.Offset(
                WorldWind.OFFSET_FRACTION, 0.5,
                WorldWind.OFFSET_FRACTION, 0.5);
            placemarkAttributes.imageColor = WorldWind.Color.WHITE;

            placemark = new WorldWind.Placemark(new WorldWind.Position(coLat, coLong, 1e2), true, null);
            // console.log(PKValue);
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
            placemark.primarykeyAttributes = PKValue;

            // Add the placemark to the layer.
            placemarkLayer.addRenderable(placemark);
            placemarkLayer.enabled = false;
            // console.log(placemarkLayer);
            // console.log(placemark);
            globe.addLayer(placemarkLayer);
        }

        // function handlePick (o) {
        //
        //     // The input argument is either an Event or a TapRecognizer. Both have the same properties for determining
        //     // the mouse or tap location.
        //     var x = o.clientX,
        //         y = o.clientY;
        //
        //     var redrawRequired = highlightedItems.length > 0; // must redraw if we de-highlight previously picked items
        //
        //     // De-highlight any previously highlighted placemarks.
        //     for (var h = 0; h < highlightedItems.length; h++) {
        //         highlightedItems[h].highlighted = false;
        //     }
        //     highlightedItems = [];
        //
        //     // Perform the pick. Must first convert from window coordinates to canvas coordinates, which are
        //     // relative to the upper left corner of the canvas rather than the upper left corner of the page.
        //     var pickList = globe .pick(globe.canvasCoordinates(x, y));
        //     if (pickList.objects.length > 0) {
        //         redrawRequired = true;
        //     }
        //
        //     // Highlight the items picked by simply setting their highlight flag to true.
        //     if (pickList.objects.length > 0) {
        //         for (var p = 0; p < pickList.objects.length; p++) {
        //             pickList.objects[p].userObject.highlighted = true;
        //
        //             // Keep track of highlighted items in order to de-highlight them later.
        //             highlightedItems.push(pickList.objects[p].userObject);
        //
        //             // Detect whether the placemark's label was picked. If so, the "labelPicked" property is true.
        //             // If instead the user picked the placemark's image, the "labelPicked" property is false.
        //             // Applications might use this information to determine whether the user wants to edit the label
        //             // or is merely picking the placemark as a whole.
        //             if (pickList.objects[p].labelPicked) {
        //                 // console.log("Label picked");
        //             }
        //         }
        //     }
        //
        //     // Update the window if we changed anything.
        //     if (redrawRequired) {
        //         globe.redraw(); // redraw to make the highlighting changes take effect on the screen
        //     }
        // }

        function handleMouseCLK (a)   {
            var x = a.clientX,
                y = a.clientY;
            var pickListCLK = globe.pick(globe.canvasCoordinates(x, y));
            // console.log(pickListCLK);
            for (var m = 0; m < pickListCLK.objects.length; m++) {
                // console.log (pickListCLK.objects[m].position.latitude);
                var pickedPM = pickListCLK.objects[m].userObject;
                if (pickedPM instanceof WorldWind.Placemark) {

                    sitePopUp(pickListCLK.objects[m].userObject.primarykeyAttributes);

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
        }

        function sitePopUp (PKValue) {
            var popupBodyItem = $("#popupBody");
            var c = PKValue;

            for (var k = 0, lengths = infobox.length; k < lengths; k++) {
                if (infobox[k].PK === c) {
                    popupBodyItem.children().remove();

                    var popupBodyName = $('<p class="site-name"><h4>' + infobox[k].LayerName + '</h4></p>');
                    var popupBodyDesc = $('<p class="site-description">' + infobox[k].Site_Description + '</p><br>');
                    var fillerImages = $('<img style="width:100%; height:110%;" src="../images/Pics/' + infobox[k].Picture_Location + '"/>');
                    var imageLinks = $('<p class="site-link" <h6>Site Link: </h6></p><a href="' + infobox[k].Link_to_site_location + '">Click here to navigate to the site&#8217;s website </a>');
                    var copyrightStatus = $('<p  class="copyright" <h6>Copyright Status: </h6>' + infobox[k].Copyright + '</p><br>');
                    var coordinates = $('<p class="coordinate" <h6>Latitude and Longitude: </h6>'+ infobox[k].Latitude + infobox[k].Longitude + '</p><br>');

                    popupBodyItem.append(popupBodyName);
                    popupBodyItem.append(popupBodyDesc);
                    popupBodyItem.append(fillerImages);
                    popupBodyItem.append(imageLinks);
                    popupBodyItem.append(copyrightStatus);
                    popupBodyItem.append(coordinates);
                    break
                }
            }
        }

        function globlePosition (layerRequest){
            $.ajax({
                url: '/position',
                type: 'GET',
                dataType: 'json',
                data: layerRequest, //send the most current value of the selected switch to server-side
                async: false,
                success: function (results) {
                    LayerSelected = results[0];//the first object of an array --- Longitude: " ", Latitude: "", Altitude: "", ThirdLayer: "", LayerName: ""console.log(LayerSelected);
                    // console.log(LayerSelected);
                    Altitude = LayerSelected.Altitude * 1000;
                    globe.goTo(new WorldWind.Position(LayerSelected.Latitude, LayerSelected.Longitude, Altitude));
                }
            })
        }

        function buttonControl (allCheckedArray,layer1){
            if (alertVal){
                confirm("Some layers may take awhile to load. Please be patient.")
            }

            if (allCheckedArray.length > checkedCount){ //if there is new array was inserted into the allCheckedArray ( If user choose more than 1 switch)
                checked.push(layer1); //insert current value to "checked" array
                checkedCount = allCheckedArray.length; //checkedCount now equals to the numbers of arrays that were inserted to allCheckedArray
                alertVal = false; //alert (only appear at the first time)
                currentSelectedLayer.prop('value', LayerSelected.ThirdLayer); //if there are new array was inserted into the allCheckedArray,the value of the opened layer button equals to the name of the switch that user selected
                arrMenu.push(LayerSelected.ThirdLayer);

                //insert current ThirdLayer value to arrMenu
                j = arrMenu.length - 1; //count
                if(arrMenu.length === 1){ //if the length of arrMenu is equal to 1 /if user only checks one switch.
                    nextL.prop('disabled',true);
                    previousL.prop('disabled',true);
                    currentSelectedLayer.prop('disabled',false);
                }else{//if user checks over 1 switch
                    previousL.prop('disabled',false);
                    nextL.prop('disabled',true);
                }
                // LayerPosition.push(LayerSelected);
            } else { //if there is not new array was inserted into the allCheckedArray / If user un-checks a switch)
                for( var i = 0 ; i < checked.length; i++) {
                    if (checked[i] === layer1) {
                        checked.splice(i,1); //remove current value from checked array
                        arrMenu.splice(i,1); //remove current ThirdLayer from the array
                        // LayerPosition.splice(i,1); //remove current Latlong from the array
                    }
                }
                // val = checked[checked.length - 1];
                checkedCount = allCheckedArray.length;
                alertVal = false;
                currentSelectedLayer.prop('value',arrMenu[arrMenu.length - 1]);
                // currentSelectedLayer.prop('value',arrMenu[j]);
                // currentSelectedLayer.value = arrMenu[arrMenu.length - 1];
                j = arrMenu.length - 1;
                if(arrMenu.length === 1){
                    nextL.prop('disabled',true);
                    previousL.prop('disabled',true)
                }else{
                    if(arrMenu.length === 0){
                        // currentSelectedLayer.value = "No Layer Selected";
                        currentSelectedLayer.prop('value','No Layer Selected');
                        currentSelectedLayer.prop('disabled',true);
                        previousL.prop('disabled',true);
                        nextL.prop('disabled',true);
                        // globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
                    } else{
                        previousL.prop('disabled',false);
                        nextL.prop('disabled',true);
                    }
                }
            }

        }

        //preload function
        $(document).ready(function() {
            //preload placemark
            $.ajax({
                url: '/placemark',
                dataType: 'json',
                success: function(result) {
                    if (!result.err) {
                        infobox = result.data;
                        for (var k = 0; k < infobox.length; k++) {

                            var colorAttribute = infobox[k].Color;
                            var cAtwo = colorAttribute.split(" ");
                            var coLat = infobox[k].Latitude;
                            var coLong = infobox[k].Longitude;
                            var PK = infobox[k].PK;
                            var LayerName = infobox[k].LayerName;

                            Placemark_Creation(cAtwo, PK, coLat, coLong, LayerName);
                        }
                    }
                }
            });

            //the beginning value of the button
            currentSelectedLayer.prop('value','No Layer Selected');
            nextL.prop('disabled',true);
            previousL.prop('disabled',true);

            //preload wmsLayer
            $(".wmsLayer").each(function (i) {
                preloadLayer[i] = $(this).val();
            });

            var preloadLayerStr = preloadLayer + '';//change preloadLayer into a string
            preloadWMSLayerName = preloadLayerStr.split(",");//split preloadLayerStr with ","
            console.log(preloadWMSLayerName);
            $.get(serviceAddress).done(createWMSLayer).fail(logError);// get the xml file of wmslayer and pass the file into  createLayer function.

            // $('.placemarkLayer').click(function(){
            //
            //     var val1;
            //     if ($('.placemarkLayer').is(":checkbox:checked")) {
            //         alert("hi");
            //
            //         $(':checkbox:checked').each(function () {
            //             val1 = $(this).val();
            //             // var str = val+'';
            //             // val2 = str.split(",");
            //             console.log(val1);
            //             console.log(layers);
            //
            //             for (var a = 0; a < layers.length; a++) {
            //
            //                 if (layers[a].displayName === val1) {
            //                     alert(layers[a].displayName + " works now!");
            //
            //                     layers[a].enabled = true;
            //                     console.log(layers[a]);
            //                     // console.log('KEA_Wind_Turbine'); //find out how to console the problem
            //
            //                 }
            //             }
            //         });
            //     }
            //
            //     if($('.placemarkLayer').is(":not(:checked)")) {
            //         // console.log("enable:false");
            //         var val2;
            //         $(":checkbox:not(:checked)").each(function (i) {
            //             val2 = $(this).val();
            //             for (var a = 0; a < layers.length; a++) {
            //                 if (layers[a].displayName === val2) {
            //
            //                     layers[a].enabled = false;
            //
            //                     // console.log("str: " + layers[a].displayName);
            //                     // console.log(layers[a]);
            //                 }
            //             }
            //         });
            //     }
            // });

            $(".wmsLayer,.placemarkLayer").click(function () {
                var layer1 = $(this).val(); //the most current value of the selected switch
                allCheckedArray = $(':checkbox:checked');

                var layerRequest = 'layername=' + layer1;
                globlePosition(layerRequest);
                buttonControl(allCheckedArray,layer1);


                //turn on/off wmsLayer and placemark layer
                for (var a = 0; a < layers.length; a++) {
                    $(':checkbox:checked').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = true;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (eleValue) {
                                if (layers[a].displayName === eleValue) {
                                    layers[a].enabled = true;
                                }
                            });
                        }
                    });
                    $(':checkbox:not(:checked)').each(function () {
                        if (layers[a].displayName === $(this).val()) {
                            layers[a].enabled = false;
                        } else {
                            bob = $(this).val().split(",");
                            bob.forEach(function (ery) {
                                if (layers[a].displayName === ery) {
                                    layers[a].enabled = false;
                                }
                            });
                        }
                    })
                }
            });

            $('#previousL').click(function(){
                nextL.prop('disabled',false);
                if(j < 1){ //if there was only one switch was checked
                    previousL.prop('disabled',true) //
                }else{//if there was more than one switch was checked
                    j = j - 1;
                    currentSelectedLayer.prop('value',arrMenu[j]); //value of currentSelectedLayer changes to the previous one

                    if (j === 0){
                        previousL.prop('disabled',true);// if there is no previous layer ,then the button would be disabled
                    }
                }
            });

            $('#nextL').click(function(){
                if(j !== arrMenu.length - 1){ // if there is not only one switch was selected
                    if(j === arrMenu.length - 2){
                        nextL.prop('disabled',true);
                    }
                    j = j + 1;
                    previousL.prop('disabled',false);
                    currentSelectedLayer.prop('value',arrMenu[j]);
                }
            });

            //if the opened layer was clicked, the layer shows
            $('#currentSelectedLayer').click(function(){
                // $('.collapse').collapse('hide');
                // var a = document.getElementById("accordion").children; //eight layer menus

                var currentSelectedLayerData = "thirdlayer=" + arrMenu[j];
                $.ajax({
                    url: '/currentLayer',
                    type: 'GET',
                    dataType: 'json',
                    data:currentSelectedLayerData,
                    async: false,
                    success: function (results) {
                        var FirstLayerId = '#' + results[0].FirstLayer;
                        var SecondLayerId = '#' + results[0].FirstLayer + '-' + results[0].SecondLayer;

                        globe.goTo(new WorldWind.Position(results[0].Latitude, results[0].Longitude, results[0].Altitude * 1000));

                        $(FirstLayerId).collapse('show');
                        $(SecondLayerId).collapse('show');

                    }
                });
            });

            $('#globeOrigin').click(function(){
                globe.goTo(new WorldWind.Position(37.0902, -95.7129, 9000000));
            });

            // globe.addEventListener("mousemove", handlePick);

            globe.addEventListener("click", handleMouseCLK);
        });
    });
