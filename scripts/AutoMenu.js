//get the data from database with certain conditions

function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; })
}

$(document).ready(function () {
    // var secondlayerName = [];
    //Main Menu creating starts here
    var parentmenu = document.getElementById("accordion");
    var firstlayer =[];
    let secondRes=[];
    //get data from database table using routes(ajax)
    $.ajax({
        type: "GET",
        url: "firstLayer",
        dataType: "json",
        // sync:true,
        async:false,
        success: function (res) {
            // console.log(res);
            // draw the first layer
            firstlayer = res;
            for( var i =0; i <firstlayer.length; i++){

                var firstlayerValue = "FirstLayer=" + res[i].FirstLayer; // A condition used to draw the second layer
                //var createfirstlayer = function() {
                    //$.each(firstlayer, function (i) {
                        var paneldefault1 = document.createElement("div");
                        paneldefault1.className = "Menu panel panel-info " + firstlayer[i].FirstLayer;
                        // paneldefault1.id = firstlayer[i];
                        // console.log(paneldefault1);

                        var panelheading1 = document.createElement("div");
                        panelheading1.className = "panel-heading";

                        var paneltitle1 = document.createElement("h4");
                        paneltitle1.className = "panel-title";

                        var collapsed1 = document.createElement("a");
                        collapsed1.className = "collapsed";
                        collapsed1.setAttribute("data-toggle", "collapse");
                        collapsed1.setAttribute("data-parent", "#accordion");
                        // collapsed1.href = "#collapse" + i;
                        collapsed1.href = "#" + firstlayer[i].FirstLayer;

                        var firstlayername = document.createTextNode(firstlayer[i].FirstLayer + "  ");
                        firstlayername.className = "menuwords";
                        var collapseone = document.createElement("div");
                        collapseone.className = "panel-collapse collapse";
                        // collapseone.id = "collapse" + i;
                        collapseone.id = firstlayer[i].FirstLayer;

                        var panelbody1 = document.createElement("div");
                        panelbody1.className = "panel-body";
                        var panelgroup1 = document.createElement("div");
                        panelgroup1.className = "panel-group " + firstlayer[i].FirstLayer;
                        panelgroup1.id = "nested" + i;

                        collapsed1.appendChild(firstlayername);
                        paneltitle1.appendChild(collapsed1);
                        collapseone.appendChild(panelbody1);
                        panelbody1.appendChild(panelgroup1);
                        panelheading1.appendChild(paneltitle1);
                        paneldefault1.appendChild(panelheading1);
                        parentmenu.appendChild(paneldefault1);
                        paneldefault1.appendChild(collapseone);
                        // firstlayer ending
                    //});
                //};
//---------------------------second layer starts here-------------------------------------
                //draw second layer using base on the first layer
                $.ajax({
                    type: "GET",
                    url: "secondLayer",
                    dataType: "json",
                    data:firstlayerValue,
                    // async:true,
                    async: false,
                    success: function (res2) {
                        // console.log(res2);
                        for (var a = 0; a < res2.length; a++) {
                            // var secondResStr = res2[a] +'';
                            // console.log(res2[a]);
                            secondRes.push(res2[a].SecondLayer);

                            var paneldefault2 = document.createElement("div");

                            paneldefault2.id = res2[a].SecondLayer;
                            paneldefault2.className = "Menu panel panel-info " + res2[a].SecondLayer;
                            // console.log(res2[j].SecondLayer);
                            // console.log(paneldefault2);
                            var panelheading2 = document.createElement("div");
                            panelheading2.className = "panel-heading " + res2[a].FirstLayer + "-" + res2[a].SecondLayer;
                            // console.log(res2[j].FirstLayer);
                            // console.log(res2[j].SecondLayer);
                            var paneltitle2 = document.createElement("h4");
                            paneltitle2.className = "panel-title " + res2[a].FirstLayer + "-" + res2[a].SecondLayer;
                            // console.log(paneltitle2);
                            var collapsed2 = document.createElement("a");
                            collapsed2.className = "collapsed";
                            // collapsed2.id = res[i].FirstLayer + "-" + res[i].SecondLayer;
                            collapsed2.setAttribute("data-toggle", "collapse");
                            collapsed2.setAttribute("data-parent", "#nested");
                            collapsed2.href = "#" + res2[a].FirstLayer + "-" + res2[a].SecondLayer;
                            var secondlayername = document.createTextNode(res2[a].SecondLayer + "  ");
                            secondlayername.className = "menuwords";
                            var nested1c1 = document.createElement("div");
                            nested1c1.id = res2[a].FirstLayer + "-" + res2[a].SecondLayer;
                            nested1c1.className = "panel-collapse collapse";
                            var panelbody3 = document.createElement("div");
                            panelbody3.className = "panel-body " + res2[a].SecondLayer;

                            paneldefault2.appendChild(panelheading2);
                            panelheading2.appendChild(paneltitle2);
                            paneldefault2.appendChild(nested1c1);
                            nested1c1.appendChild(panelbody3);
                            collapsed2.appendChild(secondlayername);
                            paneltitle2.appendChild(collapsed2);
                            // console.log(paneldefault2);

                            document.getElementsByClassName("panel-group " + res2[a].FirstLayer)[0].appendChild(paneldefault2);
                        }
                    }
                });
            }
        }
    });
    // console.log(secondRespond);
    for(var k =0; k < secondRes.length; k++ ) {
            // console.log(secondRespond);
            // console.log('hh');
            var secondLayerValue = "SecondLayer=" + secondRes[k];
            // console.log(secondLayerValue);
            // console.log(secondLayerValue);
            $.ajax({
                type: "GET",
                url: "thirdLayer",
                dataType: "json",
                data: secondLayerValue,
                async: false,
                success: function (res3) {
                    // console.log(res3);
                    // for(var i = 0 ; i <res3.length; i++){
                    //     console.log(res3[i].LayerName);
                    //     console.log(res3[i].ThirdLayer);
                    // }
                    for (var i = 0; i < res3.length; i++) {
                        if (res3[i].LayerType === 'Wmslayer') {
                            // console.log(res3[i].LayerType);
                            // console.log('hh');
                            let Thirdreplace = res3[i].ThirdLayer.replace(/\s+/g, '');
                            let countrynamestr = res3[i].CountryName.replace(/\s+/g, '');
                            let statenamestr = res3[i].StateName.replace(/\s+/g, '');
                            let citynamestr = res3[i].CityName.replace(/\s+/g, '');
                            // console.log(res3[i].ThirdLayer);

                            var checkboxdiv = document.createElement("div");
                            checkboxdiv.className = "State " + Thirdreplace + " " + countrynamestr + statenamestr + citynamestr;
                            // checkboxdiv.className = "State " + res3[i].ThirdLayer + " " + countrynamestr + statenamestr + continentnamestr;
                            var checkboxh5 = document.createElement("h5");
                            var checkboxa = document.createElement("a");
                            var checkaboxat = document.createTextNode(res3[i].ThirdLayer + "   ");
                            var checkboxlabel = document.createElement("label");
                            checkboxlabel.className = "switch right";
                            var checkboxinput = document.createElement("input");
                            checkboxinput.type = "checkbox";
                            checkboxinput.id = res3[i].LayerType;
                            // console.log(res3[i].ThirdLayer);
                            checkboxinput.className = "wmsLayer input" + Thirdreplace;
                            checkboxinput.setAttribute("value", res3[i].LayerName);
                            var checkboxspan = document.createElement("span");
                            checkboxspan.className = "slider round";

                            checkboxdiv.appendChild(checkboxh5);
                            checkboxa.appendChild(checkaboxat);
                            checkboxh5.appendChild(checkboxa);
                            checkboxh5.appendChild(checkboxlabel);
                            checkboxlabel.appendChild(checkboxinput);
                            checkboxlabel.appendChild(checkboxspan);

                            document.getElementsByClassName("panel-body " + res3[i].SecondLayer)[0].appendChild(checkboxdiv);
                            // comparing3.push([res[i].ThirdLayer, res[i].LayerName]);
                            // classname.push([res3[i].ThirdLayer +" " + statenamestr + countrynamestr + continentnamestr, statenamestr]);
                            //    classname.push([res3[i].ThirdLayer +" " + statenamestr + countrynamestr + citynamestr, statenamestr]);
                            //});
                        }
                        if(res3[i].LayerType ==='Placemark'){

                            let countrynamestr = res3[i].CountryName.replace(/\s+/g, '');
                            let statenamestr = res3[i].StateName.replace(/\s+/g, '');
                            let citynamestr = res3[i].CityName.replace(/\s+/g, '');
                            // console.log(res3[i].ThirdLayer);

                            var checkboxdiv = document.createElement("div");
                            checkboxdiv.className = "State " + res3[i].ThirdLayer + " " + countrynamestr + statenamestr + citynamestr;
                            // checkboxdiv.className = "State " + res3[i].ThirdLayer + " " + countrynamestr + statenamestr + continentnamestr;
                            var checkboxh5 = document.createElement("h5");
                            var checkboxa = document.createElement("a");
                            var checkaboxat = document.createTextNode(res3[i].ThirdLayer);
                            var checkboxlabel = document.createElement("label");
                            checkboxlabel.className = "switch right";
                            var checkboxinput = document.createElement("input");
                            checkboxinput.type = "checkbox";
                            checkboxinput.id = res3[i].LayerType;
                            // console.log(res3[i].ThirdLayer);
                            checkboxinput.className = "placemarkLayer input" + res3[i].ThirdLayer;
                            checkboxinput.setAttribute("value", res3[i].LayerName);
                            var checkboxspan = document.createElement("span");
                            checkboxspan.className = "slider round";

                            checkboxdiv.appendChild(checkboxh5);
                            checkboxa.appendChild(checkaboxat);
                            checkboxh5.appendChild(checkboxa);
                            checkboxh5.appendChild(checkboxlabel);
                            checkboxlabel.appendChild(checkboxinput);
                            checkboxlabel.appendChild(checkboxspan);

                            document.getElementsByClassName("panel-body " + res3[i].SecondLayer)[0].appendChild(checkboxdiv);
                        }
                    }
                }

            })

    }


});
