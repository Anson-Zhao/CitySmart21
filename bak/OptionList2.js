let Continentlevel, Countrylevel,continentObj1,continentObj2,continentObj3;

$(document).ready(function() {
    let x = document.getElementById("myListContinent");
    $.ajax({
        url: "ContinentList",
        dataType: 'json',
        success: function (results) {
            let option;
            for (let i = 0; i < results.length; i++) {
                option = new Option(results[i].ContinentName, results[i].ContinentName);
                x.add(option);
                console.log(option);
            }
        }
    });
});

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else
        //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
        if (i == key && obj[i] == val || i == key && val == '') { //
            objects.push(obj);
        } else if (obj[i] == val && key == '') {
            //only add if the object is not already in the array
            if (objects.lastIndexOf(obj) == -1) {
                objects.push(obj);
            }
        }
    }
    return objects;
}

function ChangeSelectList(continentlevel) {
    console.log(continentlevel);
    Continentlevel = continentlevel;
    $('.Menu').hide();
    $('.State').hide();
    var countryList = document.getElementById("myListCountry");
    while (countryList.options.length) {
        countryList.remove(0);
    }

    if (continentlevel === "AL"){
        $("#myListCountry").html("<option value='AL'> All Layer </option>");
        $("#myListState").html("<option value= 'AL'> All Layer </option>");
        document.getElementById("myListCountry").disabled = true;
        document.getElementById("myListCountry").style.backgroundColor = "lightgray";
        document.getElementById("myListState").disabled = true;
        document.getElementById("myListState").style.backgroundColor = "lightgray";
        $('.Menu').show();
        $('.State').show();
    } else{
        $("#myListCountry").html("<option value = 'SAS'> -Select a Country- </option>");
        $("#myListState").html("<option> -Select a State- </option>");
        document.getElementById("myListCountry").disabled = false;
        document.getElementById("myListCountry").style.backgroundColor = "white";
        $('.Menu').hide();
    }

    $.ajax({
        url: "CountryList",
        dataType: 'json',
        success: function (results) {
            var option;
            for (var i = 0; i < results.length; i++) {
                if (continentlevel === results[i].ContinentName) {
                    option = new Option(results[i].CountryName, results[i].CountryName);
                    countryList.add(option);
                    if(continentlevel === "All Continents"){
                        $.ajax({
                            url: "ClassName",
                            success: function (res) {
                                continentObj1 = res;
                            }
                        })
                    }else{
                        $.ajax({
                            url: "ClassName",
                            success: function (res) {
                                continentObj1 = getObjects(res, 'ContinentName', continentlevel);
                                console.log(continentObj1);
                            }
                        });
                    }
                }
            }
        }
    });
}

function ChangeStateList(countrylevel) {
    Countrylevel = countrylevel;
    $('.Menu').hide();
    $('.State').hide();
    var stateList = document.getElementById("myListState");
    while (stateList.options.length) {
        stateList.remove(0);
    }

    if(countrylevel !== "SAS"){
        $("#myListState").html("<option> -Select a State- </option>");
        document.getElementById("myListState").disabled = false;
        document.getElementById("myListState").style.backgroundColor = "white";
    }
    $.ajax({
        url: "StateList",
        dataType: 'json',

        success: function (results) {
            for(var j = 0; j < results.length; j++){
                if(countrylevel === results[j].CountryName && Continentlevel === results[j].ContinentName){
                    var option = new Option(results[j].StateName, results[j].StateName);
                    stateList.add(option);

                    console.log(results);
                }
            }
        }
    });

    for(var i = 0; i < continentObj1.length; i++){
        if(countrylevel === "All Countries"){
            continentObj2 = continentObj1;
            console.log(continentObj1);
        }else{
            continentObj2 = getObjects(continentObj1, 'CountryName', countrylevel);
        }
    }
}

function ChangeLayerList(statelevel) {
    $('.Menu').hide();
    $('.State').hide();

    for(var i = 0; i < continentObj2.length; i++) {
        if(Countrylevel === "All Countries" && Continentlevel === "All Continents" && statelevel === "All States") {
            $('.Menu').show();
            $('.State').show();
        }else if(Countrylevel === "All Countries" && Continentlevel === "All Continents" && statelevel !== "All States"){
            continentObj3 = getObjects(continentObj2, 'StateName', statelevel);
            myFunction(i);
            console.log(continentObj3);
        }else if(Continentlevel === "All Continents" && Countrylevel !== "All Countries" && statelevel !== "All States"){
            continentObj3 = getObjects(continentObj2, 'StateName', statelevel);
            console.log(continentObj3);
            myFunction(i);
        }else if(Continentlevel !== "All Continents" && Countrylevel === "All Countries" && statelevel === "All States"){
            continentObj3 = continentObj1;
            console.log(continentObj3);
            myFunction(i);
        }else if(Continentlevel !== "All Continents" && Countrylevel !== "All Countries" && statelevel === "All States"){
            continentObj3 = continentObj2;
            myFunction(i);
            console.log(continentObj3);
        }else{
            continentObj3 = getObjects(continentObj2, 'StateName', statelevel);
            console.log(continentObj3);
            myFunction(i);
        }

    }
}

function myFunction(index) {
    var obj1 = continentObj3[index].FirstLayer;
    var obj2 = continentObj3[index].SecondLayer;
    var obj3 = continentObj3[index].ThirdLayer;
    var className1 = "." + obj1;
    var className2 = "." + obj2;
    var className3 = "." + obj3;
    $(className1).show();
    $(className2).show();
    $(className3).show();
    console.log(className1)
}