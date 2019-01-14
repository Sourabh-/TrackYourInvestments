import { Injectable } from "@angular/core";

@Injectable()
export class BasicService {
    constructor() {}

    isEqual(obj1, obj2) {
        if(JSON.stringify(obj1) === JSON.stringify(obj2))
            return true;
        return false;
    }

    shuffleArray(array) {
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array;
	}
}