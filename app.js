var express = require('express'),
mongo=require('mongodb'),
bpar = require('body-parser'),
//avault = require('avault')
sanitizer = require('sanitizer');

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
    res.status(stts).send(message)
    d.close()
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
function readFlavorName(db, req, res){
    if (!req.query.name){
        resFunc(undefined, res, db, 400, "No query. Needs ?movie=")
        return;
    }
    var icecream_name = sanitize.escape(sanitize.sanitize(req.query['name']))
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

/*Get a movie by it's id.*/
function readFlavorId(db, req, res){
    if (!(req.query.id)){
        resFunc(undefined, res, db, 400, "No query. Needs ?id=")
        return;
    }
    var idx =sanitize.escape(sanitize.sanitize(req.query["id"]))
    var collection = db.collection("categories")
    collection.findOne({ "gidnum":new mongo.ObjectId(idx)}, function(err, r){
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
    if (!(req.query.email)){
        resFunc(undefined, res, db, 400, "No query. Needs ?email=")
        return;
    }
    var idx =sanitize.escape(sanitize.sanitize(req.query["email"]))
    var collection = db.collection("users")
    collection.findOne({ "_id":new mongo.ObjectId(idx)}, function(err, r){
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
    mongof(readFlavor, req, res)
})

//Valid emails:
/*
    test@test.com
*/
app.get('/userByEmail', function(req,res){
    mongof(readUserEmail, req, res)
})

app.listen(PORT, function(){
    console.log("Listening")
})