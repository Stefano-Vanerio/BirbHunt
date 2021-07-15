var object_x_coordinates = [];
var object_z_coordinates = [];
var not_chosen_x = [];
var not_chosen_z = [];
var object_type = [];
var not_chosen_counter = 0;
var bird_x_coordinate;
var bird_dyn_x;
var bird_z_coordinate;
var bird_dyn_z;
var bird_y_coordinate=2;
var bird_dyn_y=2;
var bird_rotation;
var number_elements = 0;

var maxX= 50;
var minX= -50;
var maxZ= 50;
var minZ= -50;
var maxType = 11;
var minType = 1;
var maxBoundary = 5;
var minBoundary = 3;
var indexX;
var indexZ;
var threshold = 0.9;
var random;

var lastFlower=false;
var bad_choice=true;
var world_generation_done = false;
var birdPositioned = false;

//generation of the world, spawn of elements in different positions
//part of code used to avoid generation of too close trees
function world_generation () {
    if(!world_generation_done){
        for (indexX=minX+5; indexX<maxX-5; indexX++) {
            for (indexZ=minZ+5; indexZ<maxZ-5; indexZ++) {
                random = Math.random();
                if(!((indexX<4 && indexX>-4) && (indexZ<4 && indexZ>-4))){
                    //if random above threshold an element is generated
                    if(random > threshold) {
                        var element = Math.floor(Math.random()*(maxType-minType))+minType;
                        if (isTree(element)){
                             if(indexX==minX+5) {       //first raw
                                if(!(indexZ==minZ+5)){  //not first column
                                    if (isTree(object_type[element-1])){
                                        element = randomNotTree();  
                                    }
                                }                               
                            } else {                    //other raws
                                if(!(indexZ==minZ+5)){  //not first column
                                    if (indexZ==maxZ-6) {
                                    if (isTree(object_type[element-1]) || isTree(object_type[element-90]) || isTree(object_type[element-91])){
                                        element = randomNotTree(); 
                                    }}
                                    else {
                                        if (isTree(object_type[element-1]) || isTree(object_type[element-90]) || isTree(object_type[element-91]) || isTree(object_type[element-89])){
                                            element = randomNotTree(); 
                                        }
                                    }
                                } else {
                                    if (isTree(object_type[element-90]) || isTree(object_type[element-89])){
                                        element = randomNotTree(); 
                                }
                            }
                        }
                    }
                        object_type[number_elements] = element;
                        //more flowers!
                        if (object_type[number_elements]<6 && object_type[number_elements]>2) {
                            object_type[number_elements]=1;
                        }
                        object_x_coordinates[number_elements] = indexX;
                        object_z_coordinates[number_elements] = indexZ;
                        number_elements += 1;
                    } else {
                        //save of the not filled positions
                        not_chosen_x[not_chosen_counter]=indexX;
                        not_chosen_z[not_chosen_counter]=indexZ;
                        not_chosen_counter= not_chosen_counter+1;
                        }
                    }
                }
            }
        rockGeneration();   
        birdPostioning();
    } 
    world_generation_done = true;
}

//generation of the rocks on all the borders of the map
function rockGeneration(){
    //upper border
    for(indexX=minX; indexX<maxX; indexX=indexX+5){
        object_type[number_elements] = Math.floor(Math.random()*(maxBoundary-minBoundary)+minBoundary);
        object_x_coordinates[number_elements] = indexX;
        object_z_coordinates[number_elements] = maxZ;
        number_elements += 1;
    }
    //lower border
    for(indexX=minX; indexX<maxX; indexX=indexX+5){
        object_type[number_elements] = Math.floor(Math.random()*(maxBoundary-minBoundary)+minBoundary);
        object_x_coordinates[number_elements] = indexX;
        object_z_coordinates[number_elements] = minZ;
        number_elements += 1;
    }
    //left border
    for(indexZ=minZ; indexZ<maxZ; indexZ= indexZ+5){
        object_type[number_elements] = Math.floor(Math.random()*(maxBoundary-minBoundary)+minBoundary);
        object_x_coordinates[number_elements] = minX;
        object_z_coordinates[number_elements] = indexZ;
        number_elements += 1;    
    }
    //right border
    for(indexZ=minZ; indexZ<maxZ; indexZ= indexZ+5){
        object_type[number_elements] = Math.floor(Math.random()*(maxBoundary-minBoundary)+minBoundary);
        object_x_coordinates[number_elements] = maxX;
        object_z_coordinates[number_elements] = indexZ;
        number_elements += 1; 
    }
}

//positions the bird in a position where we haven't other elements
function birdPostioning() {
    //choice of a "good" position
    while(bad_choice) {
    var chosen = Math.floor(Math.random()*(not_chosen_counter-1));
    
    //bird not positioned in a place too close to start or too close to borders
    if(not_chosen_x[chosen]>4 && not_chosen_z[chosen]>4 && not_chosen_z[chosen]<42 && not_chosen_x[chosen]<42){
        bad_choice=false;}
    }

    bird_x_coordinate=not_chosen_x[chosen];
    bird_z_coordinate=not_chosen_z[chosen];
    bird_dyn_x=bird_x_coordinate;
    bird_dyn_z=bird_z_coordinate;
    bird_rotation = Math.random()*360;
}

//function that returns if an element is a tree
function isTree(element){
    if ((element == 9) || (element==10) || (element ==8) || (element==11))
    {return true;}
    return false;
}

//generation of a random element different from a tree
function randomNotTree(){
    var x;
    var z;
    if(lastFlower) {
        x=2;
        z=1;
        lastFlower=false;
    } else {
        x=2;
        z=6;
        lastFlower=true;
    }
    return Math.floor(Math.random()*(x))+z;
}