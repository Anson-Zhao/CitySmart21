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
