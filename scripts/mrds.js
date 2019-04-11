requirejs(['./worldwind.min',
        './LayerManager',
        './RadiantCircleTile',
        '../src/util/WWMath',
        '../src/geom/Angle',
        '../src/geom/Location',
        '../config/mainconf'],
    function (WorldWind,
              LayerManager,
              RadiantCircleTile,
              WWMath,
              Angle,
              Location) {
        "use strict";

        $(document).ready(function() {
            $(function () {

                var placemark = [];
                var autoSuggestion = [];
                var suggestedLayer;
                var clickedLayer;
                // var suggestedLayer = [];
                // var clickedLayer = [];

                // reading configGlobal from mainconf.js
                var mainconfig = config;
                // console.log(mainconfig);


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


                    var category = this.id;
                    // console.log(category);
                    var color = {
                        // 'Antimony': "",
                        // 'Asbestos': "",
                        // 'Barium-Barite': "",
                        // 'Cadmium': "",
                        // 'Chromium': "",
                        // 'Copper': "",
                        // 'Diatomite': "",
                        // 'Fluorine-Fluorite': "",
                        // 'Gold': "",
                        // 'Gypsum-Anhydrite': "",
                        // 'Iron': "",
                        // 'Jade': "",
                        // 'Lead': "",
                        // 'Manganese': "",
                        // 'Mercury': "",
                        // 'Molybdenum': "",
                        // 'Nickel': "",
                        // 'PGE': "",
                        // 'Platinum': "",
                        // 'REE': "",
                        // 'Sapphire': "",
                        // 'Silver': "",
                        // 'Stone': "",
                        // 'Sulfur': "",
                        // 'Thorium': "",
                        // 'Tin': "",
                        // 'Titanium': "",
                        // 'Tungsten': "",
                        // 'Uranium': "",
                        // 'Vanadium': "",
                        // 'Zeolites': "",
                        // 'Zinc': "",

                        'Antimony': "#2E4053",
                        'Asbestos': "#1F618D",
                        'Chromium': "#D5F5E3",
                        'Copper': "#E67E22",
                        'Gold': "#F7DC6F",
                        'Iron': "#CB4335",
                        'Lead': "#117864",
                        'Manganese': "#AED6F1",
                        'Molybdenum': "#FAD7A0",
                        'Nickel': "#F1948A",
                        'Silver': "#48C9B0",
                        'Tungsten': "#922B21",
                        'Uranium': "#9B59B6",
                        'Zinc': "#BA4A00",
                        'Other': "#A6ACAF",

                        'Past Producer': "#D98880",
                        'Producer': "#A93226",
                        'Occurrence': "#82E0AA",
                        'Prospect': "#28B463",
                        'Unknown': "#A6ACAF",

                        'undefined': "#ffffff"
                    };

                    // var scale = {
                    //     "none": ["", ""],
                    //     "type_color": ["1980", "2017"],
                    //     "commodity_color": ["<1MW", ">3 MW"],
                    // };

                    $("#legend").empty();

                    // if (category === 'commodity') {
                        $("#legend").append($("<li><span style='background:#2E4053;'></span>Antimony</li>\n" +
                            "<li><span style='background:#1F618D;'></span>Asbestos</li>\n" +
                            "<li><span style='background:#D5F5E3;'></span>Chromium</li>\n" +
                            "<li><span style='background:#E67E22;'></span>Copper</li>\n" +
                            "<li><span style='background:#F7DC6F;'></span>Gold</li>\n" +
                            "<li><span style='background:#CB4335;'></span>Iron</li>\n" +
                            "<li><span style='background:#117864;'></span>Lead</li>\n" +
                            "<li><span style='background:#AED6F1;'></span>Manganese</li>\n" +
                            "<li><span style='background:#FAD7A0;'></span>Molybdenum</li>\n" +
                            "<li><span style='background:#F1948A;'></span>Nickel</li>\n" +
                            "<li><span style='background:#48C9B0;'></span>Silver</li>\n" +
                            "<li><span style='background:#922B21;'></span>Tungsten</li>\n" +
                            "<li><span style='background:#9B59B6;'></span>Uranium</li>\n" +
                            "<li><span style='background:#BA4A00;'></span>Zinc</li>\n" +
                            "<li><span style='background:#A6ACAF;'></span>Other</li>"));
                    // } else if (category === 'dev_stat') {
                        $("#legend").append($("<li><span style='background:#D98880;'></span>Past Producer</li>\n" +
                            "<li><span style='background:#A93226;'></span>Present Producer</li>\n" +
                            "<li><span style='background:#82E0AA;'></span>Occurrence</li>\n" +
                            "<li><span style='background:#28B463;'></span>Prospect</li>\n" +
                            "<li><span style='background:#A6ACAF;'></span>Unknown</li>"));
                    // }


                    // $("#leftScale").html(scale[category][0]);
                    // $("#rightScale").html(scale[category][1]);

                    // console.log(color['undefined']);
                    // console.log(color[undefined]);
                    // console.log(color[placemark[0].userProperties[category]]);

                    for (var i = 0; i < placemark.length; i++) {
                        var circle = document.createElement("canvas"),
                            ctx = circle.getContext('2d'),
                            radius = 10,
                            r2 = radius + radius;

                        circle.width = circle.height = r2;

                        var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
                        // console.log(placemark[i].userProperties[category]);
                        // console.log(color[placemark[i].userProperties[category]]);

                        if (!color[placemark[i].userProperties[category]]) {
                            gradient.addColorStop(0, color['Other']);
                        } else {
                            gradient.addColorStop(0, color[placemark[i].userProperties[category]]);
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
                            // console.log(wwd.layers);
                        }
                    }


                $("#switchMethod").on('click', function() {
                    // $("#switchLayer").css('pointer-events', (this.checked === true) ? 'auto' : 'none');
                    // console.log($($("#switchLayer")[0].parentElement));
                    var switchLayer = $($("#switchLayer")[0].parentElement);
                    switchLayer.css('pointer-events', (this.checked === true) ? 'none' : 'auto');
                    $("#manualSwitch").css('display', (this.checked === true) ? 'none' : 'block');
                });


                    // this.checked, true: placemark, false: heatmap
                    // console.log(this.checked + "   " + !this.checked);

                    document.getElementById("placemarkButton").style.pointerEvents = (this.checked === true) ? "auto" : "none";

                    wwd.layers[wwd.layers.length - 1].enabled = !this.checked;

                    if (this.checked) {
                        $("#placemarkButton").find("input").each(function() {
                            if ($(this).is(':checked')) {
                                var id = "#" + $(this)[0].id;

                                $(id).click();
                            }
                        })
                    } else {
                        $("#legend").empty();

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

                    // for (var i = layers.length; i < wwd.layers.length; i++) {
                    //     if (i === wwd.layers.length - 1) {
                    //         wwd.layers[i].enabled = !this.checked;
                    //         // console.log(wwd.layers);
                    //     } else {
                    //         wwd.layers[i].enabled = this.checked;
                    //     }
                    // }


                // $(".sortButton").on("click", function () {
                //     var category = this.id;
                //     // console.log(category);
                //
                //     // this.setAttribute('data-status', (this.getAttribute("data-status") === 'true') ? 'false' : 'true');
                //     var status = this.getAttribute("data-status");
                //     $(".sortButton").attr('data-status', 'false');
                //     this.setAttribute('data-status', (status === 'true') ? 'false' : 'true');
                //     status = !(status === 'true');
                //
                //     $(".sortButton").find("span").html("");
                //     $(this).find("span").html(status ? " &#9650;" : " &#9660;");
                //
                //     $(".sortButton").css("background-color", "rgb(128, 128, 128)");
                //     $(this).css("background-color", "rgb(0, 128, 255)");
                //
                //     function sort(arr, isNotReverse){
                //         arr.sort(function(a, b){
                //             // console.log($(a).attr("data-" + category), $(b).attr("data-" + category));
                //             // if(a.id > b.id) return  isReverse ? -1 : 1;
                //             // if(a.id < b.id) return isReverse ? 1 : -1;
                //             if($(a).attr("data-" + category) > $(b).attr("data-" + category)) return  isNotReverse ? 1 : -1;
                //             if($(a).attr("data-" + category) < $(b).attr("data-" + category)) return isNotReverse ? -1 : 1;
                //             return 0;
                //         });
                //         return arr;
                //     }
                //
                //     var parent = $("#layerMenu");
                //     // console.log(status);
                //     var arr = sort(parent.children(), status);
                //     // console.log(arr);
                //     arr.detach().appendTo(parent);
                //
                //     if (clickedLayer) {
                //         $("#" + clickedLayer).detach().prependTo(parent);
                //     }
                // });

                // function moveList(id) {
                //     // if (clickedLayer) {
                //     //     $("#" + clickedLayer).remove();
                //     //     var hiddenElement = $("#" + clickedLayer + "_hidden");
                //     //     hiddenElement.show();
                //     //     hiddenElement.attr('id', clickedLayer);
                //     //     clickedLayer = "";
                //     // } else {
                //     //
                //     // }
                //
                //     // if (!clickedLayer) {
                //     //     clickedLayer = id;
                //     //
                //     //     var item = $("#" + clickedLayer);
                //     //     var clone = $("#" + clickedLayer).clone();
                //     //     item.attr('id', clickedLayer + "_hidden");
                //     //     item.hide();
                //     //     clone.css('background-color', 'rgb(191, 191, 191)');
                //     //     clone.prependTo($("#layerMenu"));
                //     //     refreshEvent();
                //     // } else if (clickedLayer === id) {
                //     //     $("#" + clickedLayer).remove();
                //     //     var hiddenElement = $("#" + clickedLayer + "_hidden");
                //     //     hiddenElement.show();
                //     //     hiddenElement.attr('id', clickedLayer);
                //     //     clickedLayer = "";
                //     //     refreshEvent();
                //     // } else if (clickedLayer !== id) {
                //     //     // console.log(clickedLayer + "!==" + id);
                //     //     console.log($(".layers"));
                //     //     $("#" + clickedLayer).remove();
                //     //     console.log($(".layers"));
                //     //     // var hiddenElement = $("#" + clickedLayer + "_hidden");
                //     //     // console.log(hiddenElement);
                //     //     // hiddenElement.show();
                //     //     // hiddenElement.attr('id', clickedLayer);
                //     //     // console.log(clickedLayer);
                //     //
                //     //     clickedLayer = id;
                //     //     // console.log(clickedLayer);
                //     //
                //     //     // var item = $("#" + clickedLayer);
                //     //     // var clone = $("#" + clickedLayer).clone();
                //     //     // item.attr('id', clickedLayer + "_hidden");
                //     //     // item.hide();
                //     //     // clone.css('background-color', 'rgb(191, 191, 191)');
                //     //     // clone.prependTo($("#layerMenu"));
                //     //     // refreshEvent();
                //     // }
                //
                //     if (!clickedLayer) {
                //         clickedLayer = id;
                //
                //         var item = $("#" + clickedLayer);
                //         item.css('background-color', 'rgb(191, 191, 191)');
                //         item.prependTo($("#layerMenu"));
                //         refreshEvent();
                //     } else if (clickedLayer === id) {
                //         clickedLayer = "";
                //         $(".sortButton").find("span").each(function() {
                //             if ($(this).html()) {
                //                 var id = "#" + $(this)[0].parentElement.id;
                //
                //                 $(id).click();
                //                 $(id).click();
                //             }
                //         })
                //
                //     } else if (clickedLayer !== id) {
                //         clickedLayer = id;
                //
                //         var item = $("#" + clickedLayer);
                //         item.css('background-color', 'rgb(191, 191, 191)');
                //         item.prependTo($("#layerMenu"));
                //         refreshEvent();
                //     }
                //
                //     function refreshEvent() {
                //         $(".layer").off('click', highlightLayer);
                //         $(".layer").on('click', highlightLayer);
                //     }
                // }
                //
                // function highlightLayer(e) {
                //     // console.log("Z");
                //
                //     var id = this.id;
                //
                //     // if (id === suggestedLayer) {
                //     //     clearHighlight(true, false);
                //     // }
                //
                //     clearHighlight(true, false);
                //
                //     if (!$("#switchLayer").is(':checked')) {
                //         $("#switchLayer").click();
                //     }
                //
                //     // console.log(clickedLayer);
                //     // console.log(wwd.layers[clickedLayer]);
                //     // console.log(wwd.layers[clickedLayer].renderables);
                //
                //     // if (e.handleObj.type === "click") {
                //     //
                //     // } else if (e.handleObj.type === "") {
                //     //
                //     // }
                //
                //     // var renderables = wwd.layers[this.id].renderables;
                //     //
                //     // for (var i = 0; i < renderables.length; i++) {
                //     //
                //     //     renderables[i].highlighted = (e.handleObj.type === "mouseover") ? true : false;
                //     //
                //     //     // if (i === renderables.length - 1) {
                //     //     //     wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function() {
                //     //     //         layerMenu();
                //     //     //     });
                //     //     // }
                //     // }
                //
                //     // console.log(clickedLayer + "   " + id);
                //     if (clickedLayer && clickedLayer !== id) {
                //         // var oldRenderables = wwd.layers[clickedLayer].renderables;
                //         // var status = (clickedLayer === id);
                //         // for (var z = 0; z < oldRenderables.length; z++) {
                //         //     // oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                //         //     oldRenderables[z].highlighted = status;
                //         //
                //         //     if (z === oldRenderables.length - 1) {
                //         //         highlight();
                //         //     }
                //         // }
                //
                //         var oldLayerIndex = clickedLayer.toString().split('-');
                //         var status = (clickedLayer === id);
                //         for (var z = 0; z < oldLayerIndex.length; z++) {
                //             // oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                //             wwd.layers[oldLayerIndex[z]].renderables[0].highlighted = status;
                //
                //             if (z === oldLayerIndex.length - 1) {
                //                 highlight();
                //             }
                //         }
                //     } else {
                //         highlight();
                //     }
                //
                //
                //     function highlight() {
                //
                //         // var renderables = wwd.layers[id].renderables;
                //         // // console.log("C");
                //         // for (var i = 0; i < renderables.length; i++) {
                //         //
                //         //     renderables[i].highlighted = !renderables[i].highlighted;
                //         //
                //         //     if (i === renderables.length - 1) {
                //         //         // console.log(renderables[0].position.latitude, renderables[0].position.longitude);
                //         //         // console.log(wwd.goToAnimator);
                //         //
                //         //         if (wwd.goToAnimator.targetPosition.latitude === renderables[0].position.latitude && wwd.goToAnimator.targetPosition.longitude === renderables[0].position.longitude) {
                //         //             layerMenu();
                //         //             // console.log("B");
                //         //             moveList(id);
                //         //         } else {
                //         //             wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function () {
                //         //                 layerMenu();
                //         //                 // console.log("A");
                //         //                 moveList(id);
                //         //             });
                //         //         }
                //         //     }
                //         // }
                //
                //         var layerIndex = id.toString().split('-');
                //         // console.log("C");
                //         for (var i = 0; i < layerIndex.length; i++) {
                //
                //             wwd.layers[layerIndex[i]].renderables[0].highlighted = !wwd.layers[layerIndex[i]].renderables[0].highlighted;
                //
                //             if (i === layerIndex.length - 1) {
                //                 // console.log(renderables[0].position.latitude, renderables[0].position.longitude);
                //                 // console.log(wwd.goToAnimator);
                //
                //                 if (wwd.goToAnimator.targetPosition.latitude === wwd.layers[layerIndex[0]].renderables[0].position.latitude && wwd.goToAnimator.targetPosition.longitude === wwd.layers[layerIndex[0]].renderables[0].position.longitude) {
                //                     totalWTCap();
                //                     layerMenu();
                //                     // console.log("B");
                //                     moveList(id);
                //                 } else {
                //                     wwd.goTo(new WorldWind.Position(wwd.layers[layerIndex[0]].renderables[0].position.latitude, wwd.layers[layerIndex[0]].renderables[0].position.longitude), function () {
                //                         totalWTCap();
                //                         layerMenu();
                //                         // console.log("A");
                //                         moveList(id);
                //                     });
                //                 }
                //             }
                //         }
                //     }
                //
                //     // var id = this.id;
                //     //
                //     // if (id !== clickedLayer && clickedLayer) {
                //     //     var oldRenderables = wwd.layers[clickedLayer].renderables;
                //     //     for (var z = 0; z < oldRenderables.length; z++) {
                //     //         oldRenderables[z].highlighted = !oldRenderables[z].highlighted;
                //     //     }
                //     // }
                //     //
                //     //
                //     // var renderables = wwd.layers[this.id].renderables;
                //     // for (var i = 0; i < renderables.length; i++) {
                //     //
                //     //     renderables[i].highlighted = !renderables[i].highlighted;
                //     //
                //     //     if (i === renderables.length - 1) {
                //     //         wwd.goTo(new WorldWind.Position(renderables[0].position.latitude, renderables[0].position.longitude), function () {
                //     //             layerMenu();
                //     //             console.log("A");
                //     //             moveList(id);
                //     //         });
                //     //     }
                //     // }
                // }

                wwd.worldWindowController.__proto__.handleWheelEvent = function (event) {
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
                    // totalWTCap();
                    // layerMenu();
                    // clearHighlight(true, true);
                };

                wwd.worldWindowController.__proto__.handlePanOrDrag3D = function (recognizer) {
                    var state = recognizer.state,
                        tx = recognizer.translationX,
                        ty = recognizer.translationY;

                    var navigator = this.wwd.navigator;

                    // this.lastPoint or navigator.lastPoint

                    if (state === WorldWind.BEGAN) {
                        navigator.lastPoint.set(0, 0);
                    } else if (state === WorldWind.CHANGED) {
                        // Convert the translation from screen coordinates to arc degrees. Use this navigator's range as a
                        // metric for converting screen pixels to meters, and use the globe's radius for converting from meters
                        // to arc degrees.
                        var canvas = this.wwd.canvas,
                            globe = this.wwd.globe,
                            globeRadius = WWMath.max(globe.equatorialRadius, globe.polarRadius),
                            distance = WWMath.max(1, navigator.range),
                            metersPerPixel = WWMath.perspectivePixelSize(canvas.clientWidth, canvas.clientHeight, distance),
                            forwardMeters = (ty - navigator.lastPoint[1]) * metersPerPixel,
                            sideMeters = -(tx - navigator.lastPoint[0]) * metersPerPixel,
                            forwardDegrees = (forwardMeters / globeRadius) * Angle.RADIANS_TO_DEGREES,
                            sideDegrees = (sideMeters / globeRadius) * Angle.RADIANS_TO_DEGREES;

                        // Apply the change in latitude and longitude to this navigator, relative to the current heading.
                        var sinHeading = Math.sin(navigator.heading * Angle.DEGREES_TO_RADIANS),
                            cosHeading = Math.cos(navigator.heading * Angle.DEGREES_TO_RADIANS);

                        navigator.lookAtLocation.latitude += forwardDegrees * cosHeading - sideDegrees * sinHeading;
                        navigator.lookAtLocation.longitude += forwardDegrees * sinHeading + sideDegrees * cosHeading;
                        navigator.lastPoint.set(tx, ty);
                        this.applyLimits();
                        this.wwd.redraw();

                        // totalWTCap();
                        // layerMenu();
                        // clearHighlight(true, true);
                    }
                };

                wwd.worldWindowController.allGestureListeners[0].__proto__.handleZoom = function(e, control) {
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
                                    thisLayer.wwd.navigator.range *= (1 - thisLayer.zoomIncrement);
                                } else if (thisLayer.activeControl === thisLayer.zoomOutControl) {
                                    thisLayer.wwd.navigator.range *= (1 + thisLayer.zoomIncrement);
                                }
                                thisLayer.wwd.redraw();

                                // autoSwitch();
                                // console.log(wwd.layers[0].eyeText.text);
                                setTimeout(function() {autoSwitch();}, 25);

                                setTimeout(setRange, 50);
                            }
                        };

                        setTimeout(setRange, 50);
                        handled = true;
                    }
                    return handled;
                };

                wwd.worldWindowController.allGestureListeners[0].__proto__.handlePan = function(e, control) {
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
                                        - (thisLayer.wwd.viewport.height - thisLayer.currentEventPoint[1]),
                                    oldLat = thisLayer.wwd.navigator.lookAtLocation.latitude,
                                    oldLon = thisLayer.wwd.navigator.lookAtLocation.longitude,
                                    // Scale the increment by a constant and the relative distance of the eye to the surface.
                                    scale = thisLayer.panIncrement
                                        * (thisLayer.wwd.navigator.range / thisLayer.wwd.globe.radiusAt(oldLat, oldLon)),
                                    heading = thisLayer.wwd.navigator.heading + (Math.atan2(dx, dy) * Angle.RADIANS_TO_DEGREES),
                                    distance = scale * Math.sqrt(dx * dx + dy * dy);
                                Location.greatCircleLocation(thisLayer.wwd.navigator.lookAtLocation, heading, -distance,
                                    thisLayer.wwd.navigator.lookAtLocation);
                                thisLayer.wwd.redraw();

                                // console.log(wwd.navigator.lookAtLocation);
                                // layerMenu();
                                // clearHighlight(true, true);
                                // setTimeout(function() {totalWTCap();}, 25);

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
                        var altitude = wwd.layers[0].eyeText.text;

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

                // function totalWTCap() {
                //     // if ($("#switchLayer").is(':checked')) {
                //     //     var clientRect = wwd.canvas.getBoundingClientRect();
                //     //     var region = new WorldWind.Rectangle(
                //     //         0,
                //     //         clientRect.height,
                //     //         clientRect.width,
                //     //         clientRect.height);
                //     //
                //     //     var pickList = wwd.pickShapesInRegion(region);
                //     //
                //     //     var totalWT = 0;
                //     //     var totalCap = 0;
                //     //
                //     //     for (var q = 0; q < pickList.objects.length; q++) {
                //     //         var pickedPL = pickList.objects[q].userObject;
                //     //         if (pickedPL instanceof WorldWind.Placemark) {
                //     //             totalWT++;
                //     //             if (pickedPL.userProperties.p_avgcap !== "N/A") {
                //     //                 totalCap += pickedPL.userProperties.p_avgcap;
                //     //             }
                //     //         }
                //     //
                //     //         if (q === pickList.objects.length - 1) {
                //     //             // console.log(totalWT);
                //     //             // console.log(totalCap);
                //     //             $("#totalWTCap").html("Showing <strong>" + totalWT + "</strong> turbines on screen with a total rated capacity of <strong>" + Math.round(totalCap) + "</strong> MW");
                //     //         }
                //     //     }
                //     //
                //     //     pickList = [];
                //     // }
                //
                //     var totalWT = 0;
                //     var totalCap = 0;
                //
                //     for (var i = layers.length; i < wwd.layers.length - 1; i++) {
                //
                //         if (wwd.layers[i].inCurrentFrame) {
                //             totalWT++;
                //             if (wwd.layers[i].renderables[0].userProperties.p_avgcap !== "N/A") {
                //                 totalCap += wwd.layers[i].renderables[0].userProperties.p_avgcap;
                //             }
                //         }
                //
                //         if (i === wwd.layers.length - 2) {
                //             // console.log(totalWT);
                //             // console.log(totalCap);
                //             $("#totalWTCap").html("Showing <strong>" + totalWT + "</strong> turbines on screen with a total rated capacity of <strong>" + Math.round(totalCap) + "</strong> MW");
                //         }
                //     }
                // }

                // function layerMenu() {
                //    var altitude = wwd.layers[0].eyeText.text;
                //
                //    if (altitude.substring(altitude.length - 2, altitude.length) === "km") {
                //        altitude = altitude.replace(/Eye  |,| km/g, '');
                //    } else {
                //        altitude = (altitude.replace(/Eye  |,| m/g, '')) / 1000;
                //    }
                //
                //    $("#layerMenu").empty();
                //    $("#layerMenuButton").hide();
                //
                //    if (altitude <= mainconfig.eyeDistance_PL) {
                //        // console.log(wwd.layers);
                //        var projectNumber = 0;
                //        var id;
                //        var previousProject;
                //
                //        for (var i = layers.length; i < wwd.layers.length - 1; i++) {
                //
                //            if (wwd.layers[i].inCurrentFrame) {
                //                var projectName = wwd.layers[i].renderables[0].userProperties.p_name,
                //                    state = wwd.layers[i].renderables[0].userProperties.t_state,
                //                    year = wwd.layers[i].renderables[0].userProperties.p_year,
                //                    number = wwd.layers[i].renderables[0].userProperties.p_tnum,
                //                    cap = wwd.layers[i].renderables[0].userProperties.p_cap,
                //                    avgcap = wwd.layers[i].renderables[0].userProperties.p_avgcap;
                //
                //                if (i === layers.length || projectName !== previousProject) {
                //                    id = i;
                //                    $("#layerMenu").append($("<div id='" + i + "' data-name='" + projectName + "' data-year='" + year + "' data-capacity='" + avgcap + "' class='layers'>" +
                //                        "<p><strong>" + projectName + ", " + state + "</strong></p>" +
                //                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Year Online: " + year + "</p>" +
                //                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;" + number + " Turbines</p>" +
                //                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Total Capacity: " + cap + ((cap === "N/A") ? "" : " MW") + "</p>" +
                //                        "<p>&nbsp;&nbsp;&nbsp;&nbsp;Rated Capacity: " + avgcap + ((avgcap === "N/A") ? "" : " MW") + "</p>" +
                //                        "</div>"));
                //                    projectNumber++;
                //                } else {
                //                    $("#" + id).attr('id', id + "-" + i);
                //                    id += ('-' + i);
                //                }
                //
                //                previousProject = projectName;
                //            }
                //
                //            if (i === wwd.layers.length - 2) {
                //                $("#projectNumber").html(projectNumber);
                //                $("#layerMenuButton").show();
                //                // $(".layers").on('mouseenter', highlightLayer);
                //                // $(".layers").on('mouseleave', highlightLayer);
                //                $(".layers").on('click', highlightLayer);
                //            }
                //        }
                //    }
                // }

                // function clearHighlight(suggested, clicked) {
                //     if (suggestedLayer && suggested) {
                //         // var layer = wwd.layers[suggestedLayer];
                //         // for (var i = 0; i < layer.renderables.length; i++) {
                //         //     layer.renderables[i].highlighted = false;
                //         //
                //         //     if (i === layer.renderables.length - 1) {
                //         //         suggestedLayer = "";
                //         //     }
                //         // }
                //
                //         var layerIndex = suggestedLayer.toString().split('-');
                //         for (var i = 0; i < layerIndex.length; i++) {
                //             wwd.layers[layerIndex[i]].renderables[0].highlighted = false;
                //
                //             if (i === layerIndex.length - 1) {
                //                 suggestedLayer = "";
                //             }
                //         }
                //     }
                //
                //     if (clickedLayer && clicked) {
                //         // var layer = wwd.layers[clickedLayer];
                //         // for (var i = 0; i < layer.renderables.length; i++) {
                //         //     layer.renderables[i].highlighted = false;
                //         //
                //         //     if (i === layer.renderables.length - 1) {
                //         //         moveList(clickedLayer);
                //         //     }
                //         // }
                //
                //         var layerIndex = clickedLayer.toString().split('-');
                //         for (var i = 0; i < layerIndex.length; i++) {
                //             wwd.layers[layerIndex[i]].renderables[0].highlighted = false;
                //
                //             if (i === layerIndex.length - 1) {
                //                 clickedLayer = "";
                //             }
                //         }
                //     }
                // }

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

                    var pickList = wwd.pick(wwd.canvasCoordinates(x, y));
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

                            var content = "<p><strong>Site Name:</strong> " + pickedPL.userProperties.site_name +
                                "<br>" + "<strong>Commodity:</strong> " + pickedPL.userProperties.commodity +
                                "<br>" + "<strong>Development Status:</strong> " + pickedPL.userProperties.dev_stat + "</p>";

                            $("#popover").attr('data-content', content);
                            $("#popover").show();
                        }
                    }

                    pickList = [];
                }

                $.ajax({
                    url: '/mrdsData',
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

                            // console.log(wwd.goToAnimator);

                            for (var i = 0; i < resp.data.length; i++) {
                                data[i] = new WorldWind.IntensityLocation(resp.data[i].latitude, resp.data[i].longitude, 1);

                                var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
                                placemarkAttributes.imageSource = new WorldWind.ImageSource(circle);
                                placemarkAttributes.imageScale = 0.5;

                                var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                                highlightAttributes.imageScale = 2.0;

                                var placemarkPosition = new WorldWind.Position(resp.data[i].latitude, resp.data[i].longitude, 0);
                                placemark[i] = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                                placemark[i].altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                                placemark[i].highlightAttributes = highlightAttributes;

                                placemark[i].userProperties.site_name = resp.data[i].site_name;
                                placemark[i].userProperties.dev_stat = resp.data[i].dev_stat;
                                placemark[i].userProperties.commodity = resp.data[i].commod1.split(",")[0];

                                // if ($.inArray(resp.data[i].p_name, layerNames) === -1) {
                                //     layerNames.push(resp.data[i].p_name);
                                //     placemarkLayers.push(new WorldWind.RenderableLayer(resp.data[i].p_name));
                                //     placemarkLayers[placemarkLayers.length - 1].enabled = false;
                                //     wwd.addLayer(placemarkLayers[placemarkLayers.length - 1]);
                                //     placemarkLayers[placemarkLayers.length - 1].addRenderable(placemark[i]);
                                // } else {
                                //     var index = $.inArray(resp.data[i].p_name, layerNames);
                                //     placemarkLayers[index].addRenderable(placemark[i]);
                                // }

                                // if (i === 0 || resp.data[i].p_name !== resp.data[i - 1].p_name) {
                                //     var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].p_name);
                                //     // placemarkLayer.enabled = false;
                                //     wwd.addLayer(placemarkLayer);
                                //     wwd.layers[wwd.layers.length - 1].addRenderable(placemark[i]);
                                //     autoSuggestion.push({"value": resp.data[i].p_name, "lati": resp.data[i].ylat, "long": resp.data[i].xlong, "i": wwd.layers.length - 1});
                                // } else {
                                //     wwd.layers[wwd.layers.length - 1].addRenderable(placemark[i]);
                                // }

                                var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].mrds_id);
                                placemarkLayer.addRenderable(placemark[i]);
                                wwd.addLayer(placemarkLayer);

                                if (i === resp.data.length - 1) {
                                    // wwd.addLayer(placemarkLayer);
                                    // console.log("A");
                                    // console.log(new Date());
                                    // console.log(layerNames);
                                    // console.log(wwd.layers.length);
                                    // console.log(wwd.layers);

                                    // var z = 10;
                                    // var x = z;
                                    // setTimeout(function() {
                                    //     var showLayers = setInterval(function() {
                                    //         console.log(new Date());
                                    //         x += 100;
                                    //         for (; z < x; z++) {
                                    //             wwd.layers[z].enabled = true;
                                    //
                                    //             if (z === wwd.layers.length - 1) {
                                    //                 console.log(new Date());
                                    //                 clearInterval(showLayers);
                                    //                 break;
                                    //             }
                                    //         }
                                    //         // wwd.redraw();
                                    //     }, 500);
                                    // }, 10000);

                                    // console.log(data);
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
                                    // console.log(wwd.layers);
                                }
                            }
                        }
                    }
                });

                // $("#autoSuggestion").autocomplete({
                //     lookup: autoSuggestion,
                //     lookupLimit: 5,
                //     onSelect: function(suggestion) {
                //         console.log(suggestion);
                //         $("#autoSuggestion").val("");
                //         clearHighlight(true, true);
                //
                //         wwd.goTo(new WorldWind.Position(suggestion.lati, suggestion.long, 50000), function() {
                //             // console.log(wwd.layers[0].eyeText.text.substring(5, wwd.layers[0].eyeText.text.length - 3));
                //             suggestedLayer = suggestion.i;
                //             autoSwitch();
                //             // console.log(wwd.layers[suggestion.i].inCurrentFrame);
                //             // console.log(wwd.layers[wwd.layers.length - 1].inCurrentFrame);
                //
                //             setTimeout(function() {
                //                 // console.log(wwd.layers[suggestion.i].inCurrentFrame);
                //                 // console.log(wwd.layers[wwd.layers.length - 1].inCurrentFrame);
                //                 // totalWTCap();
                //                 // layerMenu();
                //
                //                 console.log(suggestedLayer);
                //                 var layerIndex = suggestedLayer.toString().split('-');
                //                 console.log(layerIndex);
                //                 for (var i = 0; i < layerIndex.length; i++) {
                //                     wwd.layers[layerIndex[i]].renderables[0].highlighted = true;
                //                 }
                //             }, 1)
                //         });
                //     }
                // });

                // $("#p_avgcap_color").click();

                // Listen for mouse moves and highlight the placemarks that the cursor rolls over.
                wwd.addEventListener("mousemove", handleMouseMove);
                $("#popover").popover({html: true, placement: "top", trigger: "hover"});
            })
        });
    });
