
document.getElementById('removeAlcohol').style.visibility = 'hidden';
document.getElementById('removeMixer').style.visibility = 'hidden';

var alcohols = {};
var mixers = {};

var xhttpDrinks = new XMLHttpRequest();

xhttpDrinks.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {


		var drinksArray = this.responseText.split(" ");
		drinksArray.splice(-1);
		var numAl = parseInt(drinksArray[0]);
		var numMix = drinksArray.length - numAl - 1;
		var alcoholArray = drinksArray.slice(1,numAl+1);
		var mixerArray = drinksArray.slice(numAl+1,numAl +numMix +2);





		alcohols = alcoholArray.reduce((acc, elem) => {
				acc[elem] = elem.replace(/_/g, " "); // or what ever object you want inside
				return acc
			}, {})


		var alcoholEntry1 = document.getElementById("alcoholEntry1")
		for(index in alcohols) {
					alcoholEntry1.options[alcoholEntry1.options.length] = new Option(alcohols[index], index);
		}

		mixers = mixerArray.reduce((acc, elem) => {
				acc[elem] = elem.replace(/_/g, " "); // or what ever object you want inside
				return acc
			}, {})


   			}
		};


xhttpDrinks.open("POST", "", true);
xhttpDrinks.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
var drinkRequest = "RequestDrinks";


xhttpDrinks.send(drinkRequest);

var alcoholCounter = 1;

var mixerCounter = 0;



const button = document.getElementById('findButton');
button.addEventListener('click', function(e) {
	var xhttp = new XMLHttpRequest();

	xhttp.onreadystatechange = function() {
  	if (this.readyState == 4 && this.status == 200) {



			var h2Full = document.createElement('h2');
			h2Full.appendChild(document.createTextNode("Drinks you can complete:"));

			var h2Partial = document.createElement('h2');

			h2Partial.appendChild(document.createTextNode("Drinks you just have the alcohol for:"));


			document.getElementById('fullReturnData').appendChild(h2Full);
			document.getElementById('partialReturnData').appendChild(h2Partial);


			var data = eval('(' + this.responseText + ')');
			for (var con=0;con<data.full.length;con++)
			{
				var x = document.createElement('div');
				x.className = 'fullDrink';
				var y = document.createElement('h3');
				y.appendChild(document.createTextNode(data.full[con].drink.name));
				x.appendChild(y);

				var breakEl = document.createElement('br');
				x.appendChild(breakEl);

				var a = document.createElement('img');
				a.src = data.full[con].drink.picLink;
				x.appendChild(a);


				var breakEl2 = document.createElement('br');
				x.appendChild(breakEl2);


				var link = document.createElement('a');
    					link.setAttribute('href', data.full[con].drink.recipeLink);
				var button = document.createElement('button');
				button.appendChild(document.createTextNode(data.full[con].drink.name + ' Recipe'));

   						link.appendChild(button);



				x.appendChild(link);




				document.getElementById('fullReturnData').appendChild(x);
			}

			for (var con2=0;con2<data.partial.length;con2++)
			{
				var x = document.createElement('div');
				x.className = 'partialDrink';
				var y = document.createElement('h3');
				y.appendChild(document.createTextNode(data.partial[con2].drink.name));
				x.appendChild(y);


				var breakEl = document.createElement('br');
				x.appendChild(breakEl);

				var a = document.createElement('img');
				a.src = data.partial[con2].drink.picLink;
				x.appendChild(a);


				var breakEl2 = document.createElement('br');
				x.appendChild(breakEl2);

				var link = document.createElement('a');
    					link.setAttribute('href', data.partial[con2].drink.recipeLink);
				var button = document.createElement('button');
				button.appendChild(document.createTextNode(data.partial[con2].drink.name + ' Recipe'));

   						link.appendChild(button);


				x.appendChild(link);


				document.getElementById('partialReturnData').appendChild(x);
			}



   				}
			};


	xhttp.open("POST", "", true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	var data = "" + alcoholCounter + " " + mixerCounter + " ";
	var i;
	for (i = 0; i < alcoholCounter; i++) {
	 	data = data + document.getElementById("alcoholEntry"+(i+1)).value + " ";
	}

	var j;
	for (j = 0; j < mixerCounter; j++) {
	 	data = data + document.getElementById("mixerEntry"+(j+1)).value + " ";
	}


	xhttp.send(data);
});


const addAlButton = document.getElementById('addAlcohol');
addAlButton.addEventListener('click', function(e) {
	alcoholCounter = alcoholCounter +1;

	var f = document.getElementById("alcoholForm");


	var i = document.createElement("select");
	i.setAttribute('id',"alcoholEntry"+alcoholCounter);
	i.setAttribute('name',"alcohols" + alcoholCounter);






	for(index in alcohols) {
				i.options[i.options.length] = new Option(alcohols[index], index);
	}



	var linebreak = document.createElement("br");
	linebreak.setAttribute('id',"lineBreak"+alcoholCounter);

	f.appendChild(i);

	f.appendChild(linebreak);
	if (alcoholCounter == 2) {
		document.getElementById('removeAlcohol').style.visibility = 'visible';
	}


});


const removeAlButton = document.getElementById('removeAlcohol');
removeAlButton.addEventListener('click', function(e) {

	if (alcoholCounter >1) {

		var f = document.getElementById("alcoholForm");


		var i = document.getElementById("alcoholEntry"+alcoholCounter);


		var j = document.getElementById("lineBreak"+alcoholCounter);
		f.removeChild(i);
		f.removeChild(j);

		alcoholCounter = alcoholCounter -1;
		if (alcoholCounter == 1) {
			//Hide remove button
			document.getElementById('removeAlcohol').style.visibility = 'hidden';

		}
	}
});




const addMixButton = document.getElementById('addMixer');
addMixButton.addEventListener('click', function(e) {
	mixerCounter = mixerCounter +1;

	var g = document.getElementById("mixerForm");


	var j = document.createElement("select");
	j.setAttribute('id',"mixerEntry"+mixerCounter);
	j.setAttribute('name',"mixers" + mixerCounter);






	for(index in mixers) {
				j.options[j.options.length] = new Option(mixers[index], index);
	}



	var linebreak2 = document.createElement("br");
	linebreak2.setAttribute('id',"mixLineBreak"+mixerCounter);

	g.appendChild(j);

	g.appendChild(linebreak2);

	if (mixerCounter == 1) {
		document.getElementById('removeMixer').style.visibility = 'visible';
	}


});

const removeMixButton = document.getElementById('removeMixer');
removeMixButton.addEventListener('click', function(e) {

	if (mixerCounter >0) {

		var f2 = document.getElementById("mixerForm");


		var i2 = document.getElementById("mixerEntry"+mixerCounter);


		var j2 = document.getElementById("mixLineBreak"+mixerCounter);
		f2.removeChild(i2);
		f2.removeChild(j2);

		mixerCounter = mixerCounter -1;
		if (mixerCounter == 0) {
			//Hide remove button
			document.getElementById('removeMixer').style.visibility = 'hidden';

		}
	}
});
