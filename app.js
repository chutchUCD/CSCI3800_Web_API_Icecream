/*
    To steamline development, using underscore-node.
    Todo-deploy and test that this works!
*/
var express = require('express'),
_ = require('underscore-node'),
mongo=require('mongodb'),
bpar = require('body-parser'),
//avault = require('avault')
sanitizer = require('mongo-sanitize');

//setup express.
var app = express()
app.use(bpar.json());

var url="mongodb://admin:icecream@ds151450.mlab.com:51450/icecream"

var PORT=3000

//Utility functions
//opens up a mongo db database
function mongof(func, req, res){
    mongo.connect(url, function(err,db){
        if (err){
            console.log(err)
            res.status(500).send("Could not connect to database.")
            return
        }else{
            func(db, req, res)
        }
    });
}

function resFunc(e, res, d, stts, message){
    if(e){
        console.log(e)
    }
    if(d){
        d.close()
    }
    res.status(stts).send(message)
}

function cleanInput(i){
    if (!( _.isString(i))){
        return false
    }
    return _.escape((sanitizer(i)))
}
//Read flavors
function readAllFlavors(db, req, res){
    var collection = db.collection("categories")
    collection.find({"type":"flavor"},{"_id":0}).toArray(function(err, docs){
        if (err){
            resFunc(err, res, db, 500, "Internal Server Error")
        }else{
            resFunc(err, res, db, 200, docs)
        }
    })
}

//Flavor for testing:
/*
    Name: Vanilla
    Id: 0
*/
/* Read Movie -> from the query string, get several movie titles and ids */

function requestEmpty(req, res, needs_value){
    if(!req.query ||  _.isEmpty(req.query)  ){
        resFunc(null, res, null, 400, "No query. Needs "+needs_value)
        return true;
    }
    return false;
}

function readFlavorName(db, req, res){
    if(requestEmpty(req, res, "?name")){
        return;
    }
    console.log(typeof(req.query.name))
    var icecream_name = cleanInput(req.query['name'])
    //no string check required because query string converts to string.
    var collection = db.collection("categories")
    collection.createIndex({"name": "text"}, function(err, result){
        if(err){
            resFunc(err,res,db,500, "Internal Server Error")
    }   else{
        collection.find({"$and":[{"$text": {"$search":icecream_name, "$caseSensitive":false}}, {"type":"flavor"}]}, {"_id":0}).toArray(function(err, docs){
            if (err){
                resFunc(err, res, db, 500, "Internal Server Error")
            }else{
                if(docs.length){
                    resFunc(err, res, db, 200, docs)
                } else{
                    resFunc(err, res, db, 204, "No flavor of that type.")
                }
            }
        })}
    })
}

/*Get a flavor by it's gidnumber.*/
function readFlavorId(db, req, res){
    if(requestEmpty(req, res, "?id")){
        return;
    }
    var idx =cleanInput(req.query["id"])
    idx = Number(idx)
    if(!idx && idx!==0){
        resFunc(null, res, null, 400, "No id.")
        return
    }
    var collection = db.collection("categories")
    collection.findOne({ "$and":[{"gidnum":idx}, {"type":"flavor"}]}, function(err, r){
        if (err){
            resFunc(err, res, db, 500, "Internal server error.")
        }else{
            if(r){
                resFunc(err, res, db, 200, r)
            } else{
                resFunc(err, res, db, 204, "No icecream found.")
            }
        }
    })
}

function readUserEmail(db, req, res){
    if (requestEmpty(req,res,"?email")){
        return;
    }
    var email = cleanInput(req.query.email)
    var collection = db.collection("users")
    collection.findOne({ "email":email}, function(err, r){
        if (err){
            resFunc(err, res, db, 500, "Internal server error.")
        }else{
            if(r){
                resFunc(err, res, db, 200, r)
            } else{
                resFunc(err, res, db, 204, "No icecream found.")
            }
        }
    })
}


app.get('/flavorlist',function(req, res){
    mongof(readAllFlavors, req, res)
})

app.get('/flavorbyname', function(req,res){
    mongof(readFlavorName, req, res)
})

app.get('/flavorbyid', function(req,res){
    mongof(readFlavorId, req, res)
})

//Valid emails:
/*
    test@test.com
*/
app.get('/userbyemail', function(req,res){
    mongof(readUserEmail, req, res)
})

app.listen(PORT, function(err){
    if(err){
        console.log(err)
    }
    console.log("Listening")
})