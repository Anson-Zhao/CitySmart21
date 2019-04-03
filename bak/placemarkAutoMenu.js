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