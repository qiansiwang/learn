//Estimating Mean - K Mean

var EM = EM || {};

//Training steps;
EM.TrainingStep = 10000;

//One dimentional array mean
EM.Mean = function (list){
    var result=0;
    list.forEach(function(e){
        result+= e;
    })
    return result/list.length;
}

//One dimentional array variance
EM.Var = function (list) {
    var result = 0;
    var mean = EM.Mean(list);
    list.forEach(function(e){
        result+= Math.pow((e-mean),2);
    })
    return result/list.length;
}

//One dimentional array normal distribution part calc
EM.NormTerm = function (mean,variance,x){
    var expart = - Math.pow((x-mean),2)/2/variance;
    var result = Math.exp(expart);
    return result;
}

/*
Classifier is the main object
Dataset is a list of values without tag
*/
EM.Classifier = function (dataset, k){
    this.DataSet = dataset;
    this.K = k;
    this.MList =[];
    this.EZList = [];
    this.Result = [];
    this.Var = EM.Var(dataset);
}

/*
Initialize K means
*/
EM.Classifier.prototype.InitializeM = function (){
    // for (var i = 0; i<this.K; i++){
    //     var a = Math.random()*100;
    //     this.MList.push(a);
    // }
    this.MList.push(10);
    this.MList.push(50);
    this.MList.push(80);
}

/*
Estimate Z based on previous MList
result is list of object i,j,result
*/
EM.Classifier.prototype.EstimateZ = function (){
   for (var i = 0; i< this.DataSet.length; i++){
       var bottompart =0;
       var toppart = 0;
       var xi = this.DataSet[i];
       var variance = this.Var;
       for (var j = 0; j<this.K; j++){
           var mean = this.MList[j];
           bottompart += EM.NormTerm(mean,variance,xi);
       }
       for (var k = 0; k<this.K; k++){
           var thismean = this.MList[k];
           toppart = EM.NormTerm(thismean,variance,xi);
           var result = toppart/bottompart;
           var ele = {i:i, j:k, result:result};
           this.EZList[i*this.K+k] = ele;
       }
   }
}

/*
Cluster mean calc based on Estimate Z
*/
EM.Classifier.prototype.UpdateM = function (){
    for (var j = 0; j<this.K; j++){
        var clustertotal = 0;
        var cluster = [];
        for (var i =0; i<this.DataSet.length;i++){
            var xi= this.DataSet[i];
            clustertotal += this.EZList[i*this.K+j].result;
        }
        var tempproduct = 0;
        for (var k=0; k<this.DataSet.length;k++){
            var xk = this.DataSet[k];
            tempproduct += this.EZList[k*this.K+j].result * xk;
        }
        this.MList[j] = tempproduct/clustertotal;        
    }
}

EM.Classifier.prototype.Train = function (){
   this.InitializeM();
   var i=0;
   while (i< EM.TrainingStep){
       this.EstimateZ();
       this.UpdateM();
       i++;
   }
   //after training the data Estimated Z Distribution is the result
   //same i, go through j and take the greatest probibilty result
   for (var m = 0;m<this.DataSet.length;m++){
       var xprob,maxprob,maxindex;
       xprob = [];
       for (var k = 0;k<this.K;k++){
           var ele = this.EZList[m*this.K+k];
           var temp = {cluster:k,result:ele.result};
           xprob.push(temp);
       }
       maxprob = xprob[0].result;
       maxindex = 0;
       for (var n = 1;n<xprob.length;n++){
           if (xprob[n].result>maxprob){
               maxprob = xprob[n].result;
               maxindex = n;
           }
       }
       var resultele = {input:this.DataSet[m],cluster:xprob[maxindex].cluster};
       this.Result.push(resultele);
   }
}

