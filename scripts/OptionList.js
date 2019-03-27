var country;

$(document).ready(function() {
    let countryList = document.getElementById("myListCountry");
    $.ajax({
        url: "CountryList",
        dataType: 'json',
        success: function (results) {
            // console.log(results);
            var option;
            countryList.add(new Option("All Layer", "All Layer"));
            for (let i = 0; i < results.length; i++) {
                option = new Option(results[i].CountryName, results[i].CountryName);
                countryList.add(option);
                // console.log(option);
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

function ChangeCountryList(countrylevel) {
    console.log(countrylevel);
    $('.Menu').hide();
    $('.State').hide();
    var stateList = document.getElementById("myListState");
    while (stateList.options.length) {
        stateList.remove(0);
    }
    if(countrylevel !== "SAS"){
        $("#myListState").html("<option>-Select A State List-</option>");
        document.getElementById("myListState").disabled = false;
        document.getElementById("myListState").style.backgroundColor = "white";
    }
    if(countrylevel === "AL"){
        document.getElementById("myListState").disabled = true ;
        document.getElementById("myListState").style.backgroundColor = "lightgray";
        $("#myListCity").html("<option>-Select A City List-</option>");
        document.getElementById("myListCity").disabled = true ;
        document.getElementById("myListCity").style.backgroundColor = "lightgray";
    }
    if(countrylevel === "All Layer") {
        $('.Menu').show();
        $('.State').show();
        $("#myListState").html("<option>All Layer</option>");
        document.getElementById("myListState").disabled = true;
        document.getElementById("myListState").style.backgroundColor = "lightgray";
        $("#myListCity").html("<option>All Layer</option>");
        document.getElementById("myListCity").disabled = true;
        document.getElementById("myListCity").style.backgroundColor = "lightgray";
    }

    country = "countrylevel="+ countrylevel;
    console.log(country);

    $.ajax({
        url: "StateList",
        method: 'GET',
        dataType: 'json',
        data: country,
        success: function (results) {
            // console.log(results);
            stateList.add(new Option("All Layer", "All Layer"));
            for(var j = 0; j < results.length; j++){
                    var option = new Option(results[j].StateName, results[j].StateName);
                    stateList.add(option);
                    console.log (stateList)
                //}
            }
        }
    });
}


function ChangeStateList(statelevel) {
    console.log(statelevel);
    var cityList = document.getElementById("myListCity");
    while (cityList.options.length) {
        cityList.remove(0);
    }
    $('.Menu').hide();
    $('.State').hide();

    if(statelevel!== "SAS"){
        $("myListCity").html("<option> -Select A City List- </option>");
        document.getElementById("myListCity").disabled = false;
        document.getElementById("myListCity").style.backgroundColor = "white";
    }
    if(statelevel === "All Layer"){
        $("myListCity").html("<option>All Layer</option>");
        document.getElementById("myListCity").disabled = true;
        document.getElementById("myListCity").style.backgroundColor = "lightgray";

    }
    var state = "statelevel="+ statelevel;

    $.ajax({
        url: "CityList",
        method: 'GET',
        dataType: 'json',
        data:state,
        success: function (results) {
            console.log(results);
            cityList.add(new Option("-Select a City List-", "Select a City"));
            for(var j = 0; j < results.length; j++){
                var option = new Option(results[j].CityName, results[j].CityName);
                cityList.add(option);
                console.log (results[j].CityName);
            }
        }
    });
    $.ajax({
        url: "CountryClassName",
        method: 'GET',
        dataType: 'json',
        data:country,
        success: function (results) {
            // console.log(results);
            if (statelevel === "All Layer") {
                myFunction(results);
            }
        }
    });
}

function ChangeCityList(citylevel){
    console.log(citylevel);
    var city = "citylevel="+ citylevel;
    console.log(city);

    $.ajax({
        url: "ClassName",
        method: 'GET',
        dataType: 'json',
        data:city,
        success: function (results) {
                if (citylevel !== "SAS") {
                    myFunction(results);
                }
            }
    });

}

function myFunction(returnCity) {
    for( var i = 0; i <returnCity.length ; i++){
        var obj1 = returnCity[i].FirstLayer;
        var obj2 = returnCity[i].SecondLayer;
        var obj3 = returnCity[i].ThirdLayer;
        var className1 = "." + obj1;
        var className2 = "." + obj2;
        var className3 = "." + obj3;
        $(className1).show();
        $(className2).show();
        $(className3).show();
        console.log(className3);
    }
}

