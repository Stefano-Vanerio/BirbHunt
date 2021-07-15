//collision for circumference of the form (x - x0)^2+(y - y0)^2=r^2
function checkCircCollision(x0, y0, r, x, y) {
	if (Math.pow((x-x0),2) + Math.pow((y-y0),2) >= Math.pow(r,2)) {
        return false;
    } else {return true;}
}

//check collision of camera with the borders
function checkCollisionsRocks(){
    for(i=0; i<number_elements; i++) {
        if((object_type[i]==3)||(object_type[i]==4)||(object_type[i]==5)) {
            if(checkCircCollision(cx, cz, 4, object_x_coordinates[i], object_z_coordinates[i])) {
                return true;
            }
        }
    }
    return false;
}

//check collision of camera with the trees
function checkCollisionsTrees(){
    for(i=0; i<number_elements; i++) {
        if((object_type[i]==8)||(object_type[i]==9)||(object_type[i]==10)||(object_type[i]==11)) {
            if(checkCircCollision(cx, cz, 0.7, object_x_coordinates[i], object_z_coordinates[i])) {
                return true;
            }
        }
    }
    return false;
}

//check collisions with red the bird
function checkCollisionBird(){
            if(checkCircCollision(cx, cz, 0.7, bird_dyn_x, bird_dyn_z)) {
                return true;
            }
    return false;
}