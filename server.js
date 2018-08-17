
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;
var async = require('async');
var http = require('http');
var url = require('url');
var fs = require('fs');


http.createServer(function (request, response) {



  	const { headers, method, url } = request;
  	let body = [];
  	request.on('error', (err) => {
    		console.error(err);
  	}).on('data', (chunk) => {
    		body.push(chunk);
  	}).on('end', () => {

		if (request.url == "/makeFancy.css") {

			fs.readFile('makeFancy.css', function(err, data) {
    					response.writeHead(200, {'Content-Type': 'text/css'});
    					response.write(data);
    					response.end();
	  			});

		} else if (request.url == "/clientCode.js") {

			fs.readFile('clientCode.js', function(err, data) {
    					response.writeHead(200, {'Content-Type': 'text/javascript'});
    					response.write(data);
    					response.end();
	  			});

    } else if (request.url == "/favicon.ico") {
      fs.readFile('favicon.ico', function(err, data) {
    					response.writeHead(200, {'Content-Type': 'image/x-icon'});
    					response.write(data);
    					response.end();
	  			});
		} else {
			//console.log(request.url);
    			var bodyStr = Buffer.concat(body).toString();

			if (bodyStr == "") {

				fs.readFile('findMyDrink.html', function(err, data) {
    					response.writeHead(200, {'Content-Type': 'text/html'});
    					response.write(data);
    					response.end();
	  			});

			} else if (bodyStr == "RequestDrinks") {
				GetDrinksListAl(function(alDrinksList) {

					GetDrinksListMix(function(mixDrinksList) {
						var drinksList = alDrinksList + mixDrinksList;
						response.writeHead(200, {'Content-Type': 'text/html'});
    						response.write(drinksList);
    						response.end();
					});
				});

			} else {

				var avaliableDrinks = bodyStr.split(" ");
				avaliableDrinks.splice(-1);
				var numAl = parseInt(avaliableDrinks[0]);
				var numMix = parseInt(avaliableDrinks[1]);
				var avaliableAlcoholsDup = avaliableDrinks.slice(2,numAl+2);
				var avaliableMixersDup = avaliableDrinks.slice(numAl+2,numAl+numMix+3);

				var avaliableAlcohols = avaliableAlcoholsDup.reduce(function(a,b){
    					if (a.indexOf(b) < 0 ) a.push(b);
    					return a;
  					},[]);

				var avaliableMixers = avaliableMixersDup.reduce(function(a,b){
    					if (a.indexOf(b) < 0 ) a.push(b);
    					return a;
  					},[]);

				console.log("Avaliable Alcohols:");
				console.log(avaliableAlcohols);
				console.log("AvaliableMixers:");
				console.log(avaliableMixers);


				var alQuery = GetAlQuery(avaliableAlcohols);
				var mixQuery = GetMixQuery(avaliableMixers);

	       			ReadAl(alQuery,avaliableAlcohols,function(possibleAlId) {



					ReadMix(mixQuery,avaliableMixers,function(possibleMixId) {

						console.log("Possible alcohol recipe ids");
						console.log(possibleAlId);
						console.log("Possible mixer recipe ids");
						console.log(possibleMixId);
						var fullId = [];
						var partId = [];

						for (var i = 0; i<possibleAlId.length; i++) {
							if(possibleMixId.indexOf(possibleAlId[i]) === -1) {
								partId.push(possibleAlId[i]);
							} else {
								fullId.push(possibleAlId[i]);
							}

						}

						GetRecDetails(fullId,partId,function(store) {


							response.setHeader("Content-Type", "text/json");
        						response.setHeader("Access-Control-Allow-Origin", "*");
							response.write(JSON.stringify(store));
	       						response.end();

						});

					});

				});

			}
		}

  	});



}).listen(process.env.PORT || 1337);

// Create connection to database
var config = {
  userName: 'smcfarl', // update me
  password: 'D!l!genta', // update me
  server: 'findmydrink.database.windows.net',
  options: {
    database: 'findmydrink',
	encrypt: true
  }
}

var connection1 = new Connection(config);

var connection2 = new Connection(config);

var connection3 = new Connection(config);

var connection4 = new Connection(config);

var connection5 = new Connection(config);


function GetAlQuery(alcohols) {
	return 'SELECT * FROM t_drink_alcohol;';

}

function GetMixQuery(mixers) {
	return 'SELECT * FROM t_drink_mixer;';

}

function GetDrinksListAl(callback) {

	requestAl = new Request('SELECT TOP 1 * FROM t_drink_alcohol;',
    		function(err, rowCount, rows) {
    			if (err) {
        			console.log(err);
    			}
    		});

	var drinksList = "";


    	var alResult = "";
	var alCounter = 0;
    	var alFirst = -1;
    	requestAl.on('row', function(columns) {
        	columns.forEach(function(column) {
	    		if (alFirst == -1) {
				alFirst = column.value;
	    		} else {
                			alResult += column.metadata.colName + " ";
            				alCounter += 1;
	    		}
        	});
		alResult = alCounter + " " + alResult;
		callback(alResult)
    	});

    	connection3.execSql(requestAl);


}

function GetDrinksListMix(callback) {
	requestMix = new Request('SELECT TOP 1 * FROM t_drink_mixer;',
    		function(err, rowCount, rows) {
    			if (err) {
        			console.log(err);
    			}
    		});



    	var mixResult = "";
	var mixCounter = 0;
    	var mixFirst = -1;
    	requestMix.on('row', function(columns) {
        	columns.forEach(function(column) {
	    		if (mixFirst == -1) {
				mixFirst = column.value;
	    		} else {
                			mixResult += column.metadata.colName + " ";
            				mixCounter += 1;
	    		}
        	});

		callback(mixResult);

    	});
    	connection4.execSql(requestMix);



}



function ReadAl(req,avaliableAl,callback) {
    console.log('Reading all rows from the alcohol table...');

    var possibleId = [];

    request = new Request(
    req,
    function(err, rowCount, rows) {
    if (err) {
        console.log(err);
    } else {
        console.log(rowCount + ' row(s) returned');
	callback(possibleId);

    }
    });

    var result = "";
    var includedAl = [];
    var first = -1;

    request.on('row', function(columns) {
        columns.forEach(function(column) {
	    if (first == -1) {
		first = column.value;
		includedAl.push(first);
	    } else {
            	if (column.value === null) {
                	console.log('NULL');
            	} else if (column.value == 1) {
                	result += column.value + " ";
			includedAl.push(column.metadata.colName);
            	} else {
			result += column.value + " ";
	    	}
	    }
        });



	var id = includedAl[0];
	var included = includedAl.slice(1,includedAl.length);

	if (subArray(included,avaliableAl)) {
		possibleId.push(id);
	}


        result = "";
	includedAl = [];
	first = -1;
    });

    // Execute SQL statement
    connection1.execSql(request);


}

function subArray(needle, haystack){
  for(var i = 0; i < needle.length; i++){
    if(haystack.indexOf(needle[i]) === -1)
       return false;
  }
  return true;
}

function ReadMix(req,avaliableMix,callback) {
    console.log('Reading all rows from the mixers table...');
    var possibleId = []
    request = new Request(
    req,
    function(err, rowCount, rows) {
    if (err) {
        console.log(err);
    } else {
        console.log(rowCount + ' row(s) returned');
	callback(possibleId);

    }
    });

    var result = "";
    var includedMix = [];
    var first = -1;
    request.on('row', function(columns) {
        columns.forEach(function(column) {
	    if (first == -1) {
		first = column.value;
		includedMix.push(first);
	    } else {
            	if (column.value === null) {
                	console.log('NULL');
            	} else if (column.value == 1) {
                	result += column.value + " ";
			includedMix.push(column.metadata.colName);
            	} else {
			result += column.value + " ";
	    	}
	    }
        });

	var id = includedMix[0];
	var included = includedMix.slice(1,includedMix.length);


	if (subArray(included,avaliableMix)) {
		possibleId.push(id);
	}


        result = "";
	includedMix = [];
	first = -1;
    });

    // Execute SQL statement
    connection2.execSql(request);
}

function GetRecDetails(fullId,partId,callback) {

	var ids = fullId.concat(partId);
	var idsStr = "(" + ids.toString() + ")";

	var requestStr = "SELECT * FROM t_drink_info WHERE id IN " + idsStr + ";";


	var store = {	"full" : [],
			"partial" : []
	}


	if (ids.length == 0) {
		callback(store)
	} else {

		request = new Request(requestStr,
    			function(err, rowCount, rows) {
    				if (err) {
       		 			console.log(err);
    				} else {
					callback(store);
				}
    			});




	    	var newDrink = {"drink":
			{
				"name":"",
				"picLink":"",
				"recipeLink":""

			}
		};

		var full = 0;
   	 	request.on('row', function(columns) {
       		 	columns.forEach(function(column) {
				if (column.metadata.colName == "Id") {
					if (fullId.indexOf(parseInt(column.value)) === -1) {
						full = 0;
					} else {
						full = 1;

					}
				} else if (column.metadata.colName == "DrinkName") {
					newDrink.drink.name = column.value;

				} else if (column.metadata.colName == "Picture") {
					newDrink.drink.picLink = column.value;

				} else if (column.metadata.colName == "Recipe") {
					newDrink.drink.recipeLink = column.value;
				}


        		});


			if (full == 1) {
				store.full.push(newDrink);
			} else {
				store.partial.push(newDrink);
			}


        		console.log(newDrink);
			newDrink = {"drink":
				{
					"name":"",
					"picLink":"",
					"recipeLink":""
				}

			};
			full = 0;

    		});
    		connection5.execSql(request);
	}


}



// Attempt to connect and execute queries if connection goes through
connection1.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection 1 successful');
  }
});

// Attempt to connect and execute queries if connection goes through
connection2.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection 2 successful');
  }
});

// Attempt to connect and execute queries if connection goes through
connection3.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection 3 successful');
  }
});

// Attempt to connect and execute queries if connection goes through
connection4.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection 4 successful');
  }
});


// Attempt to connect and execute queries if connection goes through
connection5.on('connect', function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Connection 5 successful');
  }
});
