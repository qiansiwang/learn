var REGRESSION = REGRESSION || {};

REGRESSION.TrainingStep = 0.0000005;

//Linear function is linear function of two vector x and w, x0=1
REGRESSION.LinearFunction = function (x, w){
    var result = 0;
    for (var i =0; i<x.length;i++){
        result += x[i]*w[i];
    }   
    return result;
}

//Batch Error function takes vector x, apply w, compare with t
REGRESSION.ErrorFunction = function (x, w, t, func){
    var o = func(x,w);
    var error = Math.pow((t - o),2)/2;
    return error;
} 

//Dataset has property of Key and Value
REGRESSION.DataSet = function (x,y){
    this.Key = x;
    this.Value = y;
}

//Each training example calculate term for adding delta w
REGRESSION.GradientTerm = function (t, x, w, func){
    var o = func(x, w);
    var term = (t - o) * REGRESSION.TrainingStep;
    return term;
}

//Batch Gradient Decent Weight Step, training set is a list of key value pair
//Key is array of x, value is target value. Return new delta w[]
REGRESSION.BatchDeltaW = function (trainingset, currentw, func){
    var result=[];
    for (var i = 0; i<currentw.length;i++){
        var ele = 0;
        trainingset.forEach(function (e){
            if (e.hasOwnProperty('Key') && e.hasOwnProperty('Value')){
                 var term = REGRESSION.GradientTerm(e.Value, e.Key, currentw, func);
                 //this assumes linear
                 ele += term * e.Key[i];
            }
        })
        result.push(ele);
    }
    return result;
}

//Initialize w by x, add one more because of w0
REGRESSION.InitializeW = function (trainingset){
    var x = trainingset[0].Key;
    var result= [];
    for (var i = 0; i<x.length;i++){
        result.push(0);
    }
    return result;
}

//Main Learning
REGRESSION.Learn = function (trainingset, steps, func){
    var w = REGRESSION.InitializeW(trainingset);
    for (var i = 0;i<steps; i++){
        w.forEach(function(e,j){
            w[j] += REGRESSION.BatchDeltaW(trainingset, w, func)[j]; 
        })
        console.log(w);
    }
    return w;
}


