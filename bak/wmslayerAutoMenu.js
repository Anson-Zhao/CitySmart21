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
                document.getElementsByClassName("State " + Thirdreplace)[0].className = "State " + classname[c][0];

                if (classname[c][1] !== statenamestr) {
                    document.getElementsByClassName(classname[c][0])[0].className += " " + statenamestr;
                }
            }

            break

        }
    }
}