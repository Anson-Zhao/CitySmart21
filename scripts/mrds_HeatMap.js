requirejs(['./worldwind.min',
        './LayerManager',
        './RadiantCircleTile',
        '../config/mainconf'],
    function (WorldWind,
              LayerManager,
              RadiantCircleTile) {
        "use strict";
    document.ready(function () {
        $(function (){
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

                        // var circle = document.createElement("canvas"),
                        //     ctx = circle.getContext('2d'),
                        //     radius = 10,
                        //     r2 = radius + radius;
                        //
                        // circle.width = circle.height = r2;
                        //
                        // var gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
                        // // gradient.addColorStop(0, "rgba(192, 192, 192, 0.25)");
                        // gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
                        //
                        // ctx.beginPath();
                        // ctx.arc(radius, radius, radius, 0, Math.PI * 2, true);
                        //
                        // ctx.fillStyle = gradient;
                        // ctx.fill();
                        // // ctx.strokeStyle = "rgb(255, 255, 255)";
                        // // ctx.stroke();
                        //
                        // ctx.closePath();
                        // // console.log(new Date());
                        //
                        // // var placemarkLayer = new WorldWind.RenderableLayer("USWTDB");
                        //
                        // // console.log(wwd.goToAnimator);
                        //     data[i] = new WorldWind.IntensityLocation(resp.data[i].latitude, resp.data[i].longitude, 1);
                        //
                        //     var placemarkAttributes = new WorldWind.PlacemarkAttributes(null);
                        //     placemarkAttributes.imageSource = new WorldWind.ImageSource(circle);
                        //     placemarkAttributes.imageScale = 0.5;
                        //
                        //     var highlightAttributes = new WorldWind.PlacemarkAttributes(placemarkAttributes);
                        //     highlightAttributes.imageScale = 2.0;
                        //
                        //     var placemarkPosition = new WorldWind.Position(resp.data[i].latitude, resp.data[i].longitude, 0);
                        //     placemark[i] = new WorldWind.Placemark(placemarkPosition, false, placemarkAttributes);
                        //     placemark[i].altitudeMode = WorldWind.RELATIVE_TO_GROUND;
                        //     placemark[i].highlightAttributes = highlightAttributes;
                        //
                        //     placemark[i].userProperties.site_name = resp.data[i].site_name;
                        //     placemark[i].userProperties.dev_stat = resp.data[i].dev_stat;
                        //     placemark[i].userProperties.commodity = resp.data[i].commod1.split(",")[0];
                        //
                        //     // if ($.inArray(resp.data[i].p_name, layerNames) === -1) {
                        //     //     layerNames.push(resp.data[i].p_name);
                        //     //     placemarkLayers.push(new WorldWind.RenderableLayer(resp.data[i].p_name));
                        //     //     placemarkLayers[placemarkLayers.length - 1].enabled = false;
                        //     //     wwd.addLayer(placemarkLayers[placemarkLayers.length - 1]);
                        //     //     placemarkLayers[placemarkLayers.length - 1].addRenderable(placemark[i]);
                        //     // } else {
                        //     //     var index = $.inArray(resp.data[i].p_name, layerNames);
                        //     //     placemarkLayers[index].addRenderable(placemark[i]);
                        //     // }
                        //
                        //     // if (i === 0 || resp.data[i].p_name !== resp.data[i - 1].p_name) {
                        //     //     var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].p_name);
                        //     //     // placemarkLayer.enabled = false;
                        //     //     wwd.addLayer(placemarkLayer);
                        //     //     wwd.layers[wwd.layers.length - 1].addRenderable(placemark[i]);
                        //     //     autoSuggestion.push({"value": resp.data[i].p_name, "lati": resp.data[i].ylat, "long": resp.data[i].xlong, "i": wwd.layers.length - 1});
                        //     // } else {
                        //     //     wwd.layers[wwd.layers.length - 1].addRenderable(placemark[i]);
                        //     // }
                        //
                        //     var placemarkLayer = new WorldWind.RenderableLayer(resp.data[i].mrds_id);
                        //     placemarkLayer.addRenderable(placemark[i]);
                        //     wwd.addLayer(placemarkLayer);

                            // if (i === resp.data.length - 1) {
                            //     // wwd.addLayer(placemarkLayer);
                            //     // console.log("A");
                            //     // console.log(new Date());
                            //     // console.log(layerNames);
                            //     // console.log(wwd.layers.length);
                            //     // console.log(wwd.layers);
                            //
                            //     // var z = 10;
                            //     // var x = z;
                            //     // setTimeout(function() {
                            //     //     var showLayers = setInterval(function() {
                            //     //         console.log(new Date());
                            //     //         x += 100;
                            //     //         for (; z < x; z++) {
                            //     //             wwd.layers[z].enabled = true;
                            //     //
                            //     //             if (z === wwd.layers.length - 1) {
                            //     //                 console.log(new Date());
                            //     //                 clearInterval(showLayers);
                            //     //                 break;
                            //     //             }
                            //     //         }
                            //     //         // wwd.redraw();
                            //     //     }, 500);
                            //     // }, 10000);
                            //
                            //     // console.log(data);
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
                            // }
                    }
                }
            });
        })
    });
    });
