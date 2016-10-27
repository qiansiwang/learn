//naive bayes classifier 

var NBC = NBC || {};

/*
collect all distinct features in learning dataset
dataset is a list of key value pair
key is array, whereas value is single value
*/
NBC.CollectAllFeatures = function (dataset){
    var initiallist = [];
    dataset.forEach(function(e){
        e.Key.forEach(function(ele){
            initiallist.push(ele);
        })
    })
    return NBC.SqueezeList(initiallist);
}

/*
return a unique list of value
very brute way of deduplicate
*/
NBC.SqueezeList = function (list){
    var result = list.map(function(e){return e;});
    var tbc;
    result.forEach(function(e,i){
        tbc = e;
        for (var j = i+1; j<result.length; j++){
            if (tbc === result[j]){
                result.splice(j,1);
            }
        }
    })
    return result;
}

//Classifier object contains Pv and Pwv
NBC.Classifier = function (dataset){
    this.DataSet = dataset;
    this.PvList = NBC.PvCalc(dataset);
    this.PwvList = NBC.PwvCalc(dataset);
}

NBC.Classifier.prototype.Classify = function (key){
    var resultlist;
    var pv = this.PvList;
    var pwv = this.PwvList;
    var allfeatures = NBC.CollectAllFeatures(this.DataSet);
    var newkey, result;
    //find overlap between key and all features
    key.forEach(function(e){
        allfeatures.forEach(function(j){
            if (e === j){
                newkey.push(e)
            }
        })
    })
    //calculate probability of all groups
    pv.forEach(function (e){
        var result = e.result;
        var product = 1;
        newkey.forEach(function(j){
            pwv.forEach(function (k){
                if (k.v === e.v && j === k.w){
                    product = product * k.result;
                }
            })    
        })
        result = result* product;
        var ele = {v:e.v, result:result};
        resultlist.push(ele)
    })
    var tempvalue = resultlist[0].result;
    result = resultlist[0].v;
    for (var i = 1; i<resultlist.length; i++){
        if (resultlist[i].result > tempvalue){
            tempvalue = resultlist[i].result;
            result = resultlist[i].v;
        }
    }
    return result;
}

/*
calculate all P(v)
*/
NBC.PvCalc = function (dataset){
    var result = [];
    var valuelist = dataset.map(function(e){return e.Value});
    valuelist.forEach(function(e){
        var counter = NBC.ValueCounter(e,valuelist);
        var ele = {v:e};
        ele.result = counter/valuelist.length; 
        result.push(ele);
    })
    return NBC.SqueezeList(result);
}


/*
calculate all P(w|v)
*/
NBC.PwvCalc = function (dataset){
    var result = [];
    var grouppairs = NBC.UniquePairCalc(dataset);
    var allkeys = NBC.CollectAllFeatures(dataset);
    grouppairs.forEach(function(e){
        var features = e.Key;
        var n = features.length;
        allkeys.forEach(function(j){
            var count = NBC.ValueCounter(j, e.Key);
            var component = {w:j, v:e.Value};
            component.result = (count+1)/(n+allkeys.length);
            result.push(component)
        })
    })  
    return result;
}

/*
group by unique value, return list of key value pair  
*/
NBC.UniquePairCalc = function (dataset){
    var featurelists = []
    var uniquevaluelist = NBC.SqueezeList(dataset.map(function(e){return e.Value}));
    uniquevaluelist.forEach(function(e){
        var featurelist = [];
        for (var i = 0; i<dataset.length; i++){
            if (dataset[i].Value === e){
                dataset[i].Key.forEach(function (ele){
                    featurelist.push(ele);
                })
            }
        }
        var paricomponent = {Value:e, Key:featurelist};
        featurelists.push(paricomponent);
    })
    return featurelists;
}

/*
count identical value from list
*/
NBC.ValueCounter = function (value, list){
    var result= 0;
    for (var j =0; j<list.length; j++){
            if (list[j] === value){
                result++;
            }
    }
}