assert = require('assert')

function _MAKEDESERT(db, data){
    var desert = {'name':undefined,
            'describes':undefined
             }
    if (!(data.id_string))
        var col = db.collections('icecream')
        icecream.flavor = data.flavor
        icecream.size=data.size
        icecream.cone=data.cone
        icecream.toppings=data.toppings
        
    }
}

function _MAKEICECREAM(db, data){
    /*
        size is the number of scoops
        type is set to one, corresponding to a type like cone, bowl,
        milkshake.
    */
    var icecream = {'size':1,
        'type':1,
        
    }
    assert.ok(data.flavor, "No flavor")
    assert.ok(data.cone, "No cone")
    if (data.size){
        icecream.size=size
    }
    if (data.type){
        icecream.type=data.type
    }
    icecream.toppings=[]
    
    data.toppings.foreach(function(each){
        icecream['toppings'].push(each)
    })
    /*Construct the unique id from icecream flavor, a number of 
    unique strings and a number of toppings*/
    unique_id = icecream['flavor'].id_string + icecream['cone'].id_string
    icecream.toppings.foreach(
        function(each){
            unique_id = unique_id + each.id_string
        }
    )
    icecream['id_string']=unique_id
    col = db.collection('icecream')
    col.insertOne(icecream, function(err,r){
        if (err){
            console.log(err)
        }
        db.close()
    })
}