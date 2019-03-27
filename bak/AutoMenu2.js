var firstlayer = [];//all first layer values without repeat?
var secondlayer = [];
var thirdlayer = [];
var layervalue =[];
var comparing = [];
var comparing3 = [];
var classname = [];

function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; })
}

$(document).ready(function () {
    //Main Menu creating starts here
    var parentmenu = document.getElementById("accordion");

    $.ajax({
        type: "GET",
        url: "createlayer",
        dataType: "json",
        success: function (res) {
            var removefirstlayer = unpack(res, 'FirstLayer');// all first layer values
            var removesecondlayer = unpack(res, 'SecondLayer');
            var removethirdlayer = unpack(res,"ThirdLayer");
            var Layerinfo = unpack(res,"LayerName");

            $.each(removefirstlayer, function (index, value) {
                if($.inArray(value, firstlayer) === -1) firstlayer.push(value);
                if (index === removefirstlayer.length - 1) {
                    console.log (firstlayer);
                }
            });
            $.each(removesecondlayer, function (index, value) {
                if($.inArray(value, secondlayer) === -1) secondlayer.push(value);
                if (index === removesecondlayer.length - 1) {
                    console.log (secondlayer);
                }
            });
            $.each(removethirdlayer, function (index, value) {
                if($.inArray(value, thirdlayer) === -1) thirdlayer.push(value);
                if (index === removethirdlayer.length - 1) {
                    console.log (thirdlayer);
                }
            });
            $.each(Layerinfo, function (index, value) {
                layervalue.push(value);
                if (index === Layerinfo.length - 1) {
                    console.log (layervalue);
                }
            });

            if(comparing.length === 0){
                comparing.push(["firstlayer","secondlayer"]);
            }
            if(comparing3.length === 0){
                comparing3.push(["thirdlayer","layermenu"]);
            }
            if(classname.length === 0){
                classname.push("classname");
            }

            var createfirstlayer = function() {

                $.each(firstlayer, function (i) {

                    var paneldefault1 = document.createElement("div");
                    paneldefault1.className = "Menu panel panel-info " + firstlayer[i] ;
                    // paneldefault1.id = firstlayer[i];

                    var panelheading1 = document.createElement("div");
                    panelheading1.className = "panel-heading";

                    var paneltitle1 = document.createElement("h4");
                    paneltitle1.className = "panel-title";

                    var collapsed1 = document.createElement("a");
                    collapsed1.className = "collapsed";
                    collapsed1.setAttribute("data-toggle", "collapse");
                    collapsed1.setAttribute("data-parent", "#accordion");
                    // collapsed1.href = "#collapse" + i;
                    collapsed1.href = "#" + firstlayer[i];

                    var firstlayername = document.createTextNode(firstlayer[i] + "  ");
                    firstlayername.className = "menuwords";
                    var collapseone = document.createElement("div");
                    collapseone.className = "panel-collapse collapse";
                    // collapseone.id = "collapse" + i;
                    collapseone.id = firstlayer[i];

                    var panelbody1 = document.createElement("div");
                    panelbody1.className = "panel-body";
                    var panelgroup1 = document.createElement("div");
                    panelgroup1.className = "panel-group " + firstlayer[i];
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
                });

            };

            var createotherlayer = function() {
                $.each(res, function (i) {
                    for (var v = 0; v < comparing.length; v++) {
                        //secondlayer beginning
                        if (comparing[v][1] !== res[i].SecondLayer) {
                            if(v === comparing.length - 1) {
                                var paneldefault2 = document.createElement("div");
                                paneldefault2.id = res[i].SecondLayer;
                                paneldefault2.className = "Menu panel panel-info "+ res[i].SecondLayer;
                                var panelheading2 = document.createElement("div");
                                panelheading2.className = "panel-heading " + res[i].FirstLayer + "-" + res[i].SecondLayer;
                                var paneltitle2 = document.createElement("h4");
                                paneltitle2.className = "panel-title " + res[i].FirstLayer + "-" + res[i].SecondLayer;
                                var collapsed2 = document.createElement("a");
                                collapsed2.className = "collapsed";
                                // collapsed2.id = res[i].FirstLayer + "-" + res[i].SecondLayer;
                                collapsed2.setAttribute("data-toggle", "collapse");
                                collapsed2.setAttribute("data-parent", "#nested");
                                collapsed2.href = "#" + res[i].FirstLayer + "-" + res[i].SecondLayer;
                                var secondlayername = document.createTextNode(res[i].SecondLayer + "  ");
                                secondlayername.className = "menuwords";
                                var nested1c1 = document.createElement("div");
                                nested1c1.id = res[i].FirstLayer + "-" + res[i].SecondLayer;
                                nested1c1.className = "panel-collapse collapse";
                                var panelbody3 = document.createElement("div");
                                panelbody3.className = "panel-body " + res[i].SecondLayer;

                                paneldefault2.appendChild(panelheading2);
                                panelheading2.appendChild(paneltitle2);
                                paneldefault2.appendChild(nested1c1);
                                nested1c1.appendChild(panelbody3);
                                collapsed2.appendChild(secondlayername);
                                paneltitle2.appendChild(collapsed2);
                                // console.log(paneldefault2);

                                document.getElementsByClassName("panel-group " + res[i].FirstLayer)[0].appendChild(paneldefault2);
                                comparing.push([res[i].FirstLayer, res[i].SecondLayer]);
                            }
                        } else {break}
                    }// secondlayer ending

                    if (res[i].LayerType === "Wmslayer") {
                        let Thirdreplace = res[i].ThirdLayer.replace(/\s+/g, '');
                        let continentnamestr = res[i].ContinentName.replace(/\s+/g, '');
                        let countrynamestr = res[i].CountryName.replace(/\s+/g, '');
                        let statenamestr = res[i].StateName.replace(/\s+/g, '');

                        for (var c = 0; c < comparing3.length; c++) {
                            if (comparing3[c][0] !== res[i].ThirdLayer) {
                                if (c === comparing3.length - 1) {
                                    var checkboxdivG = document.createElement("div");
                                    checkboxdivG.className = "State " + Thirdreplace + " " + statenamestr + countrynamestr + continentnamestr;
                                    checkboxdivG.id = res[i].ThirdLayer;
                                    var checkboxh5G = document.createElement("h5");
                                    var checkboxaG = document.createElement("a");
                                    //add url, and open in new window
                                    // checkboxaG.href = "https://mail.google.com";
                                    // checkboxaG.target = "_blank";
                                    var checkaboxatG = document.createTextNode(res[i].ThirdLayer + "   ");
                                    checkaboxatG.className = "menuwords";
                                    var checkboxlabelG = document.createElement("label");
                                    checkboxlabelG.className = "switch right";
                                    var checkboxinputG = document.createElement("input");
                                    checkboxinputG.type = "checkbox";
                                    checkboxinputG.className = "wmsLayer input" + Thirdreplace;
                                    // checkboxinputG.id = res[i].LayerType;
                                    checkboxinputG.setAttribute("value", res[i].LayerName);
                                    var checkboxspanG = document.createElement("span");
                                    checkboxspanG.className = "slider round";
                                    checkboxdivG.appendChild(checkboxh5G);
                                    checkboxaG.appendChild(checkaboxatG);
                                    checkboxh5G.appendChild(checkboxaG);
                                    checkboxh5G.appendChild(checkboxlabelG);
                                    checkboxlabelG.appendChild(checkboxinputG);
                                    checkboxlabelG.appendChild(checkboxspanG);
                                    document.getElementsByClassName("panel-body " + res[i].SecondLayer)[0].appendChild(checkboxdivG);
                                    comparing3.push([res[i].ThirdLayer, res[i].LayerName]);
                                    if (i === res.length - 1) {
                                        console.log (comparing3.length)
                                    }
                                    classname.push([Thirdreplace +" " + continentnamestr + countrynamestr + statenamestr, statenamestr]);
                                }

                            } else {
                                if (i === res.length - 1) {
                                    console.log (comparing3.length)
                                }
                                if (comparing3[c][1] !== res[i].LayerName) {
                                    document.getElementsByClassName("input" + Thirdreplace)[0].removeAttribute("value");
                                    comparing3[c][1] += "," + res[i].LayerName;
                                    document.getElementsByClassName("input" + Thirdreplace)[0].setAttribute("value", comparing3[c][1]);
                                }
                                if (classname[c][0] !== Thirdreplace +" " + continentnamestr + countrynamestr + statenamestr) {
                                    classname[c][0] += " " + continentnamestr + countrynamestr + statenamestr;
                                    // classname[c][1] += res[i].CityName;
                                    document.getElementsByClassName("State " + Thirdreplace)[0].className = "State " + classname[c][0];

                                    if (classname[c][1] !== statenamestr) {

                                        document.getElementsByClassName(classname[c][0])[0].className += " " + statenamestr;
                                    }
                                }

                                break

                            }
                        }
                    }

                    if (res[i].LayerType === "Placemark") {
                        let continentnamestr = res[i].ContinentName.replace(/\s+/g, '');
                        let countrynamestr = res[i].CountryName.replace(/\s+/g, '');
                        let statenamestr = res[i].StateName.replace(/\s+/g, '');
                        for (var a = 0; a < comparing3.length; a++) {

                            if (comparing3[a][0] !== res[i].ThirdLayer) {

                                if (a === comparing3.length - 1) {
                                    var checkboxdiv = document.createElement("div");
                                    checkboxdiv.className = "State " + res[i].ThirdLayer + " " + countrynamestr + statenamestr + continentnamestr;
                                    var checkboxh5 = document.createElement("h5");
                                    var checkboxa = document.createElement("a");
                                    var checkaboxat = document.createTextNode(res[i].ThirdLayer);
                                    var checkboxlabel = document.createElement("label");
                                    checkboxlabel.className = "switch right";
                                    var checkboxinput = document.createElement("input");
                                    checkboxinput.type = "checkbox";
                                    checkboxinput.id = res[i].LayerType;
                                    checkboxinput.className = "input" + res[i].ThirdLayer;
                                    checkboxinput.setAttribute("value", res[i].LayerName);
                                    var checkboxspan = document.createElement("span");
                                    checkboxspan.className = "slider round";
                                    checkboxdiv.appendChild(checkboxh5);
                                    checkboxa.appendChild(checkaboxat);
                                    checkboxh5.appendChild(checkboxa);
                                    checkboxh5.appendChild(checkboxlabel);
                                    checkboxlabel.appendChild(checkboxinput);
                                    checkboxlabel.appendChild(checkboxspan);
                                    document.getElementsByClassName("panel-body " + res[i].SecondLayer)[0].appendChild(checkboxdiv);
                                    comparing3.push([res[i].ThirdLayer, res[i].LayerName]);
                                    if (i === res.length - 1) {
                                        console.log (comparing3)
                                    }
                                    classname.push([res[i].ThirdLayer +" " + statenamestr + countrynamestr + continentnamestr, statenamestr]);

                                }
                            } else {
                                if (i === res.length - 1) {
                                    console.log (comparing3.length)
                                }
                                document.getElementsByClassName("input" + res[i].ThirdLayer)[0].setAttribute("value", res[i].LayerName);
                                if (classname[a][0] !== res[i].ThirdLayer +" "+ statenamestr + " " + countrynamestr) {
                                    classname[a][0] += " " + statenamestr + countrynamestr + continentnamestr;
                                    document.getElementsByClassName("State " + res[i].ThirdLayer)[0].className ="State "+ classname[a][0];

                                    if (classname[a][1] !== statenamestr) {
                                        document.getElementsByClassName(classname[a][0])[0].className += " " + statenamestr;
                                    }
                                }

                                break

                            }

                        }
                    }

                });

            };

            createotherlayer(createfirstlayer());
        }
    });

});
