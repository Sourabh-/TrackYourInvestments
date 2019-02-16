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

	sortObjectArr(arr, key = 'id', isDesc = false) {
		if(!arr || (arr && !arr.length)) 
			return arr;
		let sortedArr = JSON.parse(JSON.stringify(arr));
		if(isDesc) {
			sortedArr.sort((ob1, ob2) => {
				return (ob1[key] < ob2[key]) ? 1 : (ob1[key] > ob2[key]) ? -1 : 0;
			});
		} else {
			sortedArr.sort((ob1, ob2) => {
				return (ob1[key] < ob2[key]) ? -1 : (ob1[key] > ob2[key]) ? 1 : 0;
			});
		}
		
		return sortedArr;
	}
}